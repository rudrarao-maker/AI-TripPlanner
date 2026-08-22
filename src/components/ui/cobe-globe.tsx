"use client";

import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.1, 0.1, 0.1],
      markers: [
        // Dummy locations for visual appeal (New York, London, Tokyo)
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [51.5074, -0.1278], size: 0.1 },
        { location: [35.6762, 139.6503], size: 0.1 },
      ],
      onRender: (state: any) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        if (!pointerInteracting.current) {
          // Called on every frame, so we keep rotating
          phi += 0.005;
        } else {
          phi += pointerInteractionMovement.current;
        }
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    } as any);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current =
            e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grabbing";
          }
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab";
          }
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          opacity: 1,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  );
}
