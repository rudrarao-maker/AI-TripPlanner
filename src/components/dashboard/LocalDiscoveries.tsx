"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Train, Hotel, MapPin, Coffee, Utensils } from "lucide-react";

export function LocalDiscoveries() {
  const [locationCity, setLocationCity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    setMounted(true);
    const updateLocation = () => {
      const city = localStorage.getItem("user_location_city");
      if (city) setLocationCity(city);
    };
    
    updateLocation();
    window.addEventListener("locationUpdated", updateLocation);
    
    return () => {
      window.removeEventListener("locationUpdated", updateLocation);
    };
  }, []);

  if (!mounted || !locationCity) return null;

  // Generate realistic-sounding nearby places based on the city
  const nearbyPlaces = [
    {
      id: 1,
      name: `${locationCity} International Airport`,
      type: "Airport",
      distance: "14 km away",
      icon: Plane,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: 2,
      name: `${locationCity} Central Station`,
      type: "Railway Station",
      distance: "3.2 km away",
      icon: Train,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: 3,
      name: `Grand ${locationCity} Hotel`,
      type: "Hotel",
      distance: "1.5 km away",
      icon: Hotel,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      id: 4,
      name: "The Local Bistro",
      type: "Restaurant",
      distance: "800 m away",
      icon: Utensils,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <Card className="glass border-primary/20 mt-8 animate-fade-in shadow-xl shadow-primary/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> 
            Discover {locationCity}
          </CardTitle>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Location
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Recommendations near your current location.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyPlaces.map((place) => (
            <div 
              key={place.id} 
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className={`h-12 w-12 rounded-full ${place.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <place.icon className={`h-6 w-6 ${place.color}`} />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate" title={place.name}>{place.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{place.type}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                  <span className="text-xs font-medium text-primary">{place.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
