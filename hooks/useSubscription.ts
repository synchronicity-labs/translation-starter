'use client';

import { useSupabase } from '@/app/supabase-provider';
import { useEffect, useState } from 'react';

export const useSubscription = () => {
  const { supabase } = useSupabase();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, prices(*, products(*))')
          .in('status', ['trialing', 'active']);

        if (!isCancelled) {
          if (error) throw error;
          setSubscription(data ? data[0] : null);
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

    fetchSubscription();

    // Cleanup function to set isCancelled to true if the component unmounts
    return () => {
      isCancelled = true;
    };
  }, [supabase]);

  return { subscription, loading, error };
};
