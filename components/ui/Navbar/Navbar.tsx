import Image from 'next/image';
import Link from 'next/link';

import { Box, Flex } from '@chakra-ui/react';
import { FaDollarSign, FaRegWindowMaximize } from 'react-icons/fa';

import logo from '@/assets/logo.png';
import { createServerSupabaseClient } from '@/app/supabase-server';

import Button from '../Input/Button';

import AuthView from './AuthView';

const pages = [
  {
    label: 'Playground',
    route: '/'
  },
  {
    label: 'Subscription',
    route: '/subscription'
  }
];

export default async function Navbar() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <Flex
      flexDir={'row'}
      w="full"
      alignItems={'center'}
      zIndex={'1500'}
      justifyContent={'space-between'}
      bg="whiteAlpha.200"
      py={4}
      px={[4, 4, 4, 8]}
      borderBottom="1px"
      borderColor="whiteAlpaha.300"
    >
      <Link href={'/'}>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          h="8"
          aspectRatio={1 / 1}
        >
          <Box w="100%" h="100%" position={'relative'}>
            <Image
              src={logo}
              alt={'Synchronicity Labs Logo'}
              fill
              style={{
                objectFit: 'contain'
              }}
            />
          </Box>
        </Flex>
      </Link>
      {user ? (
        <AuthView user={user} pages={pages} />
      ) : (
        <Button>
          <Link href="/signin" color="white">
            Sign in
          </Link>
        </Button>
      )}
    </Flex>
  );
}
