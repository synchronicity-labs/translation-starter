import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function synchronize(job: Job, onFail: OnFailedJob) {
  try {
    const path = `/api/lip-sync`;
    const synchronization = await apiRequest(path, {
      videoUrl: job.original_video_url,
      audioUrl: job.translated_audio_url
    });

    const { data } = await synchronization;

    const updatedFields = {
      credits: data.credits_deducted
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
