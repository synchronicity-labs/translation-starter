import apiRequest from './api-request';
import { Job, OnFailedJob } from '@/types/db';

export default async function updateJob(
  job: Job,
  updatedFields: any,
  onFail: OnFailedJob
) {
  try {
    const path = '/api/db/update-job';
    await apiRequest(path, {
      method: 'POST',
      body: { jobId: job.id, updatedFields }
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
