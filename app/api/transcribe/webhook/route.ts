import { NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  const data = await req.text();
  console.log('transcribe/webhook - OPTIONS - data: ', data);
  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}

export async function POST(req: Request) {
  console.log('in transcribe/webhook');
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

  const updateJobResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/db/update-job-by-transcription-id`,
    {
      method: 'POST',
      body: JSON.stringify({
        transcriptionId: result.request_id,
        updatedFields: {
          transcript
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
