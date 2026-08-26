"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number; // Max tilt in degrees (default 5, keep it subtle!)
}

export function TiltCard({ children, className = "", onClick, maxTilt = 5 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Track mouse position relative to the center of the card (-1 to 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth the motion values for that premium SaaS feel
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Convert normalized mouse position to rotation degrees
  const rotateX = useTransform(smoothY, [-1, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [-1, 1], [-maxTilt, maxTilt]);

  // Optional: subtle glare/lighting effect based on mouse position
  const glareOpacity = useTransform(smoothY, [-1, 1], [0.1, 0]);
  const glareY = useTransform(smoothY, [-1, 1], ["-20%", "120%"]);
  const glareX = useTransform(smoothX, [-1, 1], ["-20%", "120%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate mouse position relative to center of card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize to -1 to 1 range
    const normalizedX = (mouseX / rect.width) * 2 - 1;
    const normalizedY = (mouseY / rect.height) * 2 - 1;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer ${className}`}
    >
      {/* 3D Depth wrapper for children */}
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} 
        className="w-full h-full"
      >
        {children}
      </div>

      {/* Subtle glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
        style={{
          opacity: glareOpacity,
          top: glareY,
          left: glareX,
          scale: 1.5,
          transform: "translateZ(40px)",
        }}
      />
    </motion.div>
  );
}
