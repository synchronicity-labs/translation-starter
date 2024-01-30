import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import { exists } from '@/utils/helpers';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!baseUrl) {
  throw new Error('NEXT_PUBLIC_SITE_URL is not set');
}

const logger = new SynchronicityLogger({
  name: 'api/speech-synthesis/route'
});

const API_URL =
  process.env.NEXT_PUBLIC_SPEECH_SYNTHESIS_API_URL ||
  'https://api.synclabs.so/speech-synthesis';

export async function POST(req: Request) {
  // Ensure the API key is set
  logger.log('Checking for SyncLabs API key');
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!elevenLabsApiKey) {
    return new Response(
      JSON.stringify({
        error: { statusCode: 500, message: 'Server configuration error' }
      }),
      { status: 500 }
    );
  }
  logger.log('Eleven labs API key found');

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

  const { id, text, voiceId } = await req.json();

  // Check if the values exist
  if (!exists(text) || !exists(voiceId)) {
    logger.error('Missing text or voiceId in the request body.');
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Missing text or voiceId in the request body.'
        }
      }),
      { status: 400 }
    );
  }
  logger.log`Speech synthesis inputs exist`;
  logger.log('Sending request to SyncLabs speech-synthesis wrapper');

  try {
    logger.log('Sending request to SyncLabs at ' + API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': elevenLabsApiKey
      },
      body: JSON.stringify({
        id,
        text,
        voiceId,
        webhookUrl: `${baseUrl}/api/speech-synthesis/webhook`
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

export async function GET() {
  return new Response(JSON.stringify({ data: 'GOTTTEM' }), {
    status: 200
  });
}
