import { NextResponse } from 'next/server';

import { updateJobByOriginalVideoUrl } from '@/app/supabase-server';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const { originalVideoUrl, updatedFields } = await req.json();

  try {
    const jobs = await updateJobByOriginalVideoUrl(
      originalVideoUrl,
      updatedFields
    );

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false
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
      error
    });
  }
}
