'use client';

import { FC } from 'react';

import { usePathname } from 'next/navigation';

import { Flex, Link, Text, useMediaQuery } from '@chakra-ui/react';
import { User } from '@supabase/supabase-js';

import ProfileButton from '../Input/ProfileButton';

interface Props {
  user: User;
  pages: { label: string; route: string }[];
}
const AuthView: FC<Props> = ({ user, pages }) => {
  const pathname = usePathname();

  const [isMobile] = useMediaQuery('(max-width: 479px)', {
    ssr: true,
    fallback: false
  });

  return (
    <Flex gap={4}>
      {!isMobile && (
        <Flex gap={2}>
          {pages.map(({ label, route }) => {
            const onPath = pathname === route;
            return (
              <Link key={route} href={route}>
                <Flex
                  alignItems="center"
                  gap={'2'}
                  py="1"
                  px="2"
                  rounded="md"
                  color={onPath ? 'white' : 'whiteAlpha.600'}
                  _hover={
                    onPath
                      ? {
                          bg: 'whiteAlpha.200'
                        }
                      : {
                          color: 'whiteAlpha.800',
                          bg: 'whiteAlpha.200'
                        }
                  }
                >
                  <Text fontWeight="bold">{label}</Text>
                </Flex>
              </Link>
            );
          })}
        </Flex>
      )}

      <ProfileButton user={user} />
    </Flex>
  );
};

export default AuthView;
