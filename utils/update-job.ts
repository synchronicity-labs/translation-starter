import { Job, OnFailedJob } from '@/types/db';

export default async function updateJob(
  job: Job,
  updatedFields: any,
  onFail: OnFailedJob
) {
  console.log('in update-job.ts');
  const updateJob = await fetch('/api/db/update-job', {
    method: 'POST',
    body: JSON.stringify({
      jobId: job.id,
      updatedFields
    })
  });
  if (!updateJob.ok) {
    console.log('failed to update job.');
    onFail(job.id, `Failed to update job`);
    return;
  }

  console.log('job updated: ', updatedFields);
}
