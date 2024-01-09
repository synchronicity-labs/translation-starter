import { getJobs } from '@/app/supabase-server';
import { Job } from '@/types/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  try {
    const jobs = await getJobs();

    console.log('api/db/jobs: ', jobs?.length);

    if (!jobs) {
      return NextResponse.json({
        success: false,
        message: `Error fetching jobs`
      });
    }

    const jobsToReturn = jobs.filter((job) => !job.is_deleted);

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
