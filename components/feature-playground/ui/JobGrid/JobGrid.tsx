'use client';

import JobGridItem from './JobGridItem';
import PageNavigator from '@/components/ui/PageNavigator';
import { Job } from '@/types/db';
import { sortByCreatedAt } from '@/utils/helpers';
import { Stack, Flex, Grid } from '@chakra-ui/react';
import { FC, useState } from 'react';

interface Props {
  jobs: Job[];
}

const JobGrid: FC<Props> = ({ jobs }) => {
  const pageSize = 6;
  const [offset, setOffset] = useState(0);

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
