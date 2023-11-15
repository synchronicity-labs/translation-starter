// import supabase from '@/utils/supabase';
import supabase from '@/utils/supabase';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import { NextResponse } from 'next/server';
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
  const { videoUrl } = await req.json();
  let audioUrl: string;
  const uuid = uuidv4();

  // Create temporary directory and files for video and audio
  const tempDir = path.resolve('./temp');
  await fsPromises.mkdir(tempDir, { recursive: true });

  const tempVideoPath = path.join(tempDir, `input-video-${uuid}.mp4`);
  const tempAudioPath = path.join(tempDir, `input-audio-${uuid}.mp3`);

  // Download video from S3
  const response = await fetch(videoUrl);

  if (!response.ok)
    throw new Error(`Failed to fetch video: ${response.statusText}`);

  // Write video to temp file
  const fileStream = createWriteStream(tempVideoPath);
  response.body?.pipe(fileStream);

  // Convert video to audio and upload to S3
  try {
    const audioBuffer = await new Promise<String>((resolve, reject) => {
      fileStream.on('finish', async () => {
        ffmpeg(tempVideoPath)
          .toFormat('mp3')
          .on('end', async () => {
            console.log('Finished converting video to audio');

            const audioData = readFileSync(tempAudioPath);

            const filePath = `public/input-audio-${Date.now()}.mp3`;

            const { data, error } = await supabase.storage
              .from('translation')
              .upload(filePath, audioData, {
                contentType: 'audio/mp3',
                upsert: false
              });

            if (error) {
              console.error('Error uploading audio to S3:', error);
              reject(error);
            }

            if (!data) {
              console.error('No data returned from S3');
              reject('No data returned from S3');
            }

            const url = `${
              process.env.NEXT_PUBLIC_SUPABASE_URL
            }/storage/v1/object/public/translation/${data!.path}`;

            // Clean up temp files and directory
            await Promise.all([
              fsPromises.unlink(tempVideoPath),
              fsPromises.unlink(tempAudioPath)
            ]);
            await fsPromises.rm(tempDir, { recursive: true, force: true });

            // resolve(audioUpload.Location);
            resolve(url);
          })
          .on('error', (error) => {
            console.error('Error converting video to audio:', error);
            reject(error);
          })
          .saveToFile(tempAudioPath);
      });
    });

    console.log('audioBuffer: ', audioBuffer);
    return NextResponse.json({
      success: true,
      data: audioBuffer
    });
  } catch (error) {
    console.error('Error converting video to audio:', error);
    return NextResponse.json({
      success: false,
      message: `Error converting video to audio`,
      error
    });
  }
}
