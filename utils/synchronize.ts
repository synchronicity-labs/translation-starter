import { Job } from '@/types/db';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const logger = new SynchronicityLogger({
  name: 'utils/synchronize'
});

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function synchronize(job: Job) {
  const path = `${TRANSLATION_API}/api/lip-sync`;
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoUrl: job.original_video_url,
      audioUrl: job.translated_audio_url
    })
  });
  if (!response.ok) {
    const text = await response.text();
    logger.error(`Failed to synchronize job ${job.id} - ${text}`);
    throw new Error(
      `HTTP error! Status: ${response.status} - ${response.statusText}`
    );
  }
}
