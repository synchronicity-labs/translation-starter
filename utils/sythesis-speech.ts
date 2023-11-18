import apiRequest from './api-request';
import updateJob from './update-job';
import { Job, OnFailedJob } from '@/types/db';

export default async function synthesisSpeech(job: Job, onFail: OnFailedJob) {
  console.log('synthesisSpeech - job:', job);
  try {
    const path = '/api/speech-synthesis';
    const synthesis = await apiRequest(path, {
      text: job.translated_text,
      voiceId: '21m00Tcm4TlvDq8ikWAM'
    });

    const { data: translatedAudioUrl } = await synthesis;

    console.log('translatedAudioUrl: ', translatedAudioUrl);

    const updatedFields = {
      translated_audio_url: translatedAudioUrl
    };

    await updateJob(job, updatedFields, onFail);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    onFail(job.id, errorMessage);
  }
}
