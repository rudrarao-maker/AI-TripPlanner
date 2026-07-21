import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface CurrentWeather {
  location: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  rainChance: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

interface ForecastDay {
  date: string;
  dayName: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  conditionIcon: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

interface WeatherAlert {
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  alerts: WeatherAlert[];
}

export const useWeather = (lat?: number, lng?: number, location?: string) => {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (lat !== undefined) params.lat = lat.toString();
      if (lng !== undefined) params.lng = lng.toString();
      if (location) params.location = location;

      const response = await api.get('/weather', { params });
      return response.data.data as WeatherData;
    },
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};
