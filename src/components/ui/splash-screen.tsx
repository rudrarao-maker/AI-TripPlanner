"use client";

import { useEffect, useState } from "react";
import { CobeGlobe } from "./cobe-globe";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setIsVisible(false);
      setIsRendered(false);
      return;
    }

    // Set flag in session storage
    sessionStorage.setItem("hasSeenSplash", "true");

    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Remove from DOM after transition completes (1s transition + 2s display)
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full max-w-md animate-pulse duration-2000">
        <CobeGlobe />
      </div>
      <h1 className="mt-8 text-4xl font-bold tracking-tighter text-white">
        Trip Planner <span className="text-primary">AI</span>
      </h1>
      <p className="mt-4 text-zinc-400">
        Your next adventure awaits...
      </p>
    </div>
  );
}
