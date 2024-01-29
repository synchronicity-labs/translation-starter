import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import os from 'os';
import path from 'path';

import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import { exists } from '@/utils/helpers';
import supabase from '@/utils/supabase';

const l = new SynchronicityLogger({
  name: 'api/speech-synthesis/route'
});

export async function POST(req: Request) {
  // Ensure the API key is set
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!elevenLabsApiKey) {
    return new Response(
      JSON.stringify({
        error: { statusCode: 500, message: 'Server configuration error' }
      }),
      { status: 500 }
    );
  }

  // Ensure the method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { text, voiceId } = await req.json();

  const logger = l.getSubLogger({
    name: `voiceId-${voiceId}`
  });

  // Check if the values exist
  if (!exists(text) || !exists(voiceId)) {
    logger.error('Missing text or voiceId in the request body.');
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Missing text or voiceId in the request body.'
        }
      }),
      { status: 400 }
    );
  }

  logger.log('Calling Eleven Labs API');
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        accept: 'audio.mpeg',
        'content-type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          use_speaker_boost: true
        }
      })
    }
  );

  // Handle errors
  if (!response.ok || !response.body) {
    const errorText = await response.text();
    logger.error(
      `Failed to convert text to speech: ${response.status} ${errorText}`
    );
    return new Response(
      JSON.stringify({
        error: {
          statusCode: response.status,
          message: errorText
        }
      }),
      { status: response.status }
    );
  }
  logger.log(`Received audio data from Eleven Labs API`);

  const data = response.body;

  const uuid = uuidv4();
  const tempDir =
    process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
      ? os.tmpdir()
      : path.resolve('./temp');

  logger.log(`Writing audio data to temp file`);
  await fsPromises.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `translated-audio-${uuid}.mp3`);
  const fileStream = createWriteStream(tempFilePath);

  for await (const chunk of data) {
    fileStream.write(chunk);
  }
  fileStream.end();
  logger.log(`Finished writing audio data to temp file`);

  logger.log(`Uploading audio to Supabase`);
  const url = await new Promise<string>(async (resolve, reject) => {
    fileStream.on('finish', async function () {
      try {
        const audioData = readFileSync(tempFilePath);
        const filePath = `public/output-audio-${Date.now()}.mp3`;
        const { data, error } = await supabase.storage
          .from('translation')
          .upload(filePath, audioData, {
            contentType: 'audio/mp3',
            upsert: false
          });

        if (error) {
          logger.error('Error uploading audio to Supabase:', error);
          reject(error);
        }

        if (!data) {
          logger.error('No data returned from Supabase');
          reject('No data returned from Supabase');
        }

        const url = `${
          process.env.NEXT_PUBLIC_SUPABASE_URL
        }/storage/v1/object/public/translation/${data!.path}`;
        resolve(url);
      } catch (error) {
        logger.error('Error uploading audio to Supabase:', error);
        reject(error);
      }
    });
  });
  logger.log(`Finished uploading audio to Supabase, url: ${url}`);

  // Clean up temp files and directory
  logger.log(`Cleaning up temp files and directory`);
  await fsPromises.unlink(tempFilePath);
  logger.log(`Finished cleaning up temp files and directory`);

  return new Response(JSON.stringify({ data: url }), {
    status: 200
  });
}
