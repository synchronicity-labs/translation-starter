import { Box, Flex, Link, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { FC } from 'react';

interface Props {
  title: string;
  logos: { label: string; link: string; img: string }[];
}

const LogoCloud: FC<Props> = ({ title, logos }) => {
  return (
    <Flex color="white" alignItems="center" gap={4}>
      <Text className="uppercase" fontSize="sm" fontWeight="bold">
        {title}
      </Text>
      {logos.map(({ label, link, img }) => {
        return (
          <Flex
            justifyContent={'center'}
            bg="whiteAlpha.400"
            px={2}
            py={1}
            rounded="md"
          >
            <Link href={link} w={16} h={6}>
              <Box w="100%" h="100%" position={'relative'}>
                <Image src={img} alt={`${label} logo`} fill />
              </Box>
            </Link>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default LogoCloud;
