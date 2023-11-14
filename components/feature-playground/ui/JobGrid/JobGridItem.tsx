'use client';

import JobGridItemExpandedModal from './JobGridItemExpandedModal';
import StatusTag from '@/components/ui/Display/StatusTag';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { Job, Status } from '@/types_db';
import {
  AspectRatio,
  Box,
  Flex,
  GridItem,
  Spinner,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
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
        {['pending', 'processing'].includes(job.status as Status) ? (
          <Box width={'full'}>
            <AspectRatio ratio={16 / 9}>
              <Stack
                w="full"
                h="full"
                p={4}
                justifyContent={'start'}
                aspectRatio={'16/9'}
                bgColor={'blackAlpha.400'}
                bgGradient="linear(to-b, whiteAlpha.200, transparent)"
              >
                <Text fontWeight="bold" fontSize="sm">
                  Please wait while we generate your video.
                </Text>
                <Flex
                  w="full"
                  h="full"
                  justifyContent="center"
                  alignItems="center"
                  rounded="md"
                >
                  <Spinner />
                </Flex>
              </Stack>
            </AspectRatio>
          </Box>
        ) : (
          <VideoPlayer url={url} preview />
        )}
        <Text fontSize={'sm'}>{`Created ${elapsedTime}`}</Text>
        {job.status && <StatusTag status={job.status} />}
      </Stack>
      <JobGridItemExpandedModal job={job} isOpen={isOpen} onClose={onClose} />
    </GridItem>
  );
};

export default JobGridItem;
