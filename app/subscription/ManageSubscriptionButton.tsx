'use client';

import Button from '@/components/ui/Input/Button';
import { postData } from '@/utils/helpers';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

interface Props {
  session: Session;
}

export default function ManageSubscriptionButton({ session }: Props) {
  const [loading, setLoading] = useState(false);
  const label = `Manage Subscription`;

  const router = useRouter();
  const redirectToCustomerPortal = async () => {
    try {
      setLoading(true);
      const { url } = await postData({
        url: '/api/create-portal-link'
      });
      router.push(url);
    } catch (error) {
      setLoading(false);
      if (error) return alert((error as Error).message);
    }
  };

  return (
    <Button
      isDisabled={!session}
      onClick={redirectToCustomerPortal}
      size="sm"
      rightIcon={<FaArrowUpRightFromSquare />}
      justifyContent={'space-between'}
      isLoading={loading}
      loadingText={label}
    >
      {label}
    </Button>
  );
}
