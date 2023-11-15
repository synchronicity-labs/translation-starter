import { insertJob } from '@/app/supabase-server';
import { NextResponse } from 'next/server';

// async function getMediaDuration(url: string): Promise<number> {
//   try {
//     return new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(url, (err, metadata) => {
//         if (err) {
//           reject(err);
//         } else if (metadata.format.duration !== undefined) {
//           resolve(metadata.format.duration);
//         } else {
//           reject(new Error('Duration is undefined'));
//         }
//       });
//     });
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

// TODO: Fix logic for getting video duration
export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const { userId, originalVideoUrl } = await req.json();

  try {
    console.log('creating job');
    console.log('userId: ', userId);
    console.log('originalVideoUrl: ', originalVideoUrl);
    // const duration = await getMediaDuration(originalVideoUrl);
    const duration = 0;
    const creditsToDeduct = Math.round(duration);

    const jobs = await insertJob(
      originalVideoUrl,
      creditsToDeduct,
      'processing'
    );

    console.log('jobs: ', jobs);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Error creating job`
      });
    }

    return NextResponse.json({
      success: true,
      data: jobs[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      message: `Error creating job`,
      error
    });
  }
}
