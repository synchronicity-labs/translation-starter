import { Job } from '@/types/db';

import apiRequest from './api-request';

const VOICE_OVERRIDE_ID = process.env.NEXT_PUBLIC_VOICE_OVERRIDE_ID;

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function cloneVoice(job: Job) {
  const path = `${TRANSLATION_API}/api/clone-voice`;
  const voiceClone = await apiRequest(path, {
    id: job.id,
    audioUrl: job.original_audio_url
  });

  const { data } = await voiceClone;

  const voiceIdToUse = VOICE_OVERRIDE_ID || data.voice_id;

  const updatedFields = {
    voice_id: voiceIdToUse
  };
  return updatedFields;
}
