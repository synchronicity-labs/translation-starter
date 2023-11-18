import apiRequest from './api-request';
import { Job, OnFailedJob, Transcript } from '@/types/db';

export default async function translate(job: Job, onFail: OnFailedJob) {
  try {
    const transcript = job.transcript! as Transcript;

    const text = transcript
      .map((item: { transcription: string }) => item.transcription.trim())
      .join(' ');

    const path = '/api/translate';
    const translation = await apiRequest(path, {
      method: 'POST',
      body: { text, language: job.target_language }
    });

    const { data: translatedText } = await translation.json();

    await apiRequest('/api/db/update-job', {
      method: 'POST',
      body: {
        jobId: job.id,
        updatedFields: {
          translated_text: translatedText
        }
      }
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
