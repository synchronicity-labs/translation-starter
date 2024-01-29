const CONRCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '1');

import { createClient } from '@supabase/supabase-js';

import { inngest } from '@/inngest/client';
import cloneVoice from '@/utils/clone-voice';
import deleteVoice from '@/utils/deleteVoice';
import synchronize from '@/utils/synchronize';
import synthesisSpeech from '@/utils/sythesis-speech';
import transcribeAndTranslate from '@/utils/transcribeAndTranslate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const getLatestJob = async (jobId: string) => {
  const { data: fetchedJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .neq('is_deleted', true);

  if (fetchError) {
    console.error('Failed to fetch job');
    throw fetchError;
  }

  if (!fetchedJobs || fetchedJobs.length === 0) {
    console.error('Job not found');
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
      console.error('Failed to process job', data, error);

      const job = await getLatestJob(data.jobId);
      console.log('Deleting voice on failure');
      await deleteVoice(job);
      console.log('Deleted voice on failure');
    }
  },
  { event: 'jobs.submitted' },
  async ({ event, step }) => {
    const data: {
      jobId: string;
      videoUrl: string;
      audioUrl: string;
    } = event.data;

    console.log('Processing job:', data);

    let job = await getLatestJob(data.jobId);
    if (job.status === 'completed') {
      console.log('Job already completed');
      return { event };
    }

    // Assume job is in "uploaded" state
    try {
      console.log('transcribing');
      const { transcription_id } = await transcribeAndTranslate(job);
      console.log('Transcription ID', transcription_id);

      console.log('updating job with transcription id');
      await updateJob(data.jobId, {
        transcription_id,
        status: 'transcribing'
      });

      let attempts = 0;
      const transcriptReady = false;
      do {
        console.log('checking for transcript');
        job = await getLatestJob(data.jobId);
        if (job.transcript) {
          console.log('We got the transcript!');
          break;
        }

        attempts += 1;
        console.log("not ready yet, let's wait, attempt #", attempts);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } while (!transcriptReady);

      console.log('transcribed');
      await step.sleep('waiting-for-transcript', '2s');
    } catch (err) {
      console.error('Failed to transcribe and translate');
      throw err;
    }

    console.log('Updating state to cloning');
    await updateJob(data.jobId, {
      status: 'cloning'
    });
    console.log('Updated state to cloning');

    job = await getLatestJob(data.jobId);

    try {
      const fields = await cloneVoice(job);
      await updateJob(data.jobId, fields);
    } catch (err) {
      console.error('Failed to clone voice');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'synthesizing'
    });

    // get the voice ID and transcription in the job variable
    job = await getLatestJob(data.jobId);

    try {
      console.log('synthesizing speech', job);
      const fields = await synthesisSpeech(job);
      await updateJob(data.jobId, fields);
    } catch (err) {
      console.error('Failed to synthesize speech');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'synchronizing'
    });

    job = await getLatestJob(data.jobId);
    try {
      await synchronize(job);
    } catch (err) {
      console.error('Failed to synchronize');
      throw err;
    }

    await updateJob(data.jobId, {
      status: 'completed'
    });

    await deleteVoice(job);

    return { event };
  }
);
