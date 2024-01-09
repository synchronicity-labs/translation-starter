import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function cloneVoice(job: Job, onFail: OnFailedJob) {
  try {
    const path = '/api/clone-voice';
    const voiceClone = await apiRequest(path, {
      id: job.id,
      audioUrl: job.original_audio_url
    });

    const { data } = await voiceClone;

    const updatedFields = {
      voice_id: data.voice_id
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const updatedFields = {
      voice_id: `9F4C8ztpNUmXkdDDbz3J`
    };
    await updateJob(job, updatedFields, onFail);
  }
}
