import ManageSubscriptionButton from '@/app/subscription/ManageSubscriptionButton';
import {
  Stack,
  Flex,
  Divider,
  Badge,
  Progress,
  Spinner,
  Text
} from '@chakra-ui/react';
import { Session } from '@supabase/supabase-js';
import { FC } from 'react';

interface Props {
  session: Session;
  plan: string;
  balance: number;
  outOf: number;
  daysUntilRenewal: number | null;
}

// TODO: Abstract this component
const SubscriptionDetails: FC<Props> = ({
  session,
  plan,
  balance,
  outOf,
  daysUntilRenewal
}) => {
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
          Subscription
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
};

export default SubscriptionDetails;
