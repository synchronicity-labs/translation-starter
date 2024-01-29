import { NextResponse } from 'next/server';

import { updateJobByTranscriptionId } from '@/app/supabase-server';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, message: `Method not allowed` });
  }

  const { transcriptionId, updatedFields } = await req.json();

  try {
    const updatedJob = await updateJobByTranscriptionId(
      transcriptionId,
      updatedFields
    );

    if (!updatedJob || updatedJob.length === 0) {
      return NextResponse.json({
        success: false
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedJob[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error
    });
  }
}
