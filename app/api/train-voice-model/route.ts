import FormData from 'form-data';
import {
  createReadStream,
  createWriteStream,
  promises as fsPromises,
  readFileSync
} from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { audioUrl } = await req.json();
  // const { path } = await req.json();

  // Create temporary directory and files for video and audio
  // const tempDir = path.resolve('./temp');
  // await fsPromises.mkdir(tempDir, { recursive: true });

  const uuid = uuidv4();

  // Write audio to temp file
  // const fileStream = createWriteStream(tempAudioPath);
  // response.body?.pipe(fileStream);

  try {
    // Download audio from S3
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok || !audioResponse.body)
      throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);

    const audioBlob = await audioResponse.blob();

    console.log('audioBlob: ', audioBlob.stream);
    console.log('audioResponse.body: ', audioResponse.body);

    const formData = new FormData();
    formData.append('name', `test voice`);
    formData.append('files', audioBlob, 'voice.mp3');

    // console.log('formData: ', formData);

    const response = await fetch(`https://api.elevenlabs.io/v1/voices/add`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
      },
      body: formData
    });

    if (!response.ok) {
      console.error(
        `Failed to train voice model: ${response.status} ${response.statusText}`
      );
      return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
        status: 500
      });
    }

    console.log('response: ', response);

    // const data: any = await response.json();
    // const voiceId = data.voice_id;
    // console.log('voiceId: ', voiceId);
    return new Response(JSON.stringify({ data: 'test' }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to convert train voice model: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
