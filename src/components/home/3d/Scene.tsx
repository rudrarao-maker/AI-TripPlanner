"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useThemeStore } from "@/store/themeStore";
import * as THREE from "three";

import { TravelGlobe } from "./TravelGlobe";
import { DestinationPoints } from "./DestinationPoints";
import { TravelRoutes } from "./TravelRoutes";
import { FloatingElements } from "./FloatingElements";

function ParallaxCamera({ isMobile, prefersReducedMotion }: { isMobile: boolean, prefersReducedMotion: boolean }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 7.5));
  
  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 0, 2.8);
  }, [camera]);

  useFrame((state) => {
    if (prefersReducedMotion || isMobile) return; // Disable parallax for mobile and accessibility

    // Calculate target position based on mouse (parallax)
    // state.pointer.x and state.pointer.y are normalized between -1 and 1
    const x = state.pointer.x * 0.5;
    const y = state.pointer.y * 0.5;
    
    // Also add scroll effect
    const scrollY = window.scrollY;
    const scrollFactor = scrollY * 0.002;
    
    targetPosition.current.set(x, -y - scrollFactor, 2.8 + scrollFactor);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPosition.current, 0.05);
    camera.lookAt(0, -scrollFactor * 0.5, 0); // Look slightly down when scrolling
  });

  return null;
}

export function Scene() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    
    // Listen for motion preference changes
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    // Detect WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", motionHandler);
    };
  }, []);

  if (!hasWebGL) {
    // Elegant fallback if WebGL is disabled or unavailable
    return (
      <div className={`fixed inset-0 z-0 transition-colors duration-1000 ${isDark ? 'bg-[#09090b]' : 'bg-[#f8fafc]'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000" style={{ opacity: isDark ? 0.8 : 0.6 }}>
      <Canvas 
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 2.8], fov: 40 }}
      >
        {/* Natural Photorealistic Sunlight with High Contrast (Darker) */}
        <ambientLight intensity={isDark ? 0.02 : 0.05} />
        {/* Main Sun Light - dimmed for a moodier look */}
        <directionalLight position={[10, 5, 10]} intensity={1.5} color="#ffffff" />
        {/* Subtle Rim/Fill Light */}
        <directionalLight position={[-10, -5, -10]} intensity={0.5} color={isDark ? "#3b82f6" : "#60a5fa"} />

        <Suspense fallback={null}>
          <group position={[0, -0.5, 0]}>
            <TravelGlobe />
            <DestinationPoints />
            
            {/* Reduce heavy components on mobile / reduced motion */}
            {(!isMobile && !prefersReducedMotion) && (
              <>
                <TravelRoutes />
                <FloatingElements />
              </>
            )}
            
            {/* Simplified version for mobile */}
            {(isMobile && !prefersReducedMotion) && (
              <TravelRoutes />
            )}
          </group>


          <ParallaxCamera isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradient to ensure text readability without completely washing out the globe */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90 z-10 pointer-events-none" />
    </div>
  );
}
