import { useOptimistic, useState } from "react";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { apiClient } from "@/lib/api-client";

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';

// Define the exact schema the server uses so the client can parse the stream
const PlanSchema = z.object({
  title: z.string(),
  origin: z.string(),
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number(),
  flightsCost: z.number(),
  currency: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string(),
    activities: z.array(z.object({
      time: z.string(),
      name: z.string(),
      location: z.string(),
      description: z.string(),
      category: z.string(),
      estimatedCost: z.number(),
      currency: z.string().default("INR")
    }))
  }))
});

export const useTripPlanner = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [finalItinerary, setFinalItinerary] = useState<any>(null);
  const [isGeneratingCompare, setIsGeneratingCompare] = useState(false);

  const { submit, isLoading: isStreaming, object: streamedItinerary } = useObject({
    api: '/api/trips/generate',
    schema: PlanSchema,
    onFinish: ({ object }) => {
      if (object) {
        setFinalItinerary(object);
        posthog.capture('trip_generated_success');
      }
    },
    onError: (error) => {
      console.error("Stream error:", error);
      toast.error("Failed to generate trip stream.");
    }
  });

  const isGenerating = isGeneratingCompare || isStreaming;
  const itinerary = finalItinerary || streamedItinerary;

  // Optimistic update for itinerary when re-ordering or editing
  const [optimisticItinerary, setOptimisticItinerary] = useOptimistic(
    itinerary,
    (state, newItinerary: any) => ({
      ...state,
      ...newItinerary,
    })
  );

  const generateWithData = async (dataToUse: any) => {
    setIsGenerating(true);

    let startD = new Date();
    let endD = new Date(new Date().setDate(new Date().getDate() + 7));
    if (dataToUse.dates && dataToUse.dates.includes("to")) {
      const parts = dataToUse.dates.split("to");
      if (parts[0].trim()) startD = new Date(parts[0].trim());
      if (parts[1]?.trim()) endD = new Date(parts[1].trim());
    }

    const tripData = {
      origin: dataToUse.departureCity || "Home",
      destination: dataToUse.destinations[0] || "Bali",
      startDate: startD.toISOString(),
      endDate: endD.toISOString(),
      travelers: dataToUse.adults + dataToUse.children + dataToUse.seniors,
      budget: dataToUse.budget || "100000",
      budgetTier: dataToUse.budgetTier, 
      tripType: dataToUse.tripType,
      interests: dataToUse.interests,
    };

    try {
      if (tripData.budgetTier === "compare") {
        setIsGeneratingCompare(true);
        const response = await apiClient("/api/trips/generate", {
          method: "POST",
          body: JSON.stringify(tripData)
        });
        const json = await response.json();
        setPlans(json.data);
        setIsGeneratingCompare(false);
      } else {
        // Stream Single Plan
        submit(tripData);
      }
    } catch (err: any) {
      console.error("Plan generation failed:", err);
      toast.error(err.message || "Failed to generate plans. Please try again.");
      setIsGeneratingCompare(false);
    }
  };

  const updateOptimisticItinerary = (newData: any) => {
    setOptimisticItinerary(newData);
  };

  return {
    isGenerating,
    setIsGenerating: setIsGeneratingCompare,
    plans,
    setPlans,
    itinerary,
    setItinerary: setFinalItinerary,
    optimisticItinerary,
    updateOptimisticItinerary,
    generateWithData
  };
};
