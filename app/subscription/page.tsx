import {
  getSession,
  getActiveProductsWithPrices,
  getSubscription,
  getCreditBalance
} from '@/app/supabase-server';
import SubscriptionDetails from '@/components/feature-subscription/ui/SubscriptionDetails/SubscriptionDetails';
import PageHeader from '@/components/ui/Display/PageHeader';
import Pricing from '@/components/ui/Display/Pricing';
import { Flex, Stack } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { redirect } from 'next/navigation';

export default async function Subscription() {
  // Grab data from db
  const [session, products, subscription, creditBalance] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription(),
    getCreditBalance()
  ]);

  // Redirect user to signin if not signed in
  if (!session) {
    return redirect('/signin');
  }

  // Page content
  const title = `Subscription`;

  // Data formatting
  const periodEnd = DateTime.fromISO(subscription?.current_period_end || '');
  const subscriptionDetails = {
    plan: subscription?.prices?.products?.name || 'free',
    price: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency! || 'USD',
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100),
    daysUntilRenewal: subscription
      ? Math.ceil(periodEnd.diff(DateTime.now(), 'days').days)
      : null,
    balance: creditBalance.remaining,
    outOf: creditBalance.outOf
  };

  return (
    <Flex w="full" px={4} justifyContent={'center'} color="white">
      <Stack w="full" maxW="4xl" py={8} gap={8}>
        <PageHeader title={title} />
        <SubscriptionDetails
          session={session}
          plan={subscriptionDetails.plan!}
          balance={subscriptionDetails.balance}
          outOf={subscriptionDetails.outOf}
          daysUntilRenewal={subscriptionDetails.daysUntilRenewal}
        />
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
