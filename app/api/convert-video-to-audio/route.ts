import { insertBeforeDot, replaceFileExtension } from '@/utils/helpers';
import { S3 } from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, promises as fsPromises } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { tmpdir } from 'os';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';


// Initialize S3 instance
const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION
});

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const videoFile: File | null = data.get('file') as unknown as File;

  if (!videoFile) {
    return NextResponse.json({ success: false, message: `No video file found` });
  }

  const videoBytes = await videoFile.arrayBuffer();
  const videoBuffer = Buffer.from(videoBytes);
  const videoStream = createWriteStream(videoFile.name);

  const tempFilePath = path.join(tmpdir(), '')

  const { videoUrl } = await request.json();

  if (!videoUrl) {
    return NextResponse.json({ success: false, message: `No video URL found` });
  }
  
  const videoFileStream = createWriteStream(videoUrl);
  NextResponse.body.

  ffmpeg()


  const uuid = uuidv4();

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
    Key: insertBeforeDot(`/translation-test-input/${file.name}`, uuid),
    Body: buffer
  };

  let videoUpload: S3.ManagedUpload.SendData | undefined;
  // let audioUpload: S3.ManagedUpload.SendData | undefined;

  try {
    // Assign the result to the variable if the upload is successful
    videoUpload = await s3.upload(params).promise();
  } catch (error) {
    console.error(`Failed to upload video to AWS S3`, error);
    return NextResponse.json({
      success: false,
      message: `Failed to upload video to AWS S3`,
      error
    });
  }

  const videoUrl = videoUpload.Location;
  console.log('videoUrl: ', videoUrl);
  const audioChunks: Buffer[] = [];

  // Function for extracting audio from video and uploading audio file to AWS S3
  // Returns the audio URL
  // const extractAudioAndUpload = (): Promise<string> => {
  //   console.log('in extractAudioAndUpload');
  //   const fileName = insertBeforeDot(
  //     `/translation-test-input/${replaceFileExtension(file.name, `.mp3`)}`,
  //     uuid
  //   );
  //   const tempFilePath = join(tmpdir(), fileName);
  //   return new Promise((resolve, reject) => {
  //     ffmpeg(videoUrl)
  //       .toFormat('mp3')
  //       .save(tempFilePath)
  //       .on('end', async () => {
  //         console.log('finished extracting audio from video');
  //         const params = {
  //           Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
  //           Key: fileName,
  //           Body: createReadStream(tempFilePath)
  //         };

  //         try {
  //           console.log('Uploading audio to AWS S3');
  //           const audioUpload = await s3.upload(params).promise();
  //           await fsPromises.unlink(tempFilePath);
  //           console.log('Temporary file deleted:', tempFilePath);
  //           resolve(audioUpload.Location);
  //         } catch (error) {
  //           console.error(`Failed to upload audio from video to AWS S3`, error);
  //           reject(`Failed to upload audio from video to AWS S3: ${error}`);
  //         }
  //       })
  //       .on('error', (error) => {
  //         console.error('Failed to convert video to audio:', error);
  //         reject(`Failed to convert video to audio: ${error}`);
  //       });
  //   });
  // };

  try {
    console.log('Being extracting audio from video and uploading to AWS S3');
    const audioUrl = await extractAudioAndUpload();
    console.log('audioUrl: ', audioUrl);
    return NextResponse.json({ success: true, data: { videoUrl, audioUrl } });
  } catch (error) {
    console.error(
      `Failed to extract audio from video and upload to AWS S3`,
      error
    );
    return NextResponse.json({ success: false, message: error, error });
  }
}

// export async function POST(request: NextRequest) {

//   // Grab data from formData sent in request body
//   const data = await request.formData();

//   // Grab file from formData
//   const file: File | null = data.get('file') as unknown as File;

//   // Convert file to bytes and then to buffer
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   // Generate UUID for file name
//   const uuid = uuidv4();

//   // Create params for S3 upload

//   if (!file) {
//     return NextResponse.json({ success: false });
//   }
// }