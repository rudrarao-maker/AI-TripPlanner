"use client";
import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

interface GlobeMapProps {
  origin?: { lat: number; lng: number; name?: string };
  destination?: { lat: number; lng: number; name?: string };
  isInteractive?: boolean;
}

export function GlobeMap({ origin, destination, isInteractive = true }: GlobeMapProps) {
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle resizing to ensure globe fits container perfectly
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    
    // Use ResizeObserver for more reliable container size tracking
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Configure controls
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableZoom = isInteractive;
      
      // Add a cinematic fly-to animation when destination loads
      if (destination) {
        setTimeout(() => {
          // Point camera at destination from a good altitude
          globeEl.current.pointOfView({ lat: destination.lat, lng: destination.lng, altitude: 0.7 }, 3000);
          
          // Slow down rotation significantly once we arrive
          setTimeout(() => {
            if (globeEl.current) {
               globeEl.current.controls().autoRotateSpeed = 0.1;
            }
          }, 3000);
        }, 1000);
      } else {
        // Just spin normally if no destination
        globeEl.current.controls().autoRotateSpeed = 0.5;
      }
    }
  }, [destination, isInteractive]);

  // Create marker data
  const markerData = destination ? [{
    lat: destination.lat,
    lng: destination.lng,
    name: destination.name || "Destination",
  }] : [];

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] bg-[#0b0b19] relative rounded-2xl overflow-hidden shadow-xl flex items-center justify-center cursor-move"
    >
      {/* Fallback loading state before dimensions calculate */}
      {dimensions.width === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-primary/50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          
          // Free high-res textures from public unpkg CDNs!
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // HTML overlay markers
          htmlElementsData={markerData}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            el.innerHTML = `
              <div class="flex flex-col items-center pointer-events-none" style="transform: translate(-50%, -100%); margin-top: -10px;">
                <div class="px-3 py-1 bg-background/90 backdrop-blur-md border border-border text-foreground text-xs rounded-lg shadow-xl font-bold whitespace-nowrap mb-2">
                  📍 ${d.name}
                </div>
                <div class="w-5 h-5 bg-primary rounded-full border-[3px] border-white shadow-xl flex items-center justify-center animate-bounce">
                </div>
              </div>
            `;
            return el;
          }}
        />
      )}
    </div>
  );
}
