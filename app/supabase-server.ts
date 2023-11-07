import { Database } from '@/types_db';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
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

export async function getJobs(userId: string) {
  const supabase = createServerSupabaseClient();
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId);
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
  const user = await getUserDetails();
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

  const credits = 600;
  const jobs = await getJobs(user?.id as string);
  const creditsSpent = jobs
    ? jobs.reduce((sum, job) => sum + (job.credits || 0), 0)
    : 0;
  return {
    remaining: credits - creditsSpent,
    outOf: credits
  };
}
