'use client';

import { FC } from 'react';

import { Stack, Flex, Divider, Text, Spinner } from '@chakra-ui/react';
import { Session } from '@supabase/supabase-js';

import ManageSubscriptionButton from '@/app/subscription/ManageSubscriptionButton';
import { useSubscription } from '@/hooks/useSubscription';

import CreditsDetails from './CreditsDetails';
import PlanDetails from './PlanDetails';
import RenewalDetails from './RenewalDetails';

interface Props {
  session: Session;
}

// TODO: Abstract this component
const SubscriptionDetails: FC<Props> = ({ session }) => {
  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError
  } = useSubscription();

  if (subscriptionError) {
    return <Flex>Error loading subscription</Flex>;
  }

  if (subscriptionLoading) {
    return <Spinner />;
  }

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
          Subscription
        </Text>
        <Flex alignItems={'center'} gap={'4'}>
          <ManageSubscriptionButton session={session} />
        </Flex>
      </Flex>
      <Divider />
      <PlanDetails subscription={subscription} />
      <Divider />
      <CreditsDetails subscription={subscription} />
      {subscription && (
        <>
          <Divider />
          <RenewalDetails subscription={subscription} />
        </>
      )}
    </Stack>
  );
};

export default SubscriptionDetails;
