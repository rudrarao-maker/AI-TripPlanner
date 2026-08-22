"use client";

import { MultiDestItinerary } from "@/lib/ai-pipeline/types";
import { MapPin, Plane, Train, Bus, Car, Ship, Clock, ArrowDown } from "lucide-react";

export function JourneyTimeline({
  itinerary,
  activeDestination,
  onSelectDestination,
}: {
  itinerary: MultiDestItinerary;
  activeDestination: string;
  onSelectDestination: (name: string) => void;
}) {
  const getTransportIcon = (mode?: string) => {
    switch (mode) {
      case "flight": return <Plane className="h-4 w-4" />;
      case "train": return <Train className="h-4 w-4" />;
      case "bus": return <Bus className="h-4 w-4" />;
      case "car": return <Car className="h-4 w-4" />;
      case "ferry": return <Ship className="h-4 w-4" />;
      default: return <Plane className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {itinerary.destinations.map((dest, index) => {
        const isActive = activeDestination === dest.name;
        
        return (
          <div key={dest.name} className="relative">
            {/* Transport from previous (if not first) */}
            {index > 0 && dest.transferFromPrevious && (
              <div className="flex flex-col items-center justify-center my-2 -ml-[190px]">
                 <div className="w-0.5 h-6 bg-border mb-1" />
                 <div className="bg-muted px-2 py-1 rounded text-xs flex items-center gap-1.5 text-muted-foreground border">
                   {getTransportIcon(dest.transferFromPrevious.mode)}
                   <span>{Math.round(dest.transferFromPrevious.estimatedDurationMinutes / 60)}h</span>
                 </div>
                 <div className="w-0.5 h-6 bg-border mt-1" />
              </div>
            )}

            {/* Destination Node */}
            <button
              onClick={() => onSelectDestination(dest.name)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all border ${
                isActive 
                  ? "bg-primary/10 border-primary shadow-sm" 
                  : "bg-background border-transparent hover:border-border hover:bg-accent/50"
              }`}
            >
              <div className={`p-2 rounded-lg mt-0.5 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className={`font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                  {dest.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dest.numberOfDays} Days • {new Date(dest.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
