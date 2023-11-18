import apiRequest from './api-request';
import { Job, OnFailedJob } from '@/types/db';

export default async function synthesisSpeech(job: Job, onFail: OnFailedJob) {
  try {
    const path = '/api/speech-synthesis';
    const translation = await apiRequest(path, {
      method: 'POST',
      body: {
        text: job.translated_text,
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      }
    });

    const { data: translatedAudioUrl } = await translation.json();

    await apiRequest('/api/db/update-job', {
      method: 'POST',
      body: {
        jobId: job.id,
        updatedFields: {
          translated_audio_url: translatedAudioUrl
        }
      }
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
