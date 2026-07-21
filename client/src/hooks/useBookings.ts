import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings');
      return response.data.data;
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await api.post('/bookings', bookingData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking confirmed successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to process booking');
    }
  });
};
