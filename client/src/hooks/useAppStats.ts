import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface AppStat {
  label: string;
  value: number;
  suffix: string;
}

export const useAppStats = () => {
  return useQuery({
    queryKey: ['appStats'],
    queryFn: async () => {
      const response = await api.get('/app/stats');
      return response.data.data as AppStat[];
    }
  });
};
