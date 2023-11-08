import StatusTag from '@/components/ui/Display/StatusTag';
import { Job } from '@/types_db';
import {
  Button,
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
import { FC } from 'react';

interface Props {
  jobs: Job[] | null;
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

const UsageTable: FC<Props> = ({ jobs }) => {
  if (!jobs || !jobs.length) {
    return <NoUsageView />;
  }
  return (
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
          {jobs?.map((job: Job) => {
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
  );
};

export default UsageTable;
