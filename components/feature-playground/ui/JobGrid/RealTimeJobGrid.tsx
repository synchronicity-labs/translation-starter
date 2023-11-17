'use client';

import JobGridItem from './JobGridItem';
import PageNavigator from '@/components/ui/PageNavigator';
import { Job, JobStatus, Transcript } from '@/types/db';
import { sortByCreatedAt } from '@/utils/helpers';
import supabase from '@/utils/supabase';
import { Stack, Flex, Grid, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function RealTimeJobGrid({ data }: { data: Job[] }) {
  const toast = useToast();
  const pageSize = 6;
  const [offset, setOffset] = useState(0);
  const [jobs, setJobs] = useState<Job[]>(data);

  useEffect(() => {
    console.log('subscribing to realtime jobs');
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
  }, [supabase, jobs, setJobs]);

  useEffect(() => {
    console.log('in jobs ussEffect: ', jobs);

    const updateJob = async (
      jobId: string,
      updatedFields: any,
      errorMessage: string
    ) => {
      const updateJobToTranscribing = await fetch('/api/db/update-job', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          updatedFields
        })
      });

      if (!updateJobToTranscribing.ok) {
        handleJobFailed(jobId, errorMessage);
        return;
      }
    };

    for (const job of jobs) {
      switch (job.status) {
        // case 'transcribing':
        //   if (!job.transcript && !job.transcription_id) {
        //     console.log('intiating transcription');
        //     transcribe(job);
        //   }
        //   break;
        case 'uploading':
          if (job.original_video_url && job.original_audio_url) {
            // Update job status to transcribing
            updateJob(
              job.id,
              { status: 'transcribing' },
              'Failed to update job status to transcribing'
            );
            console.log('intiating transcription');
            transcribe(job);
          }
          break;
        // case 'translating':
        //   console.log('intiating translation');
        //   translateAndSynthesize(job);
        //   break;
        case 'transcribing':
          if (job.transcript && job.transcription_id) {
            updateJob(
              job.id,
              { status: 'translating' },
              'Failed to update job status to translating'
            );
            translateAndSynthesize(job);
          }

          break;
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
  };

  async function transcribe(job: Job) {
    const transcription = await fetch(`/api/transcribe`, {
      method: 'POST',
      body: JSON.stringify({
        url: job.original_audio_url
      })
    });

    if (!transcription.ok) {
      handleJobFailed(job.id, 'Failed to transcribe video.');
      return;
    }

    const transcriptionResult = await transcription.json();

    const updatedJobResponse = await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.id,
        updatedFields: {
          transcription_id: transcriptionResult.request_id
        }
      })
    });

    if (!updatedJobResponse.ok) {
      handleJobFailed(job.id, 'Failed to update job with transcription id.');
      return;
    }
  }

  async function translateAndSynthesize(job: Job) {
    const transcript = job.transcript! as Transcript;

    console.log('transcript: ', transcript);

    const text = transcript
      .map((item: { transcription: string }) => item.transcription.trim())
      .join(' ');

    console.log('text: ', text);

    const translation = await fetch(`/api/translate`, {
      method: 'POST',
      body: JSON.stringify({
        text,
        language: job.target_language
      })
    });

    if (!translation.ok) {
      handleJobFailed(job.id, 'Failed to translate video.');
      return;
    }

    const translationResult = await translation.json();

    const updatedJobTranslationResponse = await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.id,
        updatedFields: {
          status: 'synthesizing'
        }
      })
    });

    if (!updatedJobTranslationResponse.ok) {
      handleJobFailed(job.id, 'Failed to update job status to synthesizing.');
      return;
    }

    console.log('about to call api/speech-synthesis');
    const translatedAudio = await fetch(`/api/speech-synthesis`, {
      method: 'POST',
      body: JSON.stringify({
        text: translationResult.data,
        // voiceId: voiceId
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      })
    });

    if (!translatedAudio.ok) {
      handleJobFailed(job.id, 'Failed to synthesize translated audio.');
      return;
    }

    const { data: translatedAudioUrl } = await translatedAudio.json();
    console.log('translatedAudioUrl: ', translatedAudioUrl);

    const updatedJobSpeechSynthesisResponse = await fetch(
      '/api/db/update-job',
      {
        method: 'POST',
        body: JSON.stringify({
          jobId: job.id,
          updatedFields: {
            status: 'synchronizing',
            translated_audio_url: translatedAudioUrl
          }
        })
      }
    );

    if (!updatedJobSpeechSynthesisResponse.ok) {
      handleJobFailed(job.id, 'Failed to update job status to synchronizing.');
      return;
    }

    synchronize(job.id, job.original_video_url!, translatedAudioUrl);
  }

  async function synchronize(
    jobId: string,
    videoUrl: string,
    audioUrl: string
  ) {
    const synchronize = await fetch(`/api/lip-sync`, {
      method: 'POST',
      body: JSON.stringify({
        videoUrl,
        audioUrl
      })
    });

    if (!synchronize.ok) {
      handleJobFailed(jobId, 'Failed to synchronize speech.');
      return;
    }

    const { data } = await synchronize.json();

    const updatedJob = await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: jobId,
        updatedFields: {
          credits: data.credits_deducted
        }
      })
    });

    if (!updatedJob.ok) {
      handleJobFailed(jobId, 'Failed to update job with transcription id.');
      return;
    }
  }

  const numJobs = jobs.length;
  const pages = Math.ceil(numJobs / pageSize);

  return (
    <Stack w="full">
      <Flex justifyContent={'end'}>
        {pages > 1 && (
          <PageNavigator
            offset={offset}
            setOffset={setOffset}
            pageSize={pageSize}
            pages={pages}
          />
        )}
      </Flex>
      <Grid
        templateColumns={[
          'repeat(1, 1fr)',
          'repeat(2, 1fr)',
          'repeat(2, 1fr)',
          'repeat(3, 1fr)'
        ]}
        gap={4}
        w={'100%'}
      >
        {sortByCreatedAt(jobs)
          .slice(offset, offset + pageSize)
          .map((job: Job) => {
            return <JobGridItem key={job.id} job={job} />;
          })}
      </Grid>
    </Stack>
  );
}
