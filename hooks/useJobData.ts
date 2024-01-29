'use client';

import { useSupabase } from '@/app/supabase-provider';
import { Job } from '@/types/db';
import { useEffect, useState } from 'react';

interface UseJobDataOutput {
  jobs: Job[];
  loading: boolean;
  error: unknown | null;
}

export default function useJobData(): UseJobDataOutput {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const { supabase } = useSupabase();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      const { data: fetchedJobs, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .neq('is_deleted', true);

      if (fetchError) {
        console.error('Error fetching jobs:', error);
        setError(fetchError);
      } else {
        setJobs(fetchedJobs || []);
      }
      setLoading(false);
    }

    fetchJobs();
  }, [error, supabase]);

  // Subscribe to changes to jobs table
  useEffect(() => {
    const channel = supabase
      .channel('realtime jobs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => {
          setJobs([...(jobs || []), payload.new as Job]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs' },
        (payload) => {
          setJobs((currentJobs) => {
            if (payload.new.is_deleted || payload.new.status === 'failed') {
              return currentJobs.filter((job) => job.id !== payload.new.id);
            }
            // Find the index of the job that has been updated.
            const jobIndex = currentJobs.findIndex(
              (job) => job.id === payload.new.id
            );

            // If the job doesn't exist, return the current state without any changes.
            if (jobIndex === -1) {
              return currentJobs;
            }

            // If the job does exist, create a new array with the updated job.
            const updatedJobs = [...currentJobs];
            updatedJobs[jobIndex] = payload.new as Job;

            // Return the updated jobs array.
            return updatedJobs;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, jobs]);

  return { jobs, loading, error };
}
