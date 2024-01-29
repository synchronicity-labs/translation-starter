import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import { Job } from '@/types/db';

import apiRequest from './api-request';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

const logger = new SynchronicityLogger({
  name: 'utils/sythesis-speech'
});

export default async function synthesisSpeech(job: Job) {
  const path = `${TRANSLATION_API}/api/speech-synthesis`;

  logger.log(`calling /api/speech-synthesis for job ${job.id}`);
  const synthesis = await apiRequest(path, {
    text: job.translated_text,
    voiceId: job.voice_id || '9F4C8ztpNUmXkdDDbz3J'
  });
  logger.log(`called /api/speech-synthesis for job ${job.id}`);

  const { data: translatedAudioUrl } = await synthesis;
  logger.log(
    `got translated audio url ${translatedAudioUrl} for job ${job.id}`
  );

  const updatedFields = {
    translated_audio_url: translatedAudioUrl
  };

  return updatedFields;
}
