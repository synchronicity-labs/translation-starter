const CONRCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '1');

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
  await supabase
    .from('jobs')
    .update({ ...updatedFields })
    .eq('id', jobId)
    .select();
};

export const processJob = inngest.createFunction(
  {
    id: 'process-job',
    concurrency: CONRCURRENT_JOBS,
    retries: parseInt(process.env.MAX_JOB_RETRIES || '3') as any,

    // this will be used to determine if a job is a duplicate
    idempotency: 'event.data.jobId',

    onFailure: async ({ event, error }) => {
      // TODO: @Noah
      // delete the voice from 11labs
      // update the job to failed
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

    if (job.status === 'uploaded') {
      // Assume job is in "uploaded" state
      try {
        logger.log('transcribing');
        const { transcription_id } = await transcribeAndTranslate(job);
        logger.log('Transcription ID', transcription_id);

        logger.log('updating job with transcription id');
        await updateJob(data.jobId, {
          transcription_id,
          status: 'transcribing'
        });
      } catch (err) {
        logger.error('Failed to transcribe and translate');
        throw err;
      }
    }

    let attempts = 0;
    const transcriptReady = false;
    do {
      logger.log('checking for transcript');
      job = await getLatestJob(data.jobId);
      if (job.transcript) {
        logger.log('We got the transcript!');
        break;
      }

      attempts += 1;
      logger.log("not ready yet, let's wait, attempt #", attempts);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } while (!transcriptReady);

    logger.log('transcribed');

    logger.log('Updating state to cloning');
    await updateJob(data.jobId, {
      status: 'cloning'
    });
    logger.log('Updated state to cloning');

    job = await getLatestJob(data.jobId);

    try {
      const fields = await cloneVoice(job);
      await updateJob(data.jobId, fields);
    } catch (err) {
      logger.error('Failed to clone voice');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'synthesizing'
    });

    // get the voice ID and transcription in the job variable
    job = await getLatestJob(data.jobId);

    try {
      logger.log('synthesizing speech', job);
      const fields = await synthesisSpeech(job);
      await updateJob(data.jobId, fields);
    } catch (err) {
      logger.error('Failed to synthesize speech');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'synchronizing'
    });

    job = await getLatestJob(data.jobId);
    try {
      await synchronize(job);
    } catch (err) {
      logger.error('Failed to synchronize');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'completed'
    });

    await deleteVoice(job);

    return { event };
  }
);
