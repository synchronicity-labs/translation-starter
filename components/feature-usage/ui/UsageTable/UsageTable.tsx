'use client';

import RealTimeUsageTable from './RealTimeUsageTable';
import supabase from '@/utils/supabase';

export default async function UsageTable({ userId }: { userId: string }) {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId);

  return <RealTimeUsageTable data={data || []} />;
}
