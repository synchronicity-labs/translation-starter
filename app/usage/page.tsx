import { redirect } from 'next/navigation';

import { Flex, Stack } from '@chakra-ui/react';

import UsageTable from '@/components/feature-usage/ui/UsageTable';
import PageHeader from '@/components/ui/Display/PageHeader';

import { getSession } from '../supabase-server';

export default async function Usage() {
  // Grab data from db
  const session = await getSession();

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
        <UsageTable userId={session.user.id} />
      </Stack>
    </Flex>
  );
}
