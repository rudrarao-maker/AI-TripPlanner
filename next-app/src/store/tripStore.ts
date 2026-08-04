import { create } from "zustand";
import type { TripInput, Trip } from "@/types";

interface TripStore {
  currentTripInput: Partial<TripInput>;
  activeTrip: Trip | null;
  savedTrips: Trip[];
  isGenerating: boolean;

  updateTripInput: (data: Partial<TripInput>) => void;
  resetTripInput: () => void;
  setActiveTrip: (trip: Trip | null) => void;
  setGenerating: (status: boolean) => void;
}

const initialTripInput: Partial<TripInput> = {
  adults: 2,
  children: 0,
  budget: 20000,
  currency: "INR",
  travelStyle: "couple",
  transportPreference: "any",
  hotelCategory: "3-star",
  foodPreference: "any",
};

export const useTripStore = create<TripStore>((set) => ({
  currentTripInput: initialTripInput,
  activeTrip: null,
  savedTrips: [],
  isGenerating: false,

  updateTripInput: (data) =>
    set((state) => ({
      currentTripInput: { ...state.currentTripInput, ...data },
    })),

  resetTripInput: () =>
    set({
      currentTripInput: initialTripInput,
    }),

  setActiveTrip: (trip) => set({ activeTrip: trip }),

  setGenerating: (status) => set({ isGenerating: status }),
}));
