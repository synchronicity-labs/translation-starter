'use client';

import JobGridLoading from './JobGridLoading';
import RealTimeJobGrid from './RealTimeJobGrid';
import { Job } from '@/types/db';
import supabase from '@/utils/supabase';
import { FC, useState, useEffect } from 'react';

interface Props {
  userId: string;
}
const JobGrid: FC<Props> = ({ userId }) => {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId) // Ensure `userId` is defined in your component
        .neq('is_deleted', true)
        .neq('status', 'failed');

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
    return <JobGridLoading />;
  }

  return <RealTimeJobGrid data={data} />;
};

export default JobGrid;
