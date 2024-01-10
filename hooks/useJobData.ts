'use client';

import { Job, JobStatus } from '@/types/db';
import cloneVoice from '@/utils/clone-voice';
import deleteVoice from '@/utils/deleteVoice';
// import supabase from '@/utils/supabase';
import synchronize from '@/utils/synchronize';
import synthesisSpeech from '@/utils/sythesis-speech';
import transcribe from '@/utils/transcribe';
import translate from '@/utils/translate';
import updateJob from '@/utils/update-job';
import { useToast } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

interface UseJobDataOutput {
  jobs: Job[];
  loading: boolean;
  error: unknown | null;
}

export default function useJobData(userId: string): UseJobDataOutput {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const toast = useToast();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      const { data: fetchedJobs, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId) // Ensure `userId` is defined in your component
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
  }, [userId]);

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

  // Handle job status changes / logic
  useEffect(() => {
    for (const job of jobs) {
      switch (job.status) {
        case 'uploading':
          if (job.original_video_url && job.original_audio_url) {
            updateJob(job, { status: 'transcribing' }, () =>
              handleJobFailed(job.id, 'Failed to update job to transcribing')
            );
            transcribe(job, () =>
              handleJobFailed(job.id, 'Failed to transcribe')
            );
          }
          break;
        case 'transcribing':
          if (job.transcript && job.transcription_id) {
            updateJob(job, { status: 'translating' }, () =>
              handleJobFailed(
                job.id,
                'Failed to update job status to translating'
              )
            );
            translate(job, () =>
              handleJobFailed(job.id, 'Failed to translate')
            );
          }
          break;
        case 'translating':
          if (job.translated_text) {
            updateJob(job, { status: 'cloning' }, () =>
              handleJobFailed(job.id, 'Failed to update job status to cloning')
            );
            cloneVoice(job, () =>
              handleJobFailed(job.id, 'Failed to clone voice')
            );
          }
          break;
        case 'cloning':
          if (job.voice_id) {
            updateJob(job, { status: 'synthesizing' }, () =>
              handleJobFailed(
                job.id,
                'Failed to update job status to synthesizing'
              )
            );
            synthesisSpeech(job, () =>
              handleJobFailed(job.id, 'Failed to synthesize speech')
            );
          }
          break;
        case 'synthesizing':
          if (job.translated_audio_url) {
            updateJob(job, { status: 'synchronizing' }, () =>
              handleJobFailed(
                job.id,
                'Failed to update job status to synchronizing'
              )
            );
            synchronize(job, () =>
              handleJobFailed(job.id, 'Failed to synchronize')
            );
            deleteVoice(job);
          }
          break;
        case 'synchronizing':
          if (job.video_url) {
            updateJob(job, { status: 'completed' }, () =>
              handleJobFailed(
                job.id,
                'Failed to update job status to completed'
              )
            );
          }
          break;
        case 'completed':
        case 'failed':
          if (job.voice_id) {
            deleteVoice(job);
          }
        default:
          break;
      }
    }
  }, [jobs]);

  const handleJobFailed = async (jobId: string, errorMessage: string) => {
    await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId,
        updatedFields: {
          status: 'failed' as JobStatus
        }
      })
    });
    toast({
      title: 'Error occured while creating video',
      description: errorMessage,
      status: 'error',
      duration: null,
      isClosable: true
    });
    throw new Error(errorMessage);
  };

  return { jobs, loading, error };
}
