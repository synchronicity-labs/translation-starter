'use client';

import RealTimeUsageTable from './RealTimeUsageTable';
import supabase from '@/utils/supabase';

export default async function UsageTable() {
  const { data } = await supabase.from('jobs').select('*');

  return <RealTimeUsageTable data={data || []} />;
}
