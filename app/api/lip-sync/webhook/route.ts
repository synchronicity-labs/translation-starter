import { SynchronicityLogger } from '@/lib/SynchronicityLogger';
import { createClient } from '@supabase/supabase-js';

const logger = new SynchronicityLogger({
  name: 'api/lip-sync/webhook'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const getLatestJob = async (jobId: string) => {
  const { data: fetchedJobs, error: fetchError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
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

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: `Method not allowed` }), {
      status: 500
    });
  }

  const { result } = await req.json();
  logger.log('GOT RESULT IN LIP SYNC WEBHOOK', result);

  const job = await getLatestJob(result.id);
  if (job.status !== 'synchronizing') {
    return new Response(JSON.stringify({ error: { statusCode: 200 } }), {
      status: 200
    });
  }

  const { id, url } = result;
  logger.log('Updating job', {
    jobId: id
  });

  const { error } = await supabase
    .from('jobs')
    .update({
      status: 'completed',
      video_url: url
    })
    .eq('id', id)
    .select();

  if (error) {
    logger.error('Failed to update job', {
      jobId: id,
      error
    });
    throw error;
  }

  return new Response(JSON.stringify({}), {
    status: 200
  });
}
