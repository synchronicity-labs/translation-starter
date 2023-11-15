'use client';

import RealTimeUsageTable from './RealTimeUsageTable';
import { Job } from '@/types_db';
import supabase from '@/utils/supabase';

export default async function UsageTable({ userId }: { userId: string }) {
  // const { data } = await supabase
  //   .from('jobs')
  //   .select('*')
  //   .eq('user_id', userId);

  const data: Job[] = [];

  return <RealTimeUsageTable data={data || []} />;
}
