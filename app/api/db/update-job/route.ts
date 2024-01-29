import { NextResponse } from 'next/server';

import { updateJob } from '@/app/supabase-server';
import { inngest } from '@/inngest/client';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const { jobId, updatedFields } = await req.json();
  const { status } = updatedFields;

  const { original_video_url, original_audio_url } = updatedFields;

  try {
    const jobs = await updateJob(jobId, updatedFields);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Error updating job`
      });
    }

    if (status === 'uploaded') {
      await inngest.send({
        name: 'jobs.submitted',
        data: {
          jobId,
          videoUrl: original_video_url,
          audioUrl: original_audio_url
        }
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
      message: `Error updating job`,
      error
    });
  }
}
