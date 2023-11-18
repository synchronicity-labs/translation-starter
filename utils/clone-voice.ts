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

    console.log('voiceId: ', data.voice_id);

    const updatedFields = {
      voice_id: data.voice_id
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
