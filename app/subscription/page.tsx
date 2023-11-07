import ManageSubscriptionButton from './ManageSubscriptionButton';
import {
  getSession,
  getActiveProductsWithPrices,
  getSubscription,
  getCreditBalance
} from '@/app/supabase-server';
import Pricing from '@/components/ui/Pricing';
import {
  Badge,
  Box,
  Divider,
  Flex,
  Progress,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react';
import { Session } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import { redirect } from 'next/navigation';

type Metadata = { credits: string };

function Details({
  session,
  plan,
  balance,
  outOf,
  daysUntilRenewal
}: {
  session: Session;
  plan: string;
  balance: number;
  outOf: number;
  daysUntilRenewal: number | null;
}) {
  const creditsUsed = outOf - balance;
  return (
    <Stack
      bg="blackAlpha.400"
      gap={'4'}
      p={'4'}
      rounded={'md'}
      border="2px"
      borderColor="whiteAlpha.400"
    >
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text fontWeight={'bold'} fontSize={'xl'} alignItems="center">
          Subscription Details
        </Text>
        <Flex alignItems={'center'} gap={'4'}>
          <ManageSubscriptionButton session={session} />
        </Flex>
      </Flex>
      <Divider />
      <Flex>
        <Flex w="full" fontSize={'lg'} alignItems="center">
          Plan
        </Flex>
        <Flex w="full">
          <Flex alignItems="center">
            <Badge colorScheme="purple">{plan}</Badge>
          </Flex>
        </Flex>
      </Flex>
      <Divider />
      <Flex>
        <Flex w="full" fontSize={'lg'} alignItems="center">
          Credits Used
        </Flex>
        {balance !== null && outOf !== null ? (
          <Stack w="full">
            <Text
              fontWeight="bold"
              fontSize="lg"
            >{`${creditsUsed} credits / ${outOf} credits`}</Text>
            <Flex w="full" alignItems="center">
              <Progress
                value={(creditsUsed / outOf) * 100}
                w="full"
                rounded="full"
              />
            </Flex>
          </Stack>
        ) : (
          <Flex justifyContent={'flex-start'} w="full">
            <Spinner />
          </Flex>
        )}
      </Flex>

      {daysUntilRenewal && (
        <>
          <Divider />
          <Flex>
            <Flex w="full" fontSize={'lg'} alignItems="center">
              next billing period starts in
            </Flex>

            <Flex w="full">
              <Text fontSize="lg">
                {daysUntilRenewal !== 0
                  ? `${daysUntilRenewal} days`
                  : `Billing Today`}
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </Stack>
  );
}

export default async function Subscription() {
  const [session, products, subscription, creditBalance] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription(),
    getCreditBalance()
  ]);

  if (!session) {
    return redirect('/signin');
  }

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
      <Stack w="full" maxW="4xl" py={8} gap={0}>
        <Text
          textAlign={'start'}
          fontSize={['4xl', '6xl']}
          fontWeight="extrabold"
          color="white"
          className="sm:text-center"
          pb={8}
        >
          Subscription
        </Text>
        {subscriptionDetails ? (
          <Details
            session={session}
            plan={subscriptionDetails.plan!}
            balance={subscriptionDetails.balance}
            outOf={subscriptionDetails.outOf}
            daysUntilRenewal={subscriptionDetails.daysUntilRenewal}
          />
        ) : (
          <Flex
            alignSelf="center"
            fontWeight="semibold"
            fontSize="xl"
          >{`You don't have a subscription. Please pick one from the list below.`}</Flex>
        )}
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
