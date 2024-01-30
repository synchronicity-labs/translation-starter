import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const logger = new SynchronicityLogger({
  name: 'api/lip-sync/webhook'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: `Method not allowed` }), {
      status: 500
    });
  }

  const id = req.headers.get('X-JOB-ID');
  const data = req.body;

  logger.log('Speech Synthesis webhook - data: ', data);

  const uuid = uuidv4();
  const tempDir =
    process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
      ? os.tmpdir()
      : path.resolve('./temp');

  logger.log(`Writing audio data to temp file`);
  await fsPromises.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `translated-audio-${uuid}.mp3`);
  const fileStream = createWriteStream(tempFilePath);

  if (!data) {
    logger.error('No data returned from Speech Synthesis API');
    return new Response(JSON.stringify({}), {
      status: 500
    });
  }

  for await (const chunk of data as any) {
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

  const { error } = await supabase
    .from('jobs')
    .update({
      translated_audio_url: url,
      status: 'synchronizing'
    })
    .eq('id', id)
    .select();

  if (error) {
    logger.error('Failed to update job', {
      jobId: id,
      error
    });
    throw error;
  }

  return new Response(JSON.stringify({}), {
    status: 200
  });
}
