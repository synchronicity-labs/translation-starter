import { inngest } from './client';

const CONRCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '1');

export const processJob = inngest.createFunction(
  {
    id: 'process-job',
    concurrency: CONRCURRENT_JOBS,

    // TODO: decide if there should be retries
    // retries

    // this will be used to determine if a job is a duplicate
    idempotency: 'event.data.jobId'
  },
  { event: 'jobs.submitted' },
  async ({ event, step }) => {
    const data: {
      jobId: string;
      videoUrl: string;
      audioUrl: string;
    } = event.data;

    console.log('Processing job:', data);

    return { event, body: 'Hello, World!' };
  }
);
