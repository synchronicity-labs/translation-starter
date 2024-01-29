import { Job, OnFailedJob } from '@/types/db';

import apiRequest from './api-request';
import updateJob from './update-job';

const VOICE_OVERRIDE_ID = process.env.NEXT_PUBLIC_VOICE_OVERRIDE_ID;

export default async function cloneVoice(job: Job, onFail: OnFailedJob) {
  try {
    const path = '/api/clone-voice';
    const voiceClone = await apiRequest(path, {
      id: job.id,
      audioUrl: job.original_audio_url
    });

    const { data } = await voiceClone;

    const voiceIdToUse = VOICE_OVERRIDE_ID || data.voice_id;

    const updatedFields = {
      voice_id: voiceIdToUse
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const updatedFields = {
      voice_id: `9F4C8ztpNUmXkdDDbz3J`
    };
    await updateJob(job, updatedFields, onFail);
  }
}
