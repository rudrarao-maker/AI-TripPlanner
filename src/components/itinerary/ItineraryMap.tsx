"use client";

import React, { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1rem"
};

// Default center (can be dynamic based on first activity)
const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
};

export function ItineraryMap({ activities }: { activities: any[] }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const markers = useMemo(() => {
    return activities
      .filter((a) => a.lat && a.lng)
      .map((a) => ({ lat: a.lat, lng: a.lng, name: a.name }));
  }, [activities]);

  const path = useMemo(() => markers.map(m => ({ lat: m.lat, lng: m.lng })), [markers]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/50 rounded-2xl border border-primary/10 animate-pulse">
        <div className="flex flex-col items-center text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm font-medium">Loading Map Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg border border-primary/20 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markers[0] || defaultCenter}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            // Add custom minimalist map styles here if desired
          ]
        }}
      >
        {/* Draw Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={{
              text: (index + 1).toString(),
              color: "white",
              fontWeight: "bold"
            }}
          />
        ))}

        {/* Draw Route Polyline */}
        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeColor: "#4f46e5", // Primary color
              strokeOpacity: 0.8,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
