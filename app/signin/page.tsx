import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Box, Flex, Link, Stack } from '@chakra-ui/react';

import { getSession } from '@/app/supabase-server';
import logo from '@/assets/logo.png';

import AuthUI from './AuthUI';

export default async function SignIn() {
  const session = await getSession();

  if (session) {
    return redirect('/subscription');
  }

  return (
    <Flex w="full" justifyContent={'center'}>
      <Stack w="full" maxW="lg" gap={8} py={16}>
        <Flex w="full" justify={'center'}>
          <Link
            href={'/'}
            justifyContent={'center'}
            alignItems={'center'}
            h="28"
            aspectRatio={1 / 1}
            justifySelf={'center'}
          >
            <Box w="100%" h="100%" position={'relative'}>
              <Image
                src={logo}
                alt={'Synchronicity Labs Logo'}
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Link>
        </Flex>
        <AuthUI />
      </Stack>
    </Flex>
  );
}
