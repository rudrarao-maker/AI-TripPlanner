"use client";

import { useState } from "react";
import { MultiDestItinerary } from "@/lib/ai-pipeline/types";
import { JourneyTimeline } from "./JourneyTimeline";
import { RouteMap } from "./RouteMap";
import { DraggableItinerary } from "@/components/itinerary/DraggableItinerary";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Users, Wallet, ArrowRight, Plane, Train, Bus, Car, Ship } from "lucide-react";

export function MultiDestTripView({
  itinerary,
  isPublic = false,
  collaborators = [],
}: {
  itinerary: MultiDestItinerary;
  isPublic?: boolean;
  collaborators?: any[];
}) {
  const [activeDestination, setActiveDestination] = useState<string>(
    itinerary.destinations[0]?.name || ""
  );

  const currentDest = itinerary.destinations.find((d) => d.name === activeDestination);

  const getTransportIcon = (mode?: string) => {
    switch (mode) {
      case "flight": return <Plane className="h-5 w-5" />;
      case "train": return <Train className="h-5 w-5" />;
      case "bus": return <Bus className="h-5 w-5" />;
      case "car": return <Car className="h-5 w-5" />;
      case "ferry": return <Ship className="h-5 w-5" />;
      default: return <Plane className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6">
      {/* Sidebar: Timeline & Map */}
      <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
        <Card className="p-5 border shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Journey Route
          </h3>
          <JourneyTimeline 
            itinerary={itinerary}
            activeDestination={activeDestination}
            onSelectDestination={setActiveDestination}
          />
        </Card>
        
        <RouteMap 
          itinerary={itinerary} 
          activeDestination={activeDestination} 
        />
        
        <Card className="p-5 border shadow-sm">
           <h3 className="font-bold text-lg mb-3">Trip Summary</h3>
           <div className="space-y-3 text-sm">
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Duration</span>
               <span className="font-medium">{itinerary.tripSummary.totalDays} Days</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/> Stops</span>
               <span className="font-medium">{itinerary.tripSummary.destinationCount} Cities</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Travelers</span>
               <span className="font-medium">{itinerary.tripSummary.travelers}</span>
             </div>
             <div className="pt-3 border-t flex items-center justify-between">
               <span className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4"/> Est. Total</span>
               <span className="font-bold text-primary">
                 {itinerary.tripSummary.currency} {itinerary.tripSummary.estimatedTotal.toLocaleString()}
               </span>
             </div>
           </div>
        </Card>
      </div>

      {/* Main Content: Destination Itinerary */}
      <div className="flex-1 space-y-6">
        {currentDest && (
          <>
            {/* Header / Transport from previous */}
            <div className="space-y-4">
              {currentDest.transferFromPrevious && (
                <Card className="p-4 bg-primary/5 border-primary/20 flex items-center gap-6 overflow-hidden relative">
                   <div className="absolute -right-4 -top-4 opacity-5 text-primary">
                     {getTransportIcon(currentDest.transferFromPrevious.mode)}
                   </div>
                   <div className="bg-background p-3 rounded-xl border shadow-sm z-10">
                     {getTransportIcon(currentDest.transferFromPrevious.mode)}
                   </div>
                   <div className="z-10 flex-1">
                     <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Incoming Transfer</p>
                     <div className="flex items-center gap-3 text-lg font-semibold">
                       <span>{currentDest.transferFromPrevious.from}</span>
                       <ArrowRight className="h-5 w-5 text-muted-foreground" />
                       <span>{currentDest.name}</span>
                     </div>
                     <p className="text-sm text-muted-foreground mt-1">
                       ~{Math.round(currentDest.transferFromPrevious.estimatedDurationMinutes / 60)}h • {itinerary.tripSummary.currency} {currentDest.transferFromPrevious.estimatedCost.toLocaleString()}
                     </p>
                     {currentDest.transferFromPrevious.notes && (
                       <p className="text-xs mt-2 bg-background/50 inline-block px-2 py-1 rounded">
                         💡 {currentDest.transferFromPrevious.notes}
                       </p>
                     )}
                   </div>
                </Card>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold">{currentDest.name}</h2>
                  <p className="text-muted-foreground mt-1">
                    {currentDest.numberOfDays} Days • {new Date(currentDest.startDate).toLocaleDateString()} to {new Date(currentDest.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-muted-foreground">Est. Budget</p>
                   <p className="text-xl font-bold text-primary">
                     {itinerary.tripSummary.currency} {currentDest.destinationBudget.total.toLocaleString()}
                   </p>
                </div>
              </div>
            </div>

            {/* Daily Itinerary */}
            <div className="space-y-8 mt-6">
              {currentDest.days.map((day) => (
                <div key={day.dayNumber} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-xl text-primary">Day {day.dayNumber}: {day.theme}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>
                  </div>
                  <DraggableItinerary
                    initialActivities={day.activities}
                    tripId={(itinerary as any).id || "mock"}
                  />
                  <div className="text-right text-sm text-muted-foreground pt-2">
                    Est. Day Cost: {itinerary.tripSummary.currency} {day.estimatedDailyCost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
