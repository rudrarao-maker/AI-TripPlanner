"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Utensils, Hotel, Camera, ShoppingBag, Train, Plane, Music, Landmark } from "lucide-react";

/* ─── Category → color & icon mapping ─── */
const CATEGORY_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  transit:    { color: "#38bdf8", glow: "0 0 16px #38bdf8aa", label: "Transit" },
  food:       { color: "#fb923c", glow: "0 0 16px #fb923caa", label: "Food" },
  activity:   { color: "#a78bfa", glow: "0 0 16px #a78bfaaa", label: "Activity" },
  hotel:      { color: "#34d399", glow: "0 0 16px #34d399aa", label: "Stay" },
  shopping:   { color: "#f472b6", glow: "0 0 16px #f472b6aa", label: "Shopping" },
  sightseeing:{ color: "#facc15", glow: "0 0 16px #facc15aa", label: "Sightseeing" },
  transport:  { color: "#38bdf8", glow: "0 0 16px #38bdf8aa", label: "Transport" },
  default:    { color: "#818cf8", glow: "0 0 16px #818cf8aa", label: "Point" },
};

function getCategoryConfig(category?: string) {
  if (!category) return CATEGORY_CONFIG.default;
  const key = category.toLowerCase();
  return CATEGORY_CONFIG[key] || CATEGORY_CONFIG.default;
}

/* ─── Custom numbered + colored marker ─── */
function createCustomIcon(index: number, category?: string, isActive = false) {
  const config = getCategoryConfig(category);
  const size = isActive ? 42 : 34;
  const fontSize = isActive ? 16 : 13;
  const borderWidth = isActive ? 3 : 2;

  return L.divIcon({
    className: "custom-route-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${config.color};
        border: ${borderWidth}px solid rgba(255,255,255,0.9);
        box-shadow: ${config.glow}, 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: ${fontSize}px;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        cursor: pointer;
        transform: ${isActive ? "scale(1.2)" : "scale(1)"};
        z-index: ${isActive ? 1000 : 100};
      ">${index + 1}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/* ─── Animated polyline dash effect via CSS ─── */
const ANIMATED_POLYLINE_STYLES = `
  .leaflet-interactive.route-line {
    stroke-dasharray: 12, 8;
    animation: route-flow 1.5s linear infinite;
  }
  @keyframes route-flow {
    to { stroke-dashoffset: -20; }
  }
  .route-map-container .leaflet-tile-pane {
    filter: saturate(1.4) contrast(1.1);
  }
  .route-map-container .leaflet-popup-content-wrapper {
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 16px;
    color: #e2e8f0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15);
  }
  .route-map-container .leaflet-popup-tip {
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  .route-map-container .leaflet-popup-close-button {
    color: #94a3b8;
  }
  .custom-route-marker {
    background: none !important;
    border: none !important;
  }
`;

/* ─── Map bounds auto-fit ─── */
function FitBounds({ markers }: { markers: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [markers, map]);
  return null;
}

/* ─── Legend overlay ─── */
function MapLegend({ categories }: { categories: string[] }) {
  const uniqueCategories = Array.from(new Set(categories.map(c => c?.toLowerCase() || "default")));
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/85 backdrop-blur-xl border border-indigo-500/20 rounded-xl px-3 py-2 flex flex-wrap gap-2">
      {uniqueCategories.map((cat) => {
        const config = getCategoryConfig(cat);
        return (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-300">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: config.color, boxShadow: config.glow }}
            />
            <span className="capitalize">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Interactive Route Map ─── */
interface Activity {
  id?: string;
  name: string;
  time?: string;
  location?: string;
  lat: number;
  lng: number;
  category?: string;
  description?: string;
  estimatedCost?: string | number;
  imageUrl?: string;
}

interface InteractiveRouteMapProps {
  activities: Activity[];
  selectedActivityId?: string;
  onActivityClick?: (id: string) => void;
  className?: string;
}

export function InteractiveRouteMap({
  activities,
  selectedActivityId,
  onActivityClick,
  className = "",
}: InteractiveRouteMapProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const validActivities = useMemo(
    () => activities.filter((a) => a.lat && a.lng && !isNaN(a.lat) && !isNaN(a.lng)),
    [activities]
  );

  const path = useMemo(
    () => validActivities.map((a) => [a.lat, a.lng] as [number, number]),
    [validActivities]
  );

  const categories = useMemo(
    () => validActivities.map((a) => a.category || "default"),
    [validActivities]
  );

  // Sync external selected activity
  useEffect(() => {
    if (selectedActivityId) {
      const idx = validActivities.findIndex((a) => a.id === selectedActivityId);
      if (idx >= 0) setActiveIndex(idx);
    }
  }, [selectedActivityId, validActivities]);

  if (validActivities.length === 0) {
    return (
      <div className={`w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-indigo-500/10 ${className}`}>
        <div className="flex flex-col items-center text-slate-400 gap-3">
          <MapPin className="h-10 w-10 text-indigo-400/50" />
          <p className="text-sm font-medium">No locations to display</p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = (index: number) => {
    setActiveIndex(index);
    const activity = validActivities[index];
    onActivityClick?.(activity.id || `activity-${index}`);
    
    // Pan to the marker
    if (mapRef.current) {
      mapRef.current.panTo([activity.lat, activity.lng], { animate: true, duration: 0.5 });
    }
  };

  return (
    <div className={`route-map-container relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/20 ${className}`}>
      {/* Inject animation styles */}
      <style>{ANIMATED_POLYLINE_STYLES}</style>

      {/* Neon glow top border */}
      <div className="absolute top-0 left-0 right-0 h-px z-[1000] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Title overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-xl px-3 py-1.5">
        <Navigation className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">Route Map</span>
      </div>

      <MapContainer
        center={[validActivities[0].lat, validActivities[0].lng]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
        style={{ width: "100%", height: "100%", background: "#0f172a" }}
      >
        <ZoomControl position="bottomright" />
        <FitBounds markers={validActivities} />

        {/* Dark-themed tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Animated route polyline */}
        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{
              color: "#818cf8",
              weight: 4,
              opacity: 0.85,
              dashArray: "12, 8",
              lineCap: "round",
              lineJoin: "round",
              className: "route-line",
            }}
          />
        )}

        {/* Glow / shadow underline for the route */}
        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{
              color: "#818cf8",
              weight: 12,
              opacity: 0.15,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* Markers */}
        {validActivities.map((activity, index) => (
          <Marker
            key={activity.id || `marker-${index}`}
            position={[activity.lat, activity.lng]}
            icon={createCustomIcon(index, activity.category, activeIndex === index)}
            eventHandlers={{
              click: () => handleMarkerClick(index),
            }}
          >
            <Popup>
              <div className="min-w-[220px] p-1">
                {/* Activity image if available */}
                {activity.imageUrl && (
                  <div className="w-full h-28 rounded-lg overflow-hidden mb-2">
                    <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Category badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: `${getCategoryConfig(activity.category).color}22`,
                      color: getCategoryConfig(activity.category).color,
                      border: `1px solid ${getCategoryConfig(activity.category).color}44`,
                    }}
                  >
                    {getCategoryConfig(activity.category).label}
                  </span>
                  {activity.time && (
                    <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                  )}
                </div>

                {/* Activity name */}
                <h4 className="font-bold text-sm text-slate-100 leading-tight mb-1">{activity.name}</h4>

                {/* Location */}
                {activity.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {activity.location}
                  </p>
                )}

                {/* Description */}
                {activity.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{activity.description}</p>
                )}

                {/* Cost */}
                {activity.estimatedCost && Number(activity.estimatedCost) > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Est. Cost</span>
                    <span className="text-xs font-bold text-emerald-400">
                      ₹{Number(activity.estimatedCost).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Category Legend */}
      <MapLegend categories={categories} />

      {/* Activity quick-nav strip */}
      {validActivities.length > 1 && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
          {validActivities.map((activity, index) => {
            const config = getCategoryConfig(activity.category);
            const isActive = activeIndex === index;
            return (
              <button
                key={activity.id || `nav-${index}`}
                onClick={() => handleMarkerClick(index)}
                className="group relative flex items-center gap-2 transition-all duration-200"
                title={activity.name}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white transition-all duration-200"
                  style={{
                    background: isActive ? config.color : `${config.color}55`,
                    boxShadow: isActive ? config.glow : "none",
                    border: `2px solid ${isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)"}`,
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {index + 1}
                </div>
                {/* Hover tooltip */}
                <div className="absolute right-full mr-2 bg-slate-900/90 backdrop-blur-sm text-slate-200 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-indigo-500/20 shadow-xl">
                  {activity.name}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
