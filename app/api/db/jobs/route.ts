import { NextResponse } from 'next/server';

import { getJobs } from '@/app/supabase-server';

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  try {
    const response = await getJobs();

    if (!response.success) {
      return NextResponse.json({
        success: false,
        message: `Error fetching jobs`,
        error: response.error
      });
    }

    const jobs = response.data;

    const jobsToReturn = jobs ? jobs.filter((job) => !job.is_deleted) : jobs;

    return NextResponse.json({
      success: true,
      data: jobsToReturn
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      message: `Error fetching jobs`,
      error
    });
  }
}
