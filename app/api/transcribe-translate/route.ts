import { exists, isValidUrl  } from '@/utils/helpers';
const axios = require('axios');
import FormData from 'form-data';

export async function POST(req: Request) {
  // Ensure the method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { targetTranslationLanguage, audio_url } = await req.json();

  // Check if the values exist
  if (!exists(targetTranslationLanguage) || !exists(audio_url)) {
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Missing AudioUrl or target language in the request body.'
        }
      }),
      { status: 400 }
    );
  }

  if (!isValidUrl(audio_url)) {
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

  try {
    const formData = new FormData();
    formData.append('audio_url', audio_url);
    formData.append('target_translation_language', "french");
    formData.append('toggle_direct_translate','true' );

    const response = await axios.post(
      'https://api.gladia.io/audio/text/audio-transcription/',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        //   'x-gladia-key': "9221d2bd-db1e-48bf-9be0-7be7b131a7c7"
        'x-gladia-key': process.env.GLADIA_API_KEY
        }
      }
    );
    console.log(response.data);
     // Return the response
     const data = await response.json();

     return new Response(JSON.stringify({ data }), {
       status: 200
     });
  } catch (error) {
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
