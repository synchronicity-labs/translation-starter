import { getSession, getJobs } from '@/app/supabase-server';
import JobGrid from '@/components/feature-playground/ui/JobGrid';
import MediaInput from '@/components/ui/MediaInput';
import { Flex, Heading, Stack, Tag, Text } from '@chakra-ui/react';

export default async function PricingPage() {
  const session = await getSession();
  const jobs = session ? await getJobs(session?.user.id as string) : [];

  const title = `Video Translation`;
  const subtitle = `Translate any video to any language, with perfectly matched lip movements`;

  return (
    <Flex w="full" px={4} justifyContent={'center'} color="white">
      <Stack w="full" maxW="4xl" py={8} gap={8}>
        <Stack w="full" textAlign="center" alignItems="center">
          <Flex alignItems="center" gap={2}>
            <Heading>{title}</Heading>
            <Tag className="uppercase" size="sm">
              Beta
            </Tag>
          </Flex>
          <Text alignSelf={'center'} fontWeight="medium" fontSize={'xl'}>
            {subtitle}
          </Text>
        </Stack>
        <Flex w="full" justifyContent={'center'}>
          <MediaInput session={session} />
        </Flex>
        {jobs && <JobGrid jobs={jobs} />}
      </Stack>
    </Flex>
  );
}
