import { S3 } from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, readFileSync } from 'fs';
import { promises as fsPromises } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 instance
const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION
});

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const data = await request.formData();
  console.log('data: ', data);
  const videoFile: File | null = data.get('file') as unknown as File;
  console.log('videoFile: ', videoFile);

  if (!videoFile) {
    return NextResponse.json({
      success: false,
      message: `No file found in request`
    });
  }

  const uuid = uuidv4();
  let videoUrl: string;

  const buffer = Buffer.from(await videoFile.arrayBuffer());

  // Video upload
  try {
    const params = {
      Bucket: 'synchlabs-public',
      Key: `/translation-test-input/input-video-${uuid}.mp4`, // This is what the file will be named in S3
      Body: buffer
    };

    const videoUpload = await s3.upload(params).promise();
    videoUrl = videoUpload.Location;

    const transcodeResponse = await fetch(
      `http://localhost:3000/api/transcode`,
      {
        method: 'POST',
        body: JSON.stringify({ videoUrl })
      }
    );

    if (!transcodeResponse.ok) {
      return NextResponse.json({
        success: false,
        message: `Error translating video file`,
        error: await transcodeResponse.json()
      });
    }

    const transcodeData = (await transcodeResponse.json()) as { data: string };

    console.log('upload-to-s3 - transcodeData: ', transcodeData);
    return NextResponse.json({
      success: true,
      message: `Successfully uploaded video file to S3`,
      data: { videoUrl, audioUrl: transcodeData.data }
    });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return NextResponse.json({
      success: false,
      message: `Error uploading video file to S3`,
      error
    });
  }
}
