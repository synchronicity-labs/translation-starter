import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function transcribe(job: Job, onFail: OnFailedJob) {
  console.log('in transcribe.ts - job: ', job);
  try {
    const path = '/api/transcribe';
    const transcription = await apiRequest(path, {
      url: job.original_audio_url
    });

    const { data } = await transcription;

    const updatedFields = {
      transcription_id: data.request_id
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
    throw new Error(`Failed to transcribe - ${errorMessage}`);
  }
}
