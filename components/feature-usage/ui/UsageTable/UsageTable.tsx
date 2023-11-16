'use client';

import RealTimeUsageTable from './RealTimeUsageTable';
import { Job } from '@/types_db';
import supabase from '@/utils/supabase';
import { FC, useState, useEffect } from 'react';

interface Props {
  userId: string;
}
const UsageTable: FC<Props> = ({ userId }) => {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setData(fetchedData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <RealTimeUsageTable data={data} />;
};

export default UsageTable;
