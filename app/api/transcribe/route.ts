import { createReadStream } from 'fs';
import { createWriteStream, promises as fsPromises } from 'fs';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI();

// This function downloads the file from the URL and writes it to a temporary file
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  // Get the URL of the audio file from the request body
  const { url } = await req.json();

  // Download the audio file and write it to a temporary file
  // Then transcribe the temporary audio file
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
