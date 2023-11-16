import fetch, { FormData } from 'node-fetch';

export async function POST(req: Request) {
  console.log('start transcription');
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { url } = await req.json();

  const form = new FormData();
  form.append('audio_url', url);

  const response = await fetch(
    'https://api.gladia.io/audio/text/audio-transcription/',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-gladia-key': process.env.GLADIA_API_KEY as string
      },
      body: form
    }
  );

  if (!response.ok) {
    console.error(
      `Failed to transcribe audio to text: ${response.status} ${response.statusText}`
    );
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }

  const data = await response.json();

  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}
