import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function transcribeAndTranslate(
  job: Job,
  onFail: OnFailedJob
) {
  try {
    const path = '/api/transcribe-and-translate';
    const result = await apiRequest(path, {
      url: job.original_audio_url,
      targetLanguage: job.target_language
    });

    const { data } = await result;

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
