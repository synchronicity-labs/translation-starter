import fetch, { FormData } from 'node-fetch';

import { exists, isValidUrl } from '@/utils/helpers';

export async function POST(req: Request) {
  // Ensure the API key is set
  const gladiaApiKey = process.env.GLADIA_API_KEY;
  if (!gladiaApiKey) {
    return new Response(
      JSON.stringify({
        error: { statusCode: 500, message: 'Server configuration error' }
      }),
      { status: 500 }
    );
  }

  // Ensure the method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { url, targetLanguage } = await req.json();

  // Check if the input values exist
  if (!exists(url) || !exists(targetLanguage)) {
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

  // Validate URLs after confirming they exist
  if (!isValidUrl(url)) {
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const webhook_url = `${baseUrl}/api/transcribe-and-translate/webhook`;

  // Try to send the request to Gladia
  try {
    const form = new FormData();
    form.append('audio_url', url);
    form.append('target_translation_language', targetLanguage);
    form.append('toggle_direct_translate', 'true');
    form.append('webhook_url', webhook_url);
    form.append('toggle_diarization', 'true');

    // Send the request to Gladia
    const response = await fetch(
      'https://api.gladia.io/audio/text/audio-transcription/',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'x-gladia-key': gladiaApiKey
        },
        body: form
      }
    );

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to transcribe audio to text: ${response.status} ${response.statusText}`
      );
      return new Response(
        JSON.stringify({
          error: { statusCode: response.status, message: errorText }
        }),
        {
          status: response.status
        }
      );
    }

    // Return the response
    const data = await response.json();

    return new Response(JSON.stringify({ data }), {
      status: 200
    });
  } catch (error) {
    // Handle unexpected , message
    console.error(`Unexpected error occurred: ${error}`);
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
