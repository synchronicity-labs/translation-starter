import JobGridItem from './UsageTable';
import StatusTag from '@/components/ui/Display/StatusTag';
import PageNavigator from '@/components/ui/PageNavigator';
import { Job } from '@/types_db';
import { sortByCreatedAt } from '@/utils/helpers';
import supabase from '@/utils/supabase';
import {
  Button,
  Link,
  Stack,
  Flex,
  Grid,
  Text,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { Props } from 'next/script';
import { useState, useEffect, FC } from 'react';

const NoUsageView = () => {
  const message = `You haven't translated any videos yet`;
  const buttonLabel = `Translate your first video`;
  return (
    <Stack alignItems="center" gap={4}>
      <Text fontSize="2xl" fontWeight="medium">
        {message}
      </Text>
      <Button>
        <Link href="/">{buttonLabel}</Link>
      </Button>
    </Stack>
  );
};

export default function RealTimeUsageTable({ data }: { data: Job[] }) {
  const pageSize = 10;
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

  if (!jobs || !jobs.length) {
    return <NoUsageView />;
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
      <TableContainer>
        <Table colorScheme={'whiteAlpha'}>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th isNumeric>Credits</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortByCreatedAt(jobs)
              .slice(offset, offset + pageSize)
              .map((job: Job) => {
                const createdAt = DateTime.fromJSDate(
                  new Date(job.created_at)
                ).toFormat("MMM. d, yyyy 'at' h:mm a");
                const createdDate = DateTime.fromJSDate(
                  new Date(job.created_at)
                ).toFormat('MMM. d, yyyy');
                return (
                  <Tr key={job.id}>
                    <Td>
                      <Tooltip hasArrow label={createdAt}>
                        {createdDate}
                      </Tooltip>
                    </Td>
                    <Td>
                      <StatusTag status={job.status!} />
                    </Td>
                    <Td isNumeric>{job.credits}</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
