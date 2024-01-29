import { Job } from '@/types/db';

import apiRequest from './api-request';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function transcribeAndTranslate(job: Job) {
  const path = `${TRANSLATION_API}/api/transcribe-and-translate`;
  const result = await apiRequest(path, {
    url: job.original_audio_url,
    targetLanguage: job.target_language
  });

  const { data } = await result;

  return {
    transcription_id: data.request_id
  };
}
