// import Replicate from 'replicate';

// export async function POST(req: Request) {
//   console.log('starting transcription');
//   if (req.method !== 'POST') {
//     return new Response('Method Not Allowed', {
//       headers: { Allow: 'POST' },
//       status: 405
//     });
//   }

//   try {
//     const { audioUrl } = await req.json();
//     const replicate = new Replicate({
//       auth: process.env.REPLICATE_API_TOKEN
//     });
//     const data = await replicate.run(
//       // 'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
//       'carnifexer/whisperx:1e0315854645f245d04ff09f5442778e97b8588243c7fe40c644806bde297e04',
//       {
//         input: {
//           audio: audioUrl, // Use the S3 URL of the uploaded file
//           only_text: false,
//           batch_size: 32,
//           align_output: true
//         }
//       }
//     );
//     console.log('transcription - data: ', data);
//     return new Response(JSON.stringify({ data }), {
//       status: 200
//     });
//   } catch (err: any) {
//     console.log(err);
//     return new Response(
//       JSON.stringify({ error: { statusCode: 500, message: err.message } }),
//       { status: 500 }
//     );
//   }
// }

import { createReadStream } from 'fs';
import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI();

async function writeToTempFile(url: string): Promise<string> {
  const uuid = uuidv4();
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`);
  }

  const tempDir = process.env.NEXT_PUBLIC_SITE_URL
    ? os.tmpdir()
    : path.resolve('./tmp');
  await fsPromises.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `input-audio-${uuid}.mp3`);

  // Create a write stream to the temporary file
  const fileStream = createWriteStream(tempFilePath);

  // Return a promise that resolves when the stream finishes or rejects on error
  return new Promise((resolve, reject) => {
    // Use the pipeline utility to pipe from the fetch response stream to the file stream
    pipeline(response.body!, fileStream, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tempFilePath);
    });
  });
}

export async function POST(req: Request) {
  console.log('starting transcription');
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { url } = await req.json();
  console.log('transcribe - url: ', url);

  return writeToTempFile(url)
    .then(async (tempFilePath) => {
      try {
        const transcription = await openai.audio.transcriptions.create({
          file: createReadStream(tempFilePath),
          model: 'whisper-1'
        });
        console.log('api/transcribe - transcription: ', transcription);
        return new Response(JSON.stringify({ data: transcription.text }), {
          status: 200
        });
      } catch (err: any) {
        console.log(
          `Failed to transcribe audio: ${err.statusCode} ${err.message}`,
          err
        );
        return new Response(
          JSON.stringify({ error: { statusCode: 500, message: err.message } }),
          { status: 500 }
        );
      }
    })
    .catch((err: Error) => {
      console.log(
        `Failed to write audio to temp file for transcribition: `,
        err
      );
      return new Response(
        JSON.stringify({ error: { statusCode: 500, message: err.message } }),
        { status: 500 }
      );
    });
}
