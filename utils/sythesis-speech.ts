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
  const result = await apiRequest(path, {
    id: job.id,
    text: job.translated_text,
    voiceId: job.voice_id || '9F4C8ztpNUmXkdDDbz3J'
  });
  logger.log(`called /api/speech-synthesis for job ${job.id}`);

  const { data } = await result;

  return {
    id: data.id,
    synthesizeId: data.synthesizeId,
    status: data.status
  };
}
