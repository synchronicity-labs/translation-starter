'use client';

import RealTimeJobGrid from './RealTimeJobGrid';
import supabase from '@/utils/supabase';

export default async function JobGrid({ userId }: { userId: string }) {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .neq('is_deleted', true);

  return <RealTimeJobGrid data={data || []} />;
}
