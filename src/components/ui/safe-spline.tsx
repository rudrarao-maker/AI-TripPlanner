"use client";

import React, { useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";

interface SafeSplineProps {
  scene: string;
  fallback: React.ReactNode;
}

export function SafeSpline({ scene, fallback }: SafeSplineProps) {
  const [status, setStatus] = useState<"checking" | "loaded" | "error">("checking");

  useEffect(() => {
    // Pre-flight check to see if the asset is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    fetch(scene, { 
      method: "GET", 
      mode: "no-cors",
      signal: controller.signal 
    })
      .then(() => {
        clearTimeout(timeoutId);
        setStatus("loaded");
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.warn("Spline pre-flight failed (offline or blocked). Using fallback.", err);
        setStatus("error");
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [scene]);

  if (status === "checking") {
    return <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 -z-10 animate-pulse" />;
  }

  if (status === "error") {
    return <>{fallback}</>;
  }

  return <Spline scene={scene} />;
}
