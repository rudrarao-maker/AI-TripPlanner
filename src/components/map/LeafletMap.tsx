"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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
}

export default function LeafletMap({
  center,
  zoom = 12,
  markers = [],
  className = "",
  activeMarkerId,
}: LeafletMapProps) {
  const positions = markers.map((m) => [m.position.lat, m.position.lng] as [number, number]);

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
        
        {positions.length > 1 && (
          <Polyline positions={positions} color="#6366f1" weight={4} opacity={0.7} dashArray="10, 10" />
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
      </MapContainer>
    </div>
  );
}
