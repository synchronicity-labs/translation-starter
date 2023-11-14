import { S3 } from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 instance
const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION
});

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
    audioUrl = await new Promise<string>((resolve, reject) => {
      fileStream.on('finish', async () => {
        ffmpeg(tempVideoPath)
          .toFormat('mp3')
          .on('end', async () => {
            console.log('Finished converting video to audio');

            const audioData = readFileSync(tempAudioPath);

            const params = {
              Bucket: 'synchlabs-public',
              Key: `/translation-test-input/input-audio-${uuid}.mp3`, // This is what the file will be named in S3
              Body: audioData
            };

            const audioUpload = await s3.upload(params).promise();

            // Clean up temp files and directory
            await Promise.all([
              fsPromises.unlink(tempVideoPath),
              fsPromises.unlink(tempAudioPath)
            ]);
            await fsPromises.rm(tempDir, { recursive: true, force: true });

            resolve(audioUpload.Location);
          })
          .on('error', (error) => {
            console.error('Error converting video to audio:', error);
            reject(error);
          })
          .saveToFile(tempAudioPath);
      });
    });
    return NextResponse.json({
      success: true,
      data: audioUrl
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
