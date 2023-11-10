import Replicate from 'replicate';

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      console.log('performing speech-to-text');
      // const { audio } = await req.json();
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      });
      const output = await replicate.run(
        'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
        {
          input: {
            audio:
              'https://synchlabs-public.s3.us-west-2.amazonaws.com/test-audio.mp3'
          }
        }
      );
      return new Response(JSON.stringify({ output }), {
        status: 200
      });
    } catch (err: any) {
      console.log(err);
      return new Response(
        JSON.stringify({ error: { statusCode: 500, message: err.message } }),
        {
          status: 500
        }
      );
    }
  } else {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }
}
