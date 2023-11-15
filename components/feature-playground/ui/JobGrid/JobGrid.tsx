'use client';

import RealTimeJobGrid from './RealTimeJobGrid';
import { Job } from '@/types_db';
import supabase from '@/utils/supabase';

export default async function JobGrid({ userId }: { userId: string }) {
  // const { data } = await supabase
  //   .from('jobs')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .neq('is_deleted', true);

  const data: Job[] = [];
  return <RealTimeJobGrid data={data || []} />;
}
