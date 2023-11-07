'use client';

import JobGridItemExpandedModal from './JobGridItemExpandedModal';
import StatusTag from '@/components/ui/StatusTag';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { Job } from '@/types_db';
import { GridItem, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { FC, useState } from 'react';

interface Props {
  job: Job;
}

const JobGridItem: FC<Props> = ({ job }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [hovering, setHovering] = useState(false);

  const url = job.video_url || job.original_video_url || '';
  // Time since job was created
  const elapsedTime = DateTime.fromJSDate(
    new Date(job.created_at)
  ).toRelative();

  return (
    <GridItem
      w="full"
      key={job.id}
      cursor={'pointer'}
      rounded={'md'}
      position={'relative'}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={isOpen ? onClose : onOpen}
    >
      <Stack
        bgColor="whiteAlpha.200"
        border={'2px'}
        borderColor="whiteAlpha.400"
        transition="transform 0.2s"
        _hover={{ borderColor: 'whiteAlpha.800' }}
        rounded={'md'}
        p={2}
        position={'relative'}
        w="full"
      >
        <VideoPlayer url={url} preview />
        <Text fontSize={'sm'}>{`Created ${elapsedTime}`}</Text>
        {job.status && <StatusTag status={job.status} />}
      </Stack>
      <JobGridItemExpandedModal job={job} isOpen={isOpen} onClose={onClose} />
    </GridItem>
  );
};

export default JobGridItem;
