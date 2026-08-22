"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const Card3D = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-xl bg-card border border-border shadow-lg transition-colors duration-300 ${className}`}
    >
      {/* Glare effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl z-50 opacity-30 mix-blend-overlay"
          style={{
            background: useTransform(
              () =>
                `radial-gradient(circle at ${
                  (x.get() + 0.5) * 100
                }% ${(y.get() + 0.5) * 100}%, rgba(255,255,255,0.8) 0%, transparent 50%)`
            ),
          }}
        />
      )}
      <div
        style={{
          transform: "translateZ(30px)",
        }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
};
