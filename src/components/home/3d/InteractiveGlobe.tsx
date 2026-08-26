"use client";
import { useEffect, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import { useTheme } from "next-themes";
import * as THREE from 'three';

const ARC_REL_LEN = 0.4;
const FLIGHT_TIME = 2000;
const NUM_RINGS = 3;

const LOCATIONS = [
  { lat: 40.7128, lng: -74.0060, name: "New York" },
  { lat: 48.8566, lng: 2.3522, name: "Paris" },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
  { lat: 25.2048, lng: 55.2708, name: "Dubai" },
  { lat: -33.8688, lng: 151.2093, name: "Sydney" },
  { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro" },
];

export function InteractiveGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [arcsData, setArcsData] = useState<any[]>([]);
  const [ringsData, setRingsData] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setIsMounted(true);
    
    // Generate initial connections
    const connections = [];
    for (let i = 0; i < LOCATIONS.length; i++) {
      for (let j = i + 1; j < LOCATIONS.length; j++) {
        // Randomly connect some nodes
        if (Math.random() > 0.5) {
          connections.push({
            startLat: LOCATIONS[i].lat,
            startLng: LOCATIONS[i].lng,
            endLat: LOCATIONS[j].lat,
            endLng: LOCATIONS[j].lng,
            color: ['#0d9488', '#14b8a6'] // Teal colors
          });
        }
      }
    }
    setArcsData(connections);
    setRingsData(LOCATIONS);

    // Initial spin setup
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1.0;
      globeRef.current.controls().enableZoom = false; // Disable zoom on landing page to not interfere with scroll
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  // Periodic random flights
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      const source = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const target = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      
      if (source.name !== target.name) {
        setArcsData(prev => [...prev.slice(-15), {
          startLat: source.lat,
          startLng: source.lng,
          endLat: target.lat,
          endLng: target.lng,
          color: ['#0ea5e9', '#0d9488']
        }]);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted || dimensions.width === 0) return null;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={isDark 
          ? "//unpkg.com/three-globe/example/img/earth-dark.jpg"
          : "//unpkg.com/three-globe/example/img/earth-day.jpg"}
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={ARC_REL_LEN}
        arcDashGap={2}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={FLIGHT_TIME}
        arcsTransitionDuration={0}
        
        ringsData={ringsData}
        ringColor={() => '#0d9488'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}
        
        htmlElementsData={LOCATIONS}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `<div class="px-2 py-1 bg-background/80 backdrop-blur-md rounded border border-border text-xs font-medium whitespace-nowrap">${d.name}</div>`;
          el.style.pointerEvents = 'none';
          return el;
        }}
      />
    </div>
  );
}
