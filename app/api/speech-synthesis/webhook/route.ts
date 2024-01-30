import { createClient } from '@supabase/supabase-js';

import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';

const logger = new SynchronicityLogger({
  name: 'api/lip-sync/webhook'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// const getLatestJob = async (jobId: string) => {
//   const { data: fetchedJobs, error: fetchError } = await supabase
//     .from('jobs')
//     .select('*')
//     .eq('original_video_url', jobId)
//     .neq('is_deleted', true);

//   if (fetchError) {
//     logger.error('Failed to fetch job');
//     throw fetchError;
//   }

//   if (!fetchedJobs || fetchedJobs.length === 0) {
//     logger.error('Job not found');
//     throw new Error('Job not found');
//   }

//   return fetchedJobs?.[0];
// };

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: `Method not allowed` }), {
      status: 500
    });
  }

  // console.log('Raw request body:', await req.text()); // Temporarily log raw body for debugging

  // const data = await req.json();
  const id = req.headers.get('X-JOB-ID');
  const data = req.body;
  logger.log('GOT RESULT IN SPEECH SYNTHESIS WEBHOOK', data);

  // const data = result.body;

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

  // const update = {
  //   transcript,
  //   source_language: sourceLanguageName,
  //   translated_text: transalatedText,
  //   status: 'cloning'
  // };
  // logger.log(`Updating job with ID ${result.request_id}`, update);
  // const { error } = await supabase
  //   .from('jobs')
  //   .update({
  //     ...update
  //   })
  //   .eq('transcription_id', result.request_id)
  //   .select();

  // if (error) {
  //   logger.log('Failed to update job', error);
  //   return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
  //     status: 500
  //   });
  // } else {
  //   logger.log('Updated job with ID', result.request_id);
  // }

  // const updatedFields = {
  //   translated_audio_url: translatedAudioUrl
  // };

  // return new Response(JSON.stringify({ data: url }), {
  //   status: 200
  // });
}

// const job = await getLatestJob(result.originalVideoUrl);
// if (job.status !== 'synchronizing') {
//   return new Response(JSON.stringify({ error: { statusCode: 200 } }), {
//     status: 200
//   });
// }

// const { id, url } = result;
// logger.log('Updating job', {
//   jobId: id
// });

// const { error } = await supabase
//   .from('jobs')
//   .update({
//     status: 'completed',
//     video_url: url
//   })
//   .eq('original_video_url', result.originalVideoUrl)
//   .select();

// if (error) {
//   logger.error('Failed to update job', {
//     jobId: id,
//     error
//   });
//   throw error;
// }

// return new Response(JSON.stringify({}), {
//   status: 200
// });
// }
