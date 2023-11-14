'use client';

import RealTimeJobGrid from './RealTimeJobGrid';
import supabase from '@/utils/supabase';

export default async function JobGrid() {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .neq('is_deleted', true);

  return <RealTimeJobGrid data={data || []} />;
}
