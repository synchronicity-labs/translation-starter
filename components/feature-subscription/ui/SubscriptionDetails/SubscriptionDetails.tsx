'use client';

import CreditsDetails from './CreditsDetails';
import PlanDetails from './PlanDetails';
import ManageSubscriptionButton from '@/app/subscription/ManageSubscriptionButton';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Stack,
  Flex,
  Badge,
  Divider,
  Progress,
  Spinner,
  Text
} from '@chakra-ui/react';
import { Session } from '@supabase/supabase-js';
import { FC } from 'react';

interface Props {
  session: Session;
}

// TODO: Abstract this component
const SubscriptionDetails: FC<Props> = ({ session }) => {
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
      <PlanDetails />
      <Divider />
      <CreditsDetails />
      {/* {daysUntilRenewal && (
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
      )} */}
    </Stack>
  );
};

export default SubscriptionDetails;
