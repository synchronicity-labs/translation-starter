'use client';

import Button from '../Button';
import { Database } from '@/types_db';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import { Box, Flex, Link, Stack, Text } from '@chakra-ui/react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];

interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  session: Session | null;
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

const NoProductsView = () => {
  return (
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
};

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({
  session,
  user,
  products,
  subscription
}: Props) {
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
    <Stack py={8} textAlign="center" alignItems={'center'} gap={8}>
      <Text
        fontSize={['4xl', '6xl']}
        fontWeight="extrabold"
        color="white"
        textAlign="center"
      >
        Pricing Plans
      </Text>
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
                  {subscription ? 'Manage' : 'subscribe'}
                </Button>
              </Stack>
            );
          })}
      </Flex>
    </Stack>
  );
}
