import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import type { Trip, TripInput } from "../types";
import toast from "react-hot-toast";

export const useGenerateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData: TripInput) => {
      const response = await api.post("/trips/generate", tripData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to generate trip");
    },
  });
};

export const useGetTrips = () => {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const response = await api.get("/trips");
      return response.data.data as Trip[];
    },
  });
};

export const useGetTrip = (id: string) => {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const response = await api.get(`/trips/${id}`);
      return response.data.data as Trip;
    },
    enabled: !!id,
  });
};

export const useParsePrompt = () => {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const response = await api.post("/trips/parse-prompt", { prompt });
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to parse prompt");
    },
  });
};

export const useRegenerateDay = () => {
  return useMutation({
    mutationFn: async (payload: { dayNumber: number; existingPlan: any; preferences: any }) => {
      const response = await api.post("/trips/regenerate-day", payload);
      return response.data.data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to regenerate day");
    },
  });
};
