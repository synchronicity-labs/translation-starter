import Link from 'next/link';

import { Box, Flex, Text } from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const builtWith = [
  {
    label: 'Sync Labs',
    link: 'https://synclabs.so'
  },
  {
    label: 'Next.js',
    link: 'https://nextjs.org'
  },
  {
    label: 'Vercel',
    link: 'https://vercel.com'
  },

  {
    label: 'Supabase',
    link: 'https://supabase.io'
  },
  {
    label: 'Stripe',
    link: 'https://stripe.com'
  }
];

export default function Footer() {
  return (
    <Flex
      className="flex-col sm:flex-row items-center"
      gap={4}
      px={8}
      py={4}
      justifyContent={'space-between'}
      bg={'whiteAlpha.200'}
      borderTop="1px"
      borderColor="whiteAlpha.300"
      color="white"
    >
      <Flex
        gap={4}
        fontSize={['xs', 'sm', 'md']}
        className="flex-col sm:flex-row items-center"
      >
        <Text className="uppercase" fontWeight="bold">
          Built with
        </Text>
        <Flex gap={[1, 2]}>
          {builtWith.map(({ label, link }, index) => {
            const showSeperator = index !== builtWith.length - 1;
            return (
              <Flex key={index}>
                <Link href={link} target="_blank" rel="noopener noreferrer">
                  <Text _hover={{ textDecoration: 'underline', color: 'blue' }}>
                    {label}
                  </Text>
                </Link>
                {showSeperator && <Text pl={2}>•</Text>}
              </Flex>
            );
          })}
        </Flex>
      </Flex>
      <Flex gap={4} fontSize={['md', 'lg', 'xl']}>
        <Link
          href="https://twitter.com/synclabs_ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box color="white">
            <FaXTwitter />
          </Box>
        </Link>
        <Link
          href="https://github.com/synchronicity-labs/translation-starter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box color="white">
            <FaGithub />
          </Box>
        </Link>
      </Flex>
    </Flex>
  );
}
