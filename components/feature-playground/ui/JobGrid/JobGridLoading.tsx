import { AspectRatio, Grid, Flex, Stack } from '@chakra-ui/react';

export default function JobGridLoading() {
  return (
    <Grid
      templateColumns={[
        'repeat(1, 1fr)',
        'repeat(2, 1fr)',
        'repeat(2, 1fr)',
        'repeat(3, 1fr)'
      ]}
      gap={4}
      w={'100%'}
      maxW={'1200'}
    >
      {[...Array(6)].map((_, i) => (
        <Stack
          key={i}
          bgColor="blackAlpha.400"
          bgGradient="linear(to-b, whiteAlpha.100, transparent)"
          transition="transform 0.2s"
          _hover={{
            borderColor: 'whiteAlpha.600',
            bgGradient: 'linear(to-b, whiteAlpha.200, transparent)'
          }}
          rounded={'md'}
          p={2}
          position={'relative'}
          w="full"
          className="animate-pulse"
        >
          <AspectRatio ratio={16 / 9} bg="whiteAlpha.100">
            <Stack w="full" h="full" p={4}></Stack>
          </AspectRatio>
          <Flex bg="whiteAlpha.100" w="full" h={4} rounded="md" />
          <Flex bg="whiteAlpha.100" w="50%" h={4} rounded="md" />
        </Stack>
      ))}
    </Grid>
  );
}
