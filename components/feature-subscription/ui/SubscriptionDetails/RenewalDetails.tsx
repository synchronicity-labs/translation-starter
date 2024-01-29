import { FC } from 'react';

import { Box, Flex, Text } from '@chakra-ui/react';
import { DateTime } from 'luxon';

import { SubscriptionWithProduct } from '@/types/db';

interface Props {
  subscription: SubscriptionWithProduct;
}

const RenewalDetails: FC<Props> = ({ subscription }) => {
  const periodEnd = DateTime.fromISO(subscription.current_period_end);
  const daysUntilRenewal = Math.ceil(
    periodEnd.diff(DateTime.now(), 'days').days
  );

  return (
    <Flex w="full">
      <Flex w="full" fontSize={'lg'} alignItems="center">
        next billing period starts in
      </Flex>
      <Box w="full">
        <Text fontSize="lg">
          {daysUntilRenewal !== 0
            ? `${daysUntilRenewal} days`
            : `Billing Today`}
        </Text>
      </Box>
    </Flex>
  );
};

export default RenewalDetails;
