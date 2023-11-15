import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { text, voiceId } = await req.json();

  try {
    console.log(`starting speech synthesis on: ${text}`);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          accept: 'audio.mpeg',
          'content-type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
            style: 0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok || !response.body) {
      console.error(
        `Failed to convert text to speech: ${response.status} ${response.statusText}`
      );
      return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
        status: 500
      });
    }
    console.log('response: ', response.body);
    const data = response.body;

    const uuid = uuidv4();

    const tempDir = path.resolve('./temp/generated');
    await fsPromises.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `translated-audio-${uuid}.mp3`);
    const fileStream = createWriteStream(tempFilePath);

    for await (const chunk of data) {
      console.log('chunk: ', chunk);
      fileStream.write(chunk);
    }
    fileStream.end();

    const audioData = readFileSync(tempFilePath);

    const url = await new Promise<string>((resolve, reject) => {
      fileStream.on('finish', async function () {
        try {
          const params = {
            Bucket: 'synchlabs-public',
            Key: `/translation-test-input/translated-audio-${uuid}.mp3`, // This is what the file will be named in S3
            Body: audioData
          };
          const upload = await s3.upload(params).promise();
          resolve(upload.Location);
        } catch (error) {
          console.error('Error uploading audio to S3:', error);
          reject(error);
        }
      });
    });

    // Clean up temp files and directory
    await fsPromises.unlink(tempFilePath);
    await fsPromises.rm(tempDir, { recursive: true, force: true });

    return new Response(JSON.stringify({ data: url }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to convert text to speech: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
