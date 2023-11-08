import { getSession, getJobs } from '@/app/supabase-server';
import JobGrid from '@/components/feature-playground/ui/JobGrid';
import MediaInput from '@/components/feature-playground/ui/MediaInput';
import PageHeader from '@/components/ui/Display/PageHeader';
import { Flex, Stack } from '@chakra-ui/react';

export default async function HomePage() {
  // Grab data from db
  const session = await getSession();
  const jobs = session ? await getJobs(session?.user.id as string) : [];

  // Page content
  const title = `Video Translation`;
  const subtitle = `Translate any video to any language, with perfectly matched lip movements`;
  const tag = `Beta`;

  return (
    <Flex
      w="full"
      h="full"
      px={4}
      justifyContent="center"
      alignItems="center"
      color="white"
    >
      <Stack w="full" maxW="4xl" py={8} gap={8}>
        <PageHeader
          title={title}
          subtitle={subtitle}
          tag={tag}
          className="items-center text-center"
        />
        <MediaInput session={session} />
        {jobs && <JobGrid jobs={jobs} />}
      </Stack>
    </Flex>
  );
}
