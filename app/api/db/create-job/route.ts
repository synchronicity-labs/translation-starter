import { NextResponse } from 'next/server';

import { insertJob } from '@/app/supabase-server';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  try {
    const jobs = await insertJob();

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Error creating job`
      });
    }

    const jobId = jobs[0].id;

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
