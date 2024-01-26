'use client';

import { useSupabase } from '@/app/supabase-provider';
import { SubscriptionWithProduct } from '@/types/db';
import { useState, useEffect } from 'react';

interface CreditBalance {
  balance: number;
  outOf: number;
}

export const useCreditBalance = (
  subscription: SubscriptionWithProduct
): {
  creditBalance: CreditBalance;
  loading: boolean;
  error: any;
} => {
  console.log('subscription: ', subscription);
  const { supabase } = useSupabase();
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    balance: 0,
    outOf: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateBalance = async () => {
      let subscriptionCredits = 7500;
      if (subscription) {
        const metadata = subscription.prices?.products?.metadata as {
          credits: number;
        };
        subscriptionCredits = metadata?.credits || 7500;
      }
      try {
        // Fetch jobs
        const { data: jobs, error: jobsError } = subscription
          ? await supabase
              .from('jobs')
              .select('*')
              .gte('created_at', subscription.current_period_start)
              .lte('created_at', subscription.current_period_end)
          : await supabase.from('jobs').select('*');

        if (jobsError) throw jobsError;

        const totalDeductions = jobs.reduce(
          (sum, job) => sum + (job.credits || 0),
          0
        );

        setCreditBalance({
          balance: subscriptionCredits - totalDeductions,
          outOf: subscriptionCredits
        });
      } catch (error: any) {
        setError(error);
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateBalance();
  }, [supabase]);

  return { creditBalance, loading, error };
};
