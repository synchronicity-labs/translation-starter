import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function transcribeAndTranslateAudio(job: Job, onFail: OnFailedJob) {
  try {
    if (!job.original_audio_url || !job.target_language) {
        throw new Error('Job is missing required fields: audio_url or target_language');
    }
 
    const path = "/api/transcribe-translate";

    const translation = await apiRequest(path, {
        audio_url: job.original_audio_url,
        targetTranslationLanguage: job.target_language
    });

    const { data: translatedText } = translation;
    const updatedFields = {
        translated_text: translatedText
      };
  
    await updateJob(job, updatedFields, onFail);
    
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
    throw new Error(`Failed to transcribe and translate - ${errorMessage}`);
  }
}
