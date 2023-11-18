import apiRequest from './api-request';
import { Job, OnFailedJob } from '@/types/db';

export default async function transcribe(job: Job, onFail: OnFailedJob) {
  console.log('in transcribe.ts - job: ', job);
  try {
    const path = '/api/transcribe';
    const transcription = await apiRequest(path, {
      method: 'POST',
      body: { url: job.original_audio_url }
    });

    await apiRequest('/api/db/update-job', {
      method: 'POST',
      body: {
        jobId: job.id,
        updatedFields: {
          transcription_id: transcription.request_id
        }
      }
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
    throw new Error(`Failed to transcribe - ${errorMessage}`);
  }
}
