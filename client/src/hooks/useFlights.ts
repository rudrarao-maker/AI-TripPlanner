import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface FlightSearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

export const useSearchFlights = (query: FlightSearchQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['flights', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const response = await api.get(`/flights/search?${params.toString()}`);
      return response.data.data;
    },
    enabled: enabled && !!query.origin && !!query.destination && !!query.departureDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
