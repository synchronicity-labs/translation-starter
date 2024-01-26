import { useSubscription } from '@/hooks/useSubscription';
import { Badge, Box, Flex } from '@chakra-ui/react';
import { FC } from 'react';

interface Props {}

const PlanDetails: FC<Props> = () => {
  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError
  } = useSubscription();

  if (subscriptionError) {
    return <Flex>Error loading subscription</Flex>;
  }

  return (
    <Flex>
      <Flex w="full" fontSize={'lg'} alignItems="center">
        Plan
      </Flex>
      <Flex w="full">
        <Flex alignItems="center">
          {subscriptionLoading ? (
            <Flex>Loading...</Flex>
          ) : (
            <Badge colorScheme="purple">
              {subscription?.prices?.products?.name || 'free'}
            </Badge>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PlanDetails;
