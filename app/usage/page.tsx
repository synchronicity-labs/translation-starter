import { getSession, getJobs } from '../supabase-server';
import UsageTable from '@/components/feature-usage/ui/UsageTable';
import PageHeader from '@/components/ui/Display/PageHeader';
import { Flex, Stack } from '@chakra-ui/react';
import { redirect } from 'next/navigation';

export default async function Usage() {
  // Grab data from db
  const session = await getSession();
  const jobs = await getJobs(session?.user.id as string);

  // Redirect user to signin if not signed in
  if (!session) {
    return redirect('/signin');
  }

  // Page content
  const title = `Usage`;

  return (
    <Flex w="full" px={4} justifyContent={'center'} color="white">
      <Stack w="full" maxW="4xl" py={8} gap={8}>
        <PageHeader title={title} />
        <UsageTable jobs={jobs} />
      </Stack>
    </Flex>
  );
}
