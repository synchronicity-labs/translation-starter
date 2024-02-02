import FormData from 'form-data';
import fetch from 'node-fetch';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const l = new SynchronicityLogger({
  name: 'api/clone-voice/route'
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { id, audioUrl } = await req.json();
  const logger = l.getSubLogger({
    name: `voiceId-${id}`
  });

  logger.log('Fetching audio file at URL' + audioUrl);
  const audioFile = await fetch(audioUrl);
  logger.log('Got response from audio file fetch');

  if (!audioFile.ok) {
    const errorText = await audioFile.text();
    logger.error(
      `Failed to fetch audio file: - status=${audioFile.status} - status-text=${audioFile.statusText} - text=${errorText}`
    );
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }

  const formData = new FormData();
  formData.append('name', `voice-${id}`);
  formData.append('description', `Voice for job ${id}`);
  formData.append('files', audioFile.body, {
    filename: `voice-${id}.mp3`,
    contentType: 'audio/mp3'
  });

  logger.log('Calling Eleven Labs API to clone voice');
  const voiceClone = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
    },
    body: formData
  });
  logger.log('Got response from Eleven Labs API when cloning voice');

  if (!voiceClone.ok) {
    const errorResponse = await voiceClone.text(); // Get the detailed error message
    logger.error(
      `Failed to clone voice: ${voiceClone.status} ${voiceClone.statusText}`,
      errorResponse
    );
    const data = {
      voice_id: process.env.NEXT_PUBLIC_VOICE_OVERRIDE_ID
    };
    return new Response(JSON.stringify({ data }), {
      status: 200
    });
  }

  logger.log('Parsing response from Eleven Labs API');
  const data = await voiceClone.json();
  logger.log('Parsed response from Eleven Labs API');

  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}
