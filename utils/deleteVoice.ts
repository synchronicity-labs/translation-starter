import { Job } from '@/types/db';

import apiRequest from './api-request';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

const VOICE_OVERRIDE_ID = process.env.NEXT_PUBLIC_VOICE_OVERRIDE_ID;

export default async function deleteVoice(job: Job) {
  if (job.voice_id === VOICE_OVERRIDE_ID) {
    return;
  }

  try {
    const path = `${TRANSLATION_API}/api/delete-voice`;
    await apiRequest(path, { voiceId: job.voice_id });
  } catch (error) {
    console.error('Failed to delete voice: ', error);
    throw error;
  }
}
