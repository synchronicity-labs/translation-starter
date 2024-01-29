import { Job } from '@/types/db';

import apiRequest from './api-request';

export default async function deleteVoice(job: Job) {
  try {
    const path = `/api/delete-voice`;
    await apiRequest(path, { voiceId: job.voice_id });
  } catch (error) {
    console.error('Failed to delete voice: ', error);
    throw error;
  }
}
