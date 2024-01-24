import { NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  const data = await req.text();
  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const result = await req.json();

  if (!result) {
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }

  const transcript = result.payload.prediction;

  const text = transcript
    .map((item: { transcription: string }) => item.transcription.trim())
    .join(' ');

  const updateJobResponse = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }/api/db/update-job-by-transcription-id`,
    {
      method: 'POST',
      body: JSON.stringify({
        transcriptionId: result.request_id,
        updatedFields: {
          transcript,
          translated_text: text,
          source_language: transcript[0].original_language,
        }
      })
    }
  );

  if (!updateJobResponse.ok) {
    console.error(
      `Failed to update job status: ${updateJobResponse.status} ${updateJobResponse.statusText}`
    );
    return NextResponse.json({
      success: false,
      message: `Failed to update job status: ${updateJobResponse.status} ${updateJobResponse.statusText}`
    });
  }

  return NextResponse.json({ success: true });
}
