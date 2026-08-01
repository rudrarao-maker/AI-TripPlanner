import { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Card } from "../ui/card";
import type { Coordinates } from "@/types";

interface LocationMarker {
  id: string;
  position: Coordinates;
  title: string;
  type: "hotel" | "restaurant" | "attraction" | "destination";
  description?: string;
}

interface InteractiveMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: LocationMarker[];
  className?: string;
  activeMarkerId?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
};

const defaultOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: "all",
      elementType: "geometry.fill",
      stylers: [{ weight: "2.00" }],
    },
    {
      featureType: "all",
      elementType: "geometry.stroke",
      stylers: [{ color: "#9c9c9c" }],
    },
    {
      featureType: "all",
      elementType: "labels.text",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ color: "#f2f2f2" }],
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "poi",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ saturation: -100 }, { lightness: 45 }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#7b7b7b" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ color: "#46bcec" }, { visibility: "on" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c8d7d4" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#070707" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }],
    },
  ],
};

export function InteractiveMap({
  center,
  zoom = 12,
  markers = [],
  className = "",
  activeMarkerId,
}: InteractiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Update center when props change
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [center, zoom, map]);

  // Route between markers if there are more than 1
  useEffect(() => {
    if (isLoaded && markers.length > 1 && window.google) {
      const directionsService = new window.google.maps.DirectionsService();

      const origin = markers[0].position;
      const destination = markers[markers.length - 1].position;

      const waypoints = markers.slice(1, -1).map((m) => ({
        location: m.position,
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          }
        },
      );
    } else {
      setDirections(null);
    }
  }, [markers, isLoaded]);

  if (!isLoaded) {
    return (
      <Card
        className={`glass bg-muted/20 animate-pulse flex items-center justify-center ${className}`}
      >
        <p className="text-muted-foreground">Loading Google Maps...</p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-border/50 shadow-md ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#6366f1",
                strokeWeight: 4,
                strokeOpacity: 0.7,
              },
            }}
          />
        )}

        {markers.map((marker) => {
          const isActive = marker.id === activeMarkerId;
          return (
            <MarkerF
              key={marker.id}
              position={marker.position}
              zIndex={isActive ? 1000 : 1}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: isActive ? "#ec4899" : "#6366f1",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                scale: isActive ? 12 : 8,
              }}
            >
              {isActive && (
                <InfoWindowF position={marker.position}>
                  <div className="p-1 max-w-[200px] text-black">
                    <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                    {marker.description && (
                      <p className="text-xs text-gray-600 mb-2">
                        {marker.description}
                      </p>
                    )}
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      {marker.type}
                    </span>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          );
        })}
      </GoogleMap>
    </Card>
  );
}
