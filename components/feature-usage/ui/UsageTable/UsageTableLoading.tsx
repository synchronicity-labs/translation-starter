import { Flex, Stack } from '@chakra-ui/react';

export default function UsageTableLoading() {
  return (
    <Stack
      w="full"
      h="full"
      bg="blackAlpha.400"
      gap={'4'}
      p={'4'}
      rounded={'md'}
    >
      <Stack h="full">
        {[...Array(10)].map((_, i) => {
          return (
            <Flex
              key={i}
              bg="whiteAlpha.100"
              w="full"
              h="10"
              rounded="md"
              className="animate-pulse"
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
