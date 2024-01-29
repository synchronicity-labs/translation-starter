'use client';

import { FC } from 'react';

import { useRouter } from 'next/navigation';

import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';

import VideoPlayer from '@/components/ui/VideoPlayer';

interface Props {}

const Header: FC<Props> = () => {
  const router = useRouter();
  const title = `Translation AI`;
  const subtitle = `Lip-synced Language Translation at Your Fingertips`;
  return (
    <Flex
      gap="8"
      px={8}
      py="16"
      alignItems={['start', 'start', 'start', 'center']}
      direction={['column', 'column', 'column', 'row']}
    >
      <Stack textColor={'white'} w="full">
        <Text fontSize="5xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="lg" color="gray.50">
          {subtitle}
        </Text>
        <Flex justifyContent={['center', 'center', 'center', 'start']} pt={4}>
          <Button onClick={() => router.push('/signin')} w="fit">
            Get started today
          </Button>
        </Flex>
      </Stack>
      <Box w="full" h="full" bg="whiteAlpha.300" rounded="md">
        <VideoPlayer
          url="https://synchlabs-public.s3.us-west-2.amazonaws.com/david_demo_vid.mp4"
          preview
          overlay
          loop
          autoPlay
        />
      </Box>
    </Flex>
  );
};

export default Header;
