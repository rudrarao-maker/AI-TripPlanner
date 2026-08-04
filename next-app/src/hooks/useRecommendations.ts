import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import type { Hotel, Restaurant, Attraction, Transport } from "../types";

export const useHotels = (
  filters?: { location?: string; maxPrice?: number },
  options?: Omit<
    import("@tanstack/react-query").UseQueryOptions<any, any, any, any>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["hotels", filters],
    queryFn: async () => {
      const response = await api.get("/recommendations/hotels", {
        params: filters,
      });
      return response.data.data as Hotel[];
    },
    ...options,
  });
};

export const useRestaurants = (filters?: { location?: string }) => {
  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: async () => {
      const response = await api.get("/recommendations/restaurants", {
        params: filters,
      });
      return response.data.data as Restaurant[];
    },
  });
};

export const useAttractions = (filters?: { location?: string }) => {
  return useQuery({
    queryKey: ["attractions", filters],
    queryFn: async () => {
      const response = await api.get("/recommendations/attractions", {
        params: filters,
      });
      return response.data.data as Attraction[];
    },
  });
};

export const useTransport = (filters?: {
  destination?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: ["transport", filters],
    queryFn: async () => {
      const type = filters?.type || "flight";
      const destination = filters?.destination || "Goa";

      if (type === "flight") {
        // Use the flight search API
        const response = await api.get("/flights/search", {
          params: {
            origin: "DEL", // Default mock origin
            destination: destination,
            departureDate: new Date(Date.now() + 86400000)
              .toISOString()
              .split("T")[0],
            adults: 1,
          },
        });

        // Map to TransportCard format temporarily if needed,
        // or just return as is if TransportCard supports it (it does now)
        return response.data.data.map((flight: any) => ({
          ...flight,
          type: "flight",
          vehicleType: flight.airline,
          provider: flight.provider,
          price: flight.price,
          currency: flight.currency,
        }));
      } else {
        // Use the new multi-transport API for Train, Bus, Cab
        const transportType = type === "car" ? "cab" : type;
        const response = await api.get("/transport/search", {
          params: {
            origin: "DEL",
            destination: destination,
            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            type: transportType,
          },
        });
        return response.data.data.map((t: any) => ({
          ...t,
          type: transportType,
        }));
      }
    },
  });
};
