import { updateJob } from '@/app/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const { jobId, updatedFields } = await req.json();

  try {
    const jobs = await updateJob(jobId, updatedFields);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Error updating job`
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
