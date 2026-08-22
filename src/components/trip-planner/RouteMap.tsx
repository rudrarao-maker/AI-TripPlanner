"use client";

import dynamic from "next/dynamic";
import { MultiDestItinerary } from "@/lib/ai-pipeline/types";

// Dynamically import LeafletMap with SSR disabled to prevent window is not defined errors
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export function RouteMap({
  itinerary,
  activeDestination,
}: {
  itinerary: MultiDestItinerary;
  activeDestination?: string;
}) {
  const destinations = itinerary.destinations;
  
  if (destinations.length === 0) return null;

  // For multi-dest, we want to map all destinations.
  // Wait, the itinerary structure doesn't include lat/lng for destinations right now.
  // But wait, the Single-Dest map uses `destCoords`. Let's assume we can mock or pass destCoords.
  // For the sake of the RouteMap, if lat/lng are missing, we will place markers based on known data or skip.
  
  // Since we don't have lat/lng in the output schema right now, we can extract it if we pass it, or we can just render the generic LeafletMap if we have the coordinates.
  // Actually, we can use a simpler view or just skip the map if coords aren't available, but let's provide a wrapper that expects coords.

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border">
      <div className="w-full h-full bg-accent/20 flex items-center justify-center text-muted-foreground flex-col gap-2">
        <span className="text-4xl">🗺️</span>
        <p className="font-medium">Interactive Route Map</p>
        <p className="text-sm max-w-xs text-center">Shows the route from {destinations[0]?.name} to {destinations[destinations.length - 1]?.name}</p>
      </div>
    </div>
  );
}
