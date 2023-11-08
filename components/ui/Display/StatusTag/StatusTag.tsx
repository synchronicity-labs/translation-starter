import { Database, Status } from '@/types_db';
import { Box, Flex, Text } from '@chakra-ui/react';
import { FC } from 'react';

interface Props {
  status: Status;
}

const StatusBox: FC<Props> = ({ status }) => {
  let color = '';
  switch (status) {
    case 'pending':
      color = 'blue.900';
      break;
    case 'processing':
      color = 'yellow.900';
      break;
    case 'completed':
      color = 'green.600';
      break;
    case 'failed':
      color = 'red.600';
      break;
  }

  return (
    <Flex
      justifyContent={'flex-start'}
      alignItems={'center'}
      gap="2"
      fontSize={'xs'}
    >
      <Box bg={color} w="3" aspectRatio={1 / 1} rounded="full" />
      <Text w="fit" css={{ textTransform: 'capitalize' }}>
        {status}
      </Text>
    </Flex>
  );
};

export default StatusBox;
