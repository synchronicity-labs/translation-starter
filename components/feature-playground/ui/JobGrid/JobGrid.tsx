'use client';

import JobGridItem from './JobGridItem';
import JobGridLoading from './JobGridLoading';
import PageNavigator from '@/components/ui/PageNavigator';
import useJobData from '@/hooks/useJobData';
import { Job } from '@/types/db';
import { sortByCreatedAt } from '@/utils/helpers';
import { Stack, Flex, Grid } from '@chakra-ui/react';
import { FC, useState } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
  userId: string;
}

const JobGrid: FC<Props> = ({ userId }) => {
  const { jobs, loading, error } = useJobData(userId);

  const pageSize = 6;
  const [offset, setOffset] = useState(0);

  if (loading) {
    return <JobGridLoading />;
  }

  if (error) {
    return <div>Error fetching jobs</div>;
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
};

export default JobGrid;
