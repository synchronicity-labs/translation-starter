import { Job } from '@/types/db';

import apiRequest from './api-request';

const TRANSLATION_API = process.env.NEXT_PUBLIC_TRANSLATION_API;

export default async function synchronize(job: Job) {
  const path = `${TRANSLATION_API}/api/lip-sync`;
  const synchronization = await apiRequest(path, {
    videoUrl: job.original_video_url,
    audioUrl: job.translated_audio_url
  });

  await synchronization;

  return {};
}
