import { JobStatus } from '@/types/db';
import { Database } from '@/types_db';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { cache } from 'react';

type Metadata = {
  credits: string;
};

export const createServerSupabaseClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: userDetails } = await supabase
      .from('users')
      .select('*')
      .single();
    return userDetails;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getSubscription() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .maybeSingle()
      .throwOnError();
    return subscription;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export const getActiveProductsWithPrices = async () => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
  }
  return data ?? [];
};

export async function getJobs() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    return jobs;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getJobsNotDeleted() {
  const supabase = createServerSupabaseClient();
  const user = await getUserDetails();
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user?.id as string)
      .neq('is_deleted', true)
      .order('created_at', { ascending: false });
    return jobs;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getJobsBetweenDates(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createServerSupabaseClient();
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return jobs;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getCreditBalance() {
  const subscription = await getSubscription();
  if (subscription) {
    const metadata: Metadata = subscription?.prices?.products
      ?.metadata as Metadata;
    const subscriptionCredits = Number(metadata?.credits);
    const jobs = await getJobsBetweenDates(
      subscription?.user_id as string,
      subscription?.current_period_start as string,
      subscription?.current_period_end as string
    );
    const creditsSpent = jobs
      ? jobs.reduce((sum, job) => sum + (job.credits || 0), 0)
      : 0;
    return {
      remaining: subscriptionCredits - creditsSpent,
      outOf: subscriptionCredits
    };
  }

  const credits = 300;
  const jobs = await getJobs();
  const creditsSpent = jobs
    ? jobs.reduce((sum, job) => sum + (job.credits || 0), 0)
    : 0;
  return {
    remaining: credits - creditsSpent,
    outOf: credits
  };
}

export async function insertJob() {
  const supabase = createServerSupabaseClient();
  const user = await getUserDetails();
  const jobData: {
    user_id: string;
    status: JobStatus;
  } = {
    user_id: user?.id as string,
    status: 'pending' as JobStatus
  };
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select();
  if (error) {
    console.log(error.message);
  }
  return data ?? [];
}

export async function updateJob(jobId: string, updatedFields: any) {
  const supabase = createServerSupabaseClient();
  try {
    const { data: updatedJob } = await supabase
      .from('jobs')
      .update({ ...updatedFields })
      .eq('id', jobId)
      .select();
    return updatedJob;
  } catch (error) {
    console.log('Error: ', error);
    return [];
  }
}

export async function updateJobByOriginalVideoUrl(
  originalVideoUrl: string,
  updatedFields: any
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseServiceRoleKey = process.env
    .SUPABASE_SERVICE_ROLE_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...updatedFields })
    .eq('original_video_url', originalVideoUrl)
    .select();

  if (error) {
    console.log(error.message);
  }
  return data ?? [];
}

export async function updateJobByTranscriptionId(
  transcriptionId: string,
  updatedFields: any
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseServiceRoleKey = process.env
    .SUPABASE_SERVICE_ROLE_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  try {
    const { data: updatedJob } = await supabase
      .from('jobs')
      .update({ ...updatedFields })
      .eq('transcription_id', transcriptionId)
      .select();

    return updatedJob;
  } catch (error) {
    console.log('Error: ', error);
    return [];
  }
}
