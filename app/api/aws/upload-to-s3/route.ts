// import { insertBeforeDot } from '@/utils/helpers';
// import { S3 } from 'aws-sdk';
// import { NextRequest, NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';

// // Initialize S3 instance
// const s3 = new S3({
//   accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
//   secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
//   region: process.env.NEXT_PUBLIC_S3_REGION
// });

// export async function POST(request: NextRequest) {
//   const data = await request.formData();
//   const file: File | null = data.get('file') as unknown as File;

//   if (!file) {
//     return NextResponse.json({ success: false, message: `No file found` });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const uuid = uuidv4();

//   const params = {
//     Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
//     Key: insertBeforeDot(`/translation-test-input/${file.name}`, uuid),
//     Body: buffer
//   };

//   let videoUpload: S3.ManagedUpload.SendData | undefined;

//   try {
//     videoUpload = await s3.upload(params).promise();
//     return NextResponse.json({
//       success: true,
//       data: { videoUrl: videoUpload.Location }
//     });
//   } catch (error) {
//     console.error(`Failed to upload video to AWS S3`, error);
//     return NextResponse.json({
//       success: false,
//       message: `Failed to upload video to AWS S3`,
//       error
//     });
//   }
// }

import { insertBeforeDot, replaceFileExtension } from '@/utils/helpers';
import { S3 } from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { tmpdir } from 'os';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 instance
const s3 = new S3({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_S3_REGION
});

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: `No file found` });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uuid = uuidv4();

  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
    Key: insertBeforeDot(`/translation-test-input/${file.name}`, uuid),
    Body: buffer
  };

  let videoUpload: S3.ManagedUpload.SendData | undefined;

  try {
    videoUpload = await s3.upload(params).promise();
  } catch (error) {
    console.error(`Failed to upload video to AWS S3`, error);
    return NextResponse.json({
      success: false,
      message: `Failed to upload video to AWS S3`,
      error
    });
  }

  const stream = Readable.from(buffer);

  ffmpeg(stream).on('end', async () => {
    console.log('Finished converting video to audio');
  });
}

// import { insertBeforeDot, replaceFileExtension } from '@/utils/helpers';
// import { S3 } from 'aws-sdk';
// import ffmpeg from 'fluent-ffmpeg';
// import { createWriteStream, readFileSync } from 'fs';
// import { NextRequest, NextResponse } from 'next/server';
// import path from 'path';
// import { Readable } from 'stream';
// import { v4 as uuidv4 } from 'uuid';

// // Initialize S3 instance
// const s3 = new S3({
//   accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
//   secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
//   region: process.env.NEXT_PUBLIC_S3_REGION
// });

// export async function POST(request: NextRequest) {
//   const data = await request.formData();
//   const file: File | null = data.get('file') as unknown as File;

//   if (!file) {
//     return NextResponse.json({ success: false, message: `No file found` });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   const videoStream = new Readable({
//     read() {
//       this.push(buffer);
//     }
//   });

//   const uuid = uuidv4();
//   const videoFileName = insertBeforeDot(`${file.name}`, uuid);
//   const audioFileName = replaceFileExtension(videoFileName, '.mp3');

//   const params = {
//     Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
//     Key: videoFileName,
//     Body: buffer
//   };

//   let videoUpload: S3.ManagedUpload.SendData | undefined;

//   try {
//     videoUpload = await s3.upload(params).promise();
//   } catch (error) {
//     console.error(`Failed to upload video to AWS S3`, error);
//     return NextResponse.json({
//       success: false,
//       message: `Failed to upload video to AWS S3`,
//       error
//     });
//   }

//   const videoUrl = videoUpload.Location;
//   const tempDir = path.resolve('./temp');
//   const tempVideoFilePath = path.join(tempDir, videoFileName);
//   const tempAudioFilePath = path.join(tempDir, audioFileName);

//   // const videoStream = createWriteStream(videoUrl);
//   videoStream.on('finish', async () => {
//     ffmpeg(tempVideoFilePath)
//       .toFormat('mp3')
//       .on('end', async () => {
//         const audioData = readFileSync(tempAudioFilePath);
//         const params = {
//           Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
//           Key: audioFileName,
//           Body: audioData
//         };
//         try {
//           const audioUrl = (await s3.upload(params).promise()).Location;
//           return NextResponse.json({
//             success: true,
//             data: { videoUrl, audioUrl }
//           });
//         } catch (error) {
//           return NextResponse.json({
//             success: false,
//             message: `Failed to upload audio from video to AWS S3`,
//             error
//           });
//         }
//       })
//       .save(tempAudioFilePath);
//   });
// }
