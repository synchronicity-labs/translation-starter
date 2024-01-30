'use client';

import { FC, useState } from 'react';

import {
  Button,
  Flex,
  Link,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react';
import { DateTime } from 'luxon';

import StatusTag from '@/components/ui/Display/StatusTag';
import PageNavigator from '@/components/ui/PageNavigator';
import useJobData from '@/hooks/useJobData';
import { Job, JobStatus } from '@/types/db';
import { sortByCreatedAt } from '@/utils/helpers';

import UsageTableLoading from './UsageTableLoading';

interface Props {
  userId: string;
}

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

const UsageTable: FC<Props> = ({ userId }) => {
  const { jobs, loading, error } = useJobData();

  const pageSize = 10;
  const [offset, setOffset] = useState(0);

  if (loading) {
    return <UsageTableLoading />;
  }

  if (error) {
    return <div>Error fetching jobs</div>;
  }

  if (!jobs.length) {
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
                      <StatusTag status={job.status! as JobStatus} />
                    </Td>
                    <Td isNumeric>{job.credits || 0}</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default UsageTable;
