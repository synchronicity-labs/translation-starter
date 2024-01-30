import { PropsWithChildren } from 'react';

import { ChakraProvider, Flex, Stack } from '@chakra-ui/react';

import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';

import SupabaseProvider from './supabase-provider';

import '@/styles/main.css';

const meta = {
  title: 'Translation AI',
  description: 'Brought to you by Sync Labs',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  type: 'website'
};

export const metadata = {
  title: meta.title,
  description: meta.description,
  robots: meta.robots,
  twitter: {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description
  }
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black loading">
        <SupabaseProvider>
          <ChakraProvider>
            <Stack
              justifyContent="space-between"
              className="min-h-screen"
              gap={0}
            >
              <Flex direction="column" flex="1">
                <Navbar />
                <Flex w="full" flex="1" justifyContent={'center'}>
                  <Flex w="full" maxW="6xl" flex="1">
                    {children}
                  </Flex>
                </Flex>
              </Flex>
              <Footer />
            </Stack>
          </ChakraProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
