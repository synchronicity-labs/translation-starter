import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function cloneVoice(job: Job, onFail: OnFailedJob) {
  console.log('cloneVoice - job:', job);
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
      voice_id: `YGU8zAIf0KdBdE5IYUGN`
    };
    await updateJob(job, updatedFields, onFail);
  }
}
