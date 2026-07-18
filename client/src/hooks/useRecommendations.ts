import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Hotel, Restaurant, Attraction, Transport } from '../types';

export const useHotels = (filters?: { location?: string; maxPrice?: number }) => {
  return useQuery({
    queryKey: ['hotels', filters],
    queryFn: async () => {
      const response = await api.get('/recommendations/hotels', { params: filters });
      return response.data.data as Hotel[];
    }
  });
};

export const useRestaurants = (filters?: { location?: string }) => {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const response = await api.get('/recommendations/restaurants', { params: filters });
      return response.data.data as Restaurant[];
    }
  });
};

export const useAttractions = (filters?: { location?: string }) => {
  return useQuery({
    queryKey: ['attractions', filters],
    queryFn: async () => {
      const response = await api.get('/recommendations/attractions', { params: filters });
      return response.data.data as Attraction[];
    }
  });
};

export const useTransport = (filters?: { destination?: string; type?: string }) => {
  return useQuery({
    queryKey: ['transport', filters],
    queryFn: async () => {
      const response = await api.get('/recommendations/transport', { params: filters });
      return response.data.data as Transport[];
    }
  });
};
