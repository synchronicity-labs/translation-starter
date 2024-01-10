import { Job, OnFailedJob } from '@/types/db';

export default async function updateJob(
  job: Job,
  updatedFields: any,
  onFail?: OnFailedJob
) {
  const updateJob = await fetch('/api/db/update-job', {
    method: 'POST',
    body: JSON.stringify({
      jobId: job.id,
      updatedFields
    })
  });
  if (!updateJob.ok) {
    onFail && onFail(job.id, `Failed to update job`);
    return;
  }
}
