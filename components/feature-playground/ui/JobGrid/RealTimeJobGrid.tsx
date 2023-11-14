import JobGridItem from './JobGridItem';
import PageNavigator from '@/components/ui/PageNavigator';
import { Job } from '@/types_db';
import { sortByCreatedAt } from '@/utils/helpers';
import supabase from '@/utils/supabase';
import { Stack, Flex, Grid } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function RealTimeJobGrid({ data }: { data: Job[] }) {
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
            if (payload.new.is_deleted) {
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
