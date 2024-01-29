import { FC } from 'react';

import { Box, Flex, Tooltip, Text } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa';

interface Props {
  label: string;
  info: string | JSX.Element;
}

const Info: FC<Props> = ({ label, info }) => (
  <Flex w="full" justifyContent="center">
    <Tooltip hasArrow label={info}>
      <Flex gap={1} fontSize="xs" alignItems={'center'} cursor={'pointer'}>
        <Box p={1} bg="whiteAlpha.600" rounded="sm">
          <FaInfo />
        </Box>
        <Text>{label}</Text>
      </Flex>
    </Tooltip>
  </Flex>
);

export default Info;
