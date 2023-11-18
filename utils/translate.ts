import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob, Transcript } from '@/types/db';

export default async function translate(job: Job, onFail: OnFailedJob) {
  try {
    const transcript = job.transcript! as Transcript;

    const text = transcript
      .map((item: { transcription: string }) => item.transcription.trim())
      .join(' ');

    console.log('utils/translate - text: ', text);

    const path = '/api/translate';
    const translation = await apiRequest(path, {
      text,
      language: job.target_language
    });

    console.log('utils/translate - translation: ', translation);

    const { data: translatedText } = translation;

    console.log('translatedText: ', translatedText);

    const updatedFields = {
      translated_text: translatedText
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
