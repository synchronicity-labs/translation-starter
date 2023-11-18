import apiRequest from './api-request';
import { Job, OnFailedJob } from '@/types/db';

export default async function synchronize(job: Job, onFail: OnFailedJob) {
  try {
    const path = `/api/lip-sync`;
    const synchronization = await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify({
        videoUrl: job.original_video_url,
        audioUrl: job.translated_audio_url
      })
    });

    const { data } = await synchronization.json();

    await apiRequest('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.id,
        updatedFields: {
          credits: data.credits_deducted
        }
      })
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
