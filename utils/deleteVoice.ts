import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function deleteVoice(job: Job) {
  // Don't delete the default voice
  if (job.voice_id && job.voice_id === 'JNMatQzwX6yZ3J1EZeo7') {
    return;
  }
  try {
    const path = `/api/delete-voice`;
    await apiRequest(path, { voiceId: job.voice_id });

    const updatedFields = {
      voice_id: null
    };

    await updateJob(job, updatedFields);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    console.error('Failed to delete voice: ', errorMessage);
  }
}
