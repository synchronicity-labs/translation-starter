import { Job } from '@/types/db';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const logger = new SynchronicityLogger({
  name: 'utils/synchronize'
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set');
}
const API_URL =
  process.env.NEXT_PUBLIC_SYNC_API_URL || 'https://api.synclabs.so/video';

export default async function synchronize(job: Job) {
  logger.log('Checking for SyncLabs API key');
  const syncLabsApiKey = process.env.SYNC_LABS_API_KEY;
  if (!syncLabsApiKey) {
    return new Response(
      JSON.stringify({
        error: { statusCode: 500, message: 'Server configuration error' }
      }),
      { status: 500 }
    );
  }
  logger.log('SyncLabs API key found');
  logger.log('Sending request to SyncLabs at ' + API_URL);
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': syncLabsApiKey
    },
    body: JSON.stringify({
      audioUrl: job.translated_audio_url,
      videoUrl: job.original_video_url,
      synergize: true,
      webhookUrl: `${baseUrl}/api/lip-sync/webhook`,
      model: 'sync-1.5-beta'
    })
  });
  logger.log('Response from SyncLabs received');

  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    logger.error(
      `Failed to lip sync video to audio: ${response.status} ${errorText}`
    );
    return new Response(
      JSON.stringify({
        error: {
          statusCode: response.status,
          message: errorText
        }
      }),
      { status: response.status }
    );
  }

  // Return the response
  const data = await response.json();
  // TODO: store the sync-labs job id in the database, so we can allow
  // users to poll the endpoint to check the status of the job
  // otherwise they hit http connection timeout errors
  logger.log('Job queued successfully');
}
