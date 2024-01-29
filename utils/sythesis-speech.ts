import { Job } from '@/types/db';

import apiRequest from './api-request';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function synthesisSpeech(job: Job) {
  const path = `${TRANSLATION_API}/api/speech-synthesis`;
  const synthesis = await apiRequest(path, {
    text: job.translated_text,
    voiceId: job.voice_id || '9F4C8ztpNUmXkdDDbz3J'
  });

  const { data: translatedAudioUrl } = await synthesis;

  const updatedFields = {
    translated_audio_url: translatedAudioUrl
  };

  return updatedFields;
}
