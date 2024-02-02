const CONRCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '10');

import assert from 'assert';

import { createClient } from '@supabase/supabase-js';

import { inngest } from '@/inngest/client';
import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import cloneVoice from '@/utils/clone-voice';
import deleteVoice from '@/utils/deleteVoice';
import synchronize from '@/utils/synchronize';
import synthesisSpeech from '@/utils/sythesis-speech';
import transcribeAndTranslate from '@/utils/transcribeAndTranslate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const l = new SynchronicityLogger({
  name: 'process-job'
});

const getLatestJob = async (jobId: string) => {
  const { data: fetchedJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .neq('is_deleted', true);

  if (fetchError) {
    l.error('Failed to fetch job', {
      jobId,
      error: fetchError
    });
    throw fetchError;
  }

  if (!fetchedJobs || fetchedJobs.length === 0) {
    l.error('Job not found', {
      jobId
    });
    throw new Error('Job not found');
  }

  return fetchedJobs?.[0];
};

const updateJob = async (jobId: string, updatedFields: any) => {
  const { error } = await supabase
    .from('jobs')
    .update({ ...updatedFields })
    .eq('id', jobId)
    .select();
  if (error) {
    l.error('Failed to update job', {
      jobId,
      error
    });
    throw error;
  }
};

export const processJob = inngest.createFunction(
  {
    id: 'process-job',
    concurrency: {
      scope: 'fn',
      limit: CONRCURRENT_JOBS
    },
    retries: parseInt(process.env.MAX_JOB_RETRIES || '3') as any,

    // this will be used to determine if a job is a duplicate
    idempotency: 'event.data.jobId',

    onFailure: async ({ event, error }) => {
      const data: {
        jobId: string;
        videoUrl: string;
        audioUrl: string;
      } = event.data.event.data;
      l.error('Failed to process job', data, error);

      const job = await getLatestJob(data.jobId);
      l.log('Deleting voice on failure', {
        jobId: job.id
      });
      await deleteVoice(job);
      l.log('Deleted voice on failure', {
        jobId: job.id
      });

      await updateJob(data.jobId, {
        status: 'failed'
      });
    }
  },
  { event: 'jobs.submitted' },
  async ({ event, step }) => {
    const data: {
      jobId: string;
      videoUrl: string;
      audioUrl: string;
    } = event.data;

    const logger = l.getSubLogger({
      name: data.jobId
    });

    logger.log('Processing job:', data);

    let job = await getLatestJob(data.jobId);
    if (job.status === 'completed') {
      logger.log('Job already completed');
      return { event };
    }

    const hasVideoAndAudio = job.original_video_url && job.original_audio_url;
    if (!hasVideoAndAudio) {
      logger.error('Job does not have video and audio');
      return { event };
    }

    const hasTranscript = job.transcript;
    if (!hasTranscript && !job.transcription_id) {
      logger.log('transcribing');
      const { transcription_id } = await transcribeAndTranslate(job);
      logger.log('Transcription ID', transcription_id);

      logger.log('updating job with transcription id');
      await updateJob(data.jobId, {
        transcription_id,
        status: 'transcribing'
      });
    }

    job = await getLatestJob(data.jobId);
    assert(job.transcription_id, 'Job does not have transcription ID');
    if (job.transcription_id) {
      let attempts = 0;
      do {
        if (attempts > 50) {
          logger.error('Failed to get transcript');
          throw new Error('Failed to get transcript');
        }

        logger.log('checking for transcript');
        job = await getLatestJob(data.jobId);
        if (job.transcript) {
          logger.log('We got the transcript!');
          break;
        }

        attempts += 1;
        logger.log("not ready yet, let's wait, attempt #", attempts);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } while (true);
    }

    /**
     * uploaded -> transcribing -> transcribed -> cloning -> synthesizing -> synchronizing -> completed
     */

    l.log(`Job is in ${job.status} state after checking for transcriptions`);

    if (!job.voice_id && job.status === 'cloning') {
      try {
        const fields = await cloneVoice(job);
        await updateJob(data.jobId, {
          ...fields,
          status: 'synthesizing'
        });

        // get the voice ID and transcription in the job variable
        job = await getLatestJob(data.jobId);
      } catch (err) {
        logger.error('Failed to clone voice');
        throw err;
      }
    }

    if (!job.translated_audio_url && job.status === 'synthesizing') {
      try {
        logger.log('synthesizing speech');
        const fields = await synthesisSpeech(job);
        await updateJob(data.jobId, {
          ...fields,
          status: 'synchronizing'
        });

        job = await getLatestJob(data.jobId);
      } catch (err) {
        logger.error('Failed to synthesize speech');
        throw err;
      }
    }

    if (job.status === 'synchronizing') {
      await synchronize(job);
    }

    logger.log(`Job is in ${job.status} state, cleaning up`);

    if (job.voice_id) {
      await deleteVoice(job);
    }
    return { event };
  }
);
