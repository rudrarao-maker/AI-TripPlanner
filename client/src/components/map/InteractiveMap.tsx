import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '../ui/card';
import type { Coordinates } from '@/types';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarker {
  id: string;
  position: Coordinates;
  title: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'destination';
  description?: string;
}

interface InteractiveMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: LocationMarker[];
  className?: string;
  activeMarkerId?: string;
}

// Component to dynamically change map center
function MapUpdater({ center, zoom }: { center: Coordinates; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);
  return null;
}

const createCustomIcon = (isActive: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${isActive ? '#ec4899' : '#6366f1'}; 
      width: ${isActive ? '24px' : '16px'}; 
      height: ${isActive ? '24px' : '16px'}; 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: all 0.3s ease;
      transform: translate(-50%, -50%) ${isActive ? 'scale(1.2)' : 'scale(1)'};
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function InteractiveMap({ center, zoom = 12, markers = [], className = '', activeMarkerId }: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className={`glass bg-muted/20 animate-pulse flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden border-border/50 shadow-md ${className}`}>
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {markers.map((marker) => {
          const isActive = marker.id === activeMarkerId;
          return (
            <Marker 
              key={marker.id} 
              position={[marker.position.lat, marker.position.lng]}
              icon={createCustomIcon(isActive)}
              zIndexOffset={isActive ? 1000 : 0}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                  {marker.description && <p className="text-xs text-muted-foreground">{marker.description}</p>}
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] uppercase font-bold tracking-wider">
                    {marker.type}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Card>
  );
}
