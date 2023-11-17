import {
  AspectRatio,
  Box,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react';

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
    >
      {[...Array(6)].map((_, i) => (
        <Box
          width={'full'}
          key={i}
          bgColor={'blackAlpha.400'}
          bgGradient="linear(to-b, whiteAlpha.200, transparent)"
          className="animate-pulse"
        >
          <AspectRatio ratio={16 / 9}>
            <Stack w="full" h="full" p={4}></Stack>
          </AspectRatio>
        </Box>
      ))}
    </Grid>
  );
}
