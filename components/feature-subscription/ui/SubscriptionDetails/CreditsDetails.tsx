import { FC } from 'react';

import {
  Badge,
  Box,
  Flex,
  Progress,
  Text,
  Stack,
  Spinner
} from '@chakra-ui/react';

import { useCreditBalance } from '@/hooks/useCreditBalance';
import { SubscriptionWithProduct } from '@/types/db';

interface Props {
  subscription: SubscriptionWithProduct;
}

const CreditsDetails: FC<Props> = ({ subscription }) => {
  const { creditBalance, loading, error } = useCreditBalance(subscription);

  if (error) {
    return <Flex>Error loading credit balance</Flex>;
  }

  const creditsUsed = creditBalance.outOf - creditBalance.balance;

  return (
    <Flex w="full">
      <Flex w="full" fontSize={'lg'} alignItems="center">
        Credits Used
      </Flex>
      <Flex w="full" alignItems="center">
        {loading ? (
          <Spinner />
        ) : (
          <Stack w="full">
            <Text
              fontWeight="bold"
              fontSize="lg"
            >{`${creditsUsed} credits / ${creditBalance.outOf} credits`}</Text>
            <Flex w="full" alignItems="center">
              <Progress
                value={(creditsUsed / creditBalance.outOf) * 100}
                w="full"
                rounded="full"
              />
            </Flex>
          </Stack>
        )}
      </Flex>
    </Flex>
  );
};

export default CreditsDetails;
