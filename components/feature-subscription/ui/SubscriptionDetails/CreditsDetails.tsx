import { useCreditBalance } from '@/hooks/useCreditBalance';
import {
  Badge,
  Box,
  Flex,
  Progress,
  Text,
  Stack,
  Spinner
} from '@chakra-ui/react';
import { FC } from 'react';

interface Props {}

const CreditsDetails: FC<Props> = () => {
  const { creditBalance, loading, error } = useCreditBalance();

  if (error) {
    return <Flex>Error loading credit balance</Flex>;
  }

  const creditsUsed = creditBalance.outOf - creditBalance.balance;

  return (
    <Flex w="full">
      <Flex w="full" fontSize={'lg'} alignItems="center">
        Credits Used
      </Flex>
      {loading ? (
        <Flex>Loading...</Flex>
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
  );
};

export default CreditsDetails;
