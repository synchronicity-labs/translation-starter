'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/app/supabase-provider';
import { User } from '@supabase/supabase-js';
import { Box, Flex } from '@chakra-ui/react';
import logo from '@/assets/logo.png';
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

export default function Navbar() {
  const { supabase } = useSupabase(); // Use the hook to get Supabase client
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Get the current user session
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [supabase]);

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
