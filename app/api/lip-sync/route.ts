import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }
  const { videoUrl, audioUrl } = await req.json();

  console.log('videoUrl: ', videoUrl);
  console.log('audioUrl: ', audioUrl);

  const response = await fetch(`https://staging-api.synclabs.org/video`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.SYNC_LABS_API_KEY as string
    },
    body: JSON.stringify({
      audioUrl,
      videoUrl,
      synergize: true,
      webhookUrl:
        'https://9e5a-2601-19c-4400-f7f0-00-4b36.ngrok-free.app/api/lip-sync/webhook'
    })
  });

  if (!response.ok || !response.body) {
    console.error(
      `Failed to lip sync video to audio: ${response.status} ${response.statusText}`
    );
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }

  const data = await response.json();
  console.log('data: ', data);

  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}
