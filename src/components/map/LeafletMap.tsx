"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Coordinates } from "@/types";

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationMarker {
  id: string;
  position: Coordinates;
  title: string;
  type: string;
  description?: string;
}

interface LeafletMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: LocationMarker[];
  className?: string;
  activeMarkerId?: string;
  showUserLocation?: boolean;
}

// Component to handle map updates when props change
function MapUpdater({ activeMarkerId, markers }: { activeMarkerId?: string; markers: LocationMarker[] }) {
  const map = useMap();
  const activeMarker = markers.find(m => m.id === activeMarkerId);

  useEffect(() => {
    if (activeMarker) {
      map.flyTo([activeMarker.position.lat, activeMarker.position.lng], 15, {
        duration: 1.5,
      });
    }
  }, [activeMarkerId, activeMarker, map]);

  return null;
}

export default function LeafletMap({
  center,
  zoom = 12,
  markers = [],
  className = "",
  activeMarkerId,
  showUserLocation = false,
}: LeafletMapProps) {
  const positions = markers.map((m) => [m.position.lat, m.position.lng] as [number, number]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (showUserLocation && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [showUserLocation]);

  useEffect(() => {
    if (positions.length < 2) {
      setRouteCoordinates(positions);
      return;
    }

    const fetchRoute = async () => {
      try {
        // OSRM expects coordinates in lng,lat format separated by semicolons
        const coordinatesString = positions.map(p => `${p[1]},${p[0]}`).join(";");
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`);
        if (!res.ok) throw new Error("Failed to fetch route");
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          // OSRM returns GeoJSON coordinates as [lng, lat], Leaflet expects [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
          setRouteCoordinates(coords);
        } else {
          setRouteCoordinates(positions);
        }
      } catch (e) {
        console.error("OSRM Routing error falling back to straight lines:", e);
        setRouteCoordinates(positions);
      }
    };

    fetchRoute();
  }, [JSON.stringify(positions)]);

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} color="#6366f1" weight={5} opacity={0.8} />
        )}

        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.position.lat, marker.position.lng]}>
            <Popup>
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
            </Popup>
          </Marker>
        ))}

        {userLoc && (
          <CircleMarker 
            center={userLoc} 
            radius={8} 
            pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}

        <MapUpdater activeMarkerId={activeMarkerId} markers={markers} />
      </MapContainer>
    </div>
  );
}
