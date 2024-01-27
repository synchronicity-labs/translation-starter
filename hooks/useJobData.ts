'use client';

import { useSupabase } from '@/app/supabase-provider';
import { Job, JobStatus } from '@/types/db';
import cloneVoice from '@/utils/clone-voice';
import deleteVoice from '@/utils/deleteVoice';
import synchronize from '@/utils/synchronize';
import synthesisSpeech from '@/utils/sythesis-speech';
import transcribeAndTranslate from '@/utils/transcribeAndTranslate';
import updateJob from '@/utils/update-job';
import { useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

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

  const toast = useToast();

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
  }, []);

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
  // useEffect(() => {
  //   for (const job of jobs) {
  //     switch (job.status) {
  //       case 'uploading':
  //         if (job.original_video_url && job.original_audio_url) {
  //           updateJob(job, { status: 'transcribing' }, () =>
  //             handleJobFailed(job.id, 'Failed to update job to transcribing')
  //           );
  //           transcribeAndTranslate(job, () =>
  //             handleJobFailed(job.id, 'Failed to transcribe and translate')
  //           );
  //         }
  //         break;
  //       case 'transcribing':
  //         if (job.transcript && job.transcription_id) {
  //           if (job.translated_text) {
  //             updateJob(job, { status: 'cloning' }, () =>
  //               handleJobFailed(
  //                 job.id,
  //                 'Failed to update job status to cloning'
  //               )
  //             );
  //             cloneVoice(job, () =>
  //               handleJobFailed(job.id, 'Failed to clone voice')
  //             );
  //           }
  //         }
  //         break;
  //       case 'cloning':
  //         if (job.voice_id) {
  //           updateJob(job, { status: 'synthesizing' }, () =>
  //             handleJobFailed(
  //               job.id,
  //               'Failed to update job status to synthesizing'
  //             )
  //           );
  //           synthesisSpeech(job, () =>
  //             handleJobFailed(job.id, 'Failed to synthesize speech')
  //           );
  //         }
  //         break;
  //       case 'synthesizing':
  //         if (job.translated_audio_url) {
  //           await updateJob(job, { status: 'synchronizing' }, () =>
  //             handleJobFailed(
  //               job.id,
  //               'Failed to update job status to synchronizing'
  //             )
  //           );
  //           synchronize(job, () =>
  //             handleJobFailed(job.id, 'Failed to synchronize')
  //           );
  //           deleteVoice(job);
  //         }
  //         break;
  //       case 'synchronizing':
  //         if (job.video_url) {
  //           updateJob(job, { status: 'completed' }, () =>
  //             handleJobFailed(
  //               job.id,
  //               'Failed to update job status to completed'
  //             )
  //           );
  //         }
  //         break;
  //       case 'completed':
  //       case 'failed':
  //         if (job.voice_id) {
  //           deleteVoice(job);
  //         }
  //       default:
  //         break;
  //     }
  //   }
  // }, [jobs]);

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

  useEffect(() => {
    const handleJobUpdate = async (job: Job, updatedFields: Partial<Job>) => {
      await updateJob(job, updatedFields);
    };

    const processJobs = async () => {
      for (const job of jobs) {
        try {
          switch (job.status) {
            case 'uploading':
              if (job.original_video_url && job.original_audio_url) {
                await handleJobUpdate(job, { status: 'transcribing' });
                await transcribeAndTranslate(job, () =>
                  handleJobFailed(job.id, 'Failed to transcribe and translate')
                );
              }
              break;
            case 'transcribing':
              if (
                job.transcript &&
                job.transcription_id &&
                job.translated_text
              ) {
                await handleJobUpdate(job, { status: 'cloning' });
                await cloneVoice(job, () =>
                  handleJobFailed(job.id, 'Failed to clone voice')
                );
              }
              break;
            case 'cloning':
              if (job.voice_id) {
                await handleJobUpdate(job, { status: 'synthesizing' });
                await synthesisSpeech(job, () =>
                  handleJobFailed(job.id, 'Failed to synthesize speech')
                );
              }
              break;
            case 'synthesizing':
              if (job.translated_audio_url) {
                await handleJobUpdate(job, { status: 'synchronizing' });
                await synchronize(job, () =>
                  handleJobFailed(job.id, 'Failed to synchronize')
                );
                await deleteVoice(job);
              }
              break;
            case 'synchronizing':
              if (job.video_url) {
                await handleJobUpdate(job, { status: 'completed' });
              }
              break;
            case 'completed':
            case 'failed':
              if (job.voice_id) {
                await deleteVoice(job);
              }
              break;
          }
        } catch (error) {
          // Error handling logic here if needed
        }
      }
    };

    processJobs();
  }, [
    jobs,
    handleJobFailed,
    updateJob,
    synchronize,
    deleteVoice,
    transcribeAndTranslate,
    cloneVoice,
    synthesisSpeech,
    toast
  ]);

  return { jobs, loading, error };
}
