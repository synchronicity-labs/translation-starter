import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import { isValidUrl, exists } from '@/utils/helpers';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set');
}

const logger = new SynchronicityLogger({
  name: 'api/lip-sync/route'
});

const API_URL =
  process.env.NEXT_PUBLIC_SYNC_API_URL || 'https://api.synclabs.so';

export async function POST(req: Request) {
  // Ensure the API key is set
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

  // Ensure the method is POST
  if (req.method !== 'POST') {
    logger.error(`Method Not Allowed: ${req.method}`);
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { videoUrl, audioUrl } = await req.json();

  // Check if the values exist
  if (!exists(videoUrl) || !exists(audioUrl)) {
    logger.error('Missing videoUrl or audioUrl in the request body.');
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Missing videoUrl or audioUrl in the request body.'
        }
      }),
      { status: 400 }
    );
  }
  logger.log`Video and audio exist`;

  // Validate URLs after confirming they exist
  if (!isValidUrl(videoUrl) || !isValidUrl(audioUrl)) {
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Invalid URL provided'
        }
      }),
      { status: 400 }
    );
  }

  logger.log('Sending request to SyncLabs');
  try {
    // Send the request to SyncLabs
    // const response = await fetch(`https://api.synclabs.so/video`, {
    logger.log('Sending request to SyncLabs at ' + API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': syncLabsApiKey
      },
      body: JSON.stringify({
        audioUrl,
        videoUrl,
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
    logger.log('Returning response from SyncLabs');

    return new Response(JSON.stringify({ data }), {
      status: 200
    });
  } catch (error) {
    // Handle unexpected errors
    logger.error(`Unexpected error occurred: ${error}`);
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 500,
          message: 'Unexpected error occurred'
        }
      }),
      { status: 500 }
    );
  }
}
