import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { languagesIso639 } from '@/data/iso-639-1-language-codes';
import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const logger = new SynchronicityLogger({
  name: 'api/transcribe-and-translate/webhook/route'
});

const getLatestJob = async (jobId: string) => {
  const { data: fetchedJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('transcription_id', jobId)
    .neq('is_deleted', true);

  if (fetchError) {
    logger.error('Failed to fetch job');
    throw fetchError;
  }

  if (!fetchedJobs || fetchedJobs.length === 0) {
    logger.error('Job not found');
    throw new Error('Job not found');
  }

  return fetchedJobs?.[0];
};

export async function OPTIONS(req: Request) {
  const data = await req.text();
  return new Response(JSON.stringify({ data }), {
    status: 200
  });
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const result = await req.json();

  if (!result) {
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }

  logger.log('GOT RESULT IN TRANSCRIBE WEBHOOK', result.request_id);
  const transcript = result.payload.prediction;

  const transalatedText = transcript
    .map((item: { transcription: string }) => item.transcription.trim())
    .join(' ');

  const sourceLanaugeCode = transcript[0].original_language;
  const sourceLanauge = languagesIso639.find(
    (item) => item.code === sourceLanaugeCode
  );
  const sourceLanguageName = sourceLanauge?.name || sourceLanaugeCode;

  const job = await getLatestJob(result.request_id);
  if (job.status !== 'transcribing') {
    return new Response(JSON.stringify({ error: { statusCode: 200 } }), {
      status: 200
    });
  }

  const update = {
    transcript,
    source_language: sourceLanguageName,
    translated_text: transalatedText,
    status: 'cloning'
  };
  logger.log(`Updating job with ID ${result.request_id}`, update);
  const { error } = await supabase
    .from('jobs')
    .update({
      ...update
    })
    .eq('transcription_id', result.request_id)
    .select();

  if (error) {
    logger.log('Failed to update job', error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  } else {
    logger.log('Updated job with ID', result.request_id);
  }

  return NextResponse.json({ success: true });
}
