import { redirect } from 'next/navigation';

import { Flex, Stack } from '@chakra-ui/react';

import {
  getSession,
  getActiveProductsWithPrices,
  getSubscription,
  getCreditBalance
} from '@/app/supabase-server';
import SubscriptionDetails from '@/components/feature-subscription/ui/SubscriptionDetails/SubscriptionDetails';
import PageHeader from '@/components/ui/Display/PageHeader';
import Pricing from '@/components/ui/Display/Pricing';

export default async function Subscription() {
  // Grab data from db
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  // Redirect user to signin if not signed in
  if (!session) {
    return redirect('/signin');
  }

  // Page content
  const title = `Subscription`;

  return (
    <Flex w="full" px={4} justifyContent={'center'} color="white">
      <Stack w="full" maxW="4xl" py={8} gap={8}>
        <PageHeader title={title} />
        <SubscriptionDetails session={session} />
        <Pricing
          session={session}
          user={session?.user}
          products={products}
          subscription={subscription}
        />
      </Stack>
    </Flex>
  );
}
