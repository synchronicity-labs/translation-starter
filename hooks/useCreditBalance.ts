'use client';

import { useSupabase } from '@/app/supabase-provider';
import { useState, useEffect } from 'react';

interface Job {
  deduction: number;
  // Other job properties
}

interface CreditBalance {
  balance: number;
  outOf: number;
}

export const useCreditBalance = (): {
  creditBalance: CreditBalance;
  loading: boolean;
  error: any;
} => {
  const { supabase } = useSupabase();
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    balance: 0,
    outOf: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const calculateBalance = async () => {
      try {
        // Fetch subscription
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from('subscriptions')
            .select('*, prices(*, products(*))')
            .in('status', ['trialing', 'active']);

        if (subscriptionError) throw subscriptionError;

        const subscription = subscriptionData[0] || null;

        console.log('subscription: ', subscription);
        let periodStart: Date;
        let periodEnd: Date;

        const subscriptionCredits = subscription
          ? subscription.prices?.unit_amount || 0
          : 7500;

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

        if (!isCancelled) {
          setCreditBalance({
            balance: subscriptionCredits - totalDeductions,
            outOf: subscriptionCredits
          });
        }
      } catch (error: any) {
        if (!isCancelled) {
          setError(error);
          console.error('Error:', error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    calculateBalance();

    // Cleanup function to set isCancelled to true if the component unmounts
    return () => {
      isCancelled = true;
    };
  }, [supabase]);

  return { creditBalance, loading, error };
};
