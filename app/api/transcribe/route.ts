import Replicate from 'replicate';

export async function POST(req: Request) {
  console.log('starting transcription');
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  try {
    const { audioUrl } = await req.json();
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    });
    const data = await replicate.run(
      'carnifexer/whisperx:1e0315854645f245d04ff09f5442778e97b8588243c7fe40c644806bde297e04',
      {
        input: {
          audio: audioUrl, // Use the S3 URL of the uploaded file
          debug: true,
          only_text: false,
          batch_size: 16,
          align_output: true
        }
      }
    );
    console.log('transcription - data: ', data);
    return new Response(JSON.stringify({ data }), {
      status: 200
    });
  } catch (err: any) {
    console.log(err);
    return new Response(
      JSON.stringify({ error: { statusCode: 500, message: err.message } }),
      { status: 500 }
    );
  }
}
