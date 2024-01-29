import { NextResponse } from 'next/server';

import { JobStatus } from '@/types/db';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: `Method not allowed` }), {
      status: 500
    });
  }

  const { result } = await req.json();

  try {
    const updateJobResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/api/db/update-job-by-original-video-url`,
      {
        method: 'POST',
        body: JSON.stringify({
          originalVideoUrl: result.originalVideoUrl,
          updatedFields: {
            video_url: result.url
          }
        })
      }
    );

    if (!updateJobResponse.ok) {
      console.error(
        `Failed to update job status: ${updateJobResponse.status} ${updateJobResponse.statusText}`
      );
      return new Response(
        JSON.stringify({
          message: `Failed to update job status: ${updateJobResponse.status} ${updateJobResponse.statusText}`
        }),
        {
          status: 500
        }
      );
    }

    const jobData = await updateJobResponse.json();

    return new Response(JSON.stringify({ data: jobData }), {
      status: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: `Error creating job` }), {
      status: 500
    });
  }
}
