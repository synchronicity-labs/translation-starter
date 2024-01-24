import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function transcribeAndTranslateAudio(job: Job, onFail: OnFailedJob) {
  try {
    if (!job.original_audio_url || !job.target_language) {
        throw new Error('Job is missing required fields: audio_url or target_language');
    }

    const audioUrl = job.original_audio_url; // Assuming job object has 'audio_url' field
    const targetTranslationLanguage = job.target_language; // Assuming job object has 'target_language' field
    const toggleDirectTranslate = true; // Enable direct translation
    const apiKey = 'XXXX'; // Replace with your actual API key

    const formData = new FormData();
    formData.append('audio_url', audioUrl);
    formData.append('target_translation_language', targetTranslationLanguage);
    formData.append('toggle_direct_translate', String(toggleDirectTranslate));

    const response = await fetch('https://api.gladia.io/audio/text/audio-transcription', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-gladia-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    // const updatedFields = {
    //   transcription_id: result.request_id, // Assuming the response includes a request_id
    //   translation_id: result.translation_id // Assuming the response includes a translation_id
    // };

    // await updateJob(job, updatedFields, onFail);
    // return result;
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
    throw new Error(`Failed to transcribe and translate - ${errorMessage}`);
  }
}
