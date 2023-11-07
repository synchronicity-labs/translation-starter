'use client';

import Button from '@/components/ui/Button';
import { postData } from '@/utils/helpers';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface Props {
  session: Session;
}

export default function ManageSubscriptionButton({ session }: Props) {
  const router = useRouter();
  const redirectToCustomerPortal = async () => {
    try {
      const { url } = await postData({
        url: '/api/create-portal-link'
      });
      router.push(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
  };

  return (
    <Button isDisabled={!session} onClick={redirectToCustomerPortal}>
      Manage Subscription
    </Button>
  );
}
