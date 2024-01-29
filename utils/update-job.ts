import { Job, OnFailedJob } from '@/types/db';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function updateJob(
  job: Job,
  updatedFields: any,
  onFail?: OnFailedJob
) {
  console.log('******updating job', job.id, updatedFields);
  const updateJob = await fetch(`${TRANSLATION_API}/api/db/update-job`, {
    method: 'POST',
    body: JSON.stringify({
      jobId: job.id,
      updatedFields
    })
  });
  console.log('******updateJob');

  if (!updateJob.ok) {
    onFail && onFail(job.id, `Failed to update job`);
    return;
  }
}
