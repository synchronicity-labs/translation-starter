'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Box, Flex, Link, Stack, Text } from '@chakra-ui/react';
import { Session, User } from '@supabase/supabase-js';

import {
  BillingInterval,
  Price,
  ProductWithPrices,
  SubscriptionWithProduct
} from '@/types/db';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';

import Button from '../../Input/Button';
import PageHeader from '../PageHeader';

interface Props {
  session: Session | null;
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

export default function Pricing({
  session,
  user,
  products,
  subscription
}: Props) {
  console.log('Pricing - session: ', session);
  console.log('Pricing - user: ', user);
  console.log('Pricing - products: ', products);
  console.log('Pricing - subscription: ', subscription);

  const title = `Pricing`;

  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  const NoProductsView = () => (
    <Stack px={4} py={8}>
      <Text
        fontSize={['4xl', '6xl']}
        fontWeight="extrabold"
        color="white"
        textAlign="center"
      >
        Pricing Plans
      </Text>
      <Box fontSize="6xl" fontWeight="extrabold" textAlign="center">
        <span className="text-white">
          No subscription pricing plans found. Create them in your{' '}
          <Link
            href="https://dashboard.stripe.com/products"
            target="_blank"
            color="blue"
          >
            Stripe Dashboard
          </Link>
          .
        </span>
      </Box>
    </Stack>
  );

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      return router.push('/signin');
    }
    if (subscription) {
      return router.push('/subscription');
    }
    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price }
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  if (!products.length) return <NoProductsView />;

  return (
    <Stack gap={8}>
      <PageHeader title={title} />
      <Flex w="full" gap={4} className="flex-col sm:flex-row">
        {products
          .sort(
            (a, b) =>
              (a.prices[0]?.unit_amount || 0) - (b.prices[0]?.unit_amount || 0)
          )
          .map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency!,
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);

            const activeSubscription =
              subscription?.prices?.products?.id === product.id;

            return (
              <Stack
                w="full"
                h="full"
                bg="blackAlpha.400"
                border="2px"
                borderColor="whiteAlpha.400"
                gap={'4'}
                p={'4'}
                rounded={'md'}
                color="white"
                key={product.id}
              >
                <Flex gap="4">
                  <Text fontSize="xl">{product.name}</Text>
                </Flex>
                <Flex alignItems="flex-end" justifyContent={'center'} p={'0'}>
                  <Text fontWeight="bold" fontSize="4xl">
                    {priceString}
                  </Text>
                  <Text pb="2">{`/${billingInterval}`}</Text>
                </Flex>
                {product.description && (
                  <Text textAlign="start">{product.description}</Text>
                )}
                <Button
                  isDisabled={!session}
                  isLoading={priceIdLoading === price.id}
                  onClick={() => handleCheckout(price)}
                >
                  {activeSubscription ? 'Manage' : 'subscribe'}
                </Button>
              </Stack>
            );
          })}
      </Flex>
    </Stack>
  );
}
