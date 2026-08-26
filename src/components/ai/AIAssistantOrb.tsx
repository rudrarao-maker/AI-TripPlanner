"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

export type AIOrbState = "idle" | "thinking" | "generating" | "success" | "error";

interface AIAssistantOrbProps {
  state: AIOrbState;
  className?: string;
}

function OrbCore({ state }: { state: AIOrbState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Target values based on state
  const targetDistort = useMemo(() => {
    switch (state) {
      case "thinking": return 0.6;
      case "generating": return 0.8;
      case "success": return 0.2;
      case "error": return 0.5;
      default: return 0.3; // idle
    }
  }, [state]);

  const targetSpeed = useMemo(() => {
    switch (state) {
      case "thinking": return 4;
      case "generating": return 8;
      case "success": return 1;
      case "error": return 5;
      default: return 2; // idle
    }
  }, [state]);

  const targetColor = useMemo(() => {
    switch (state) {
      case "thinking": return new THREE.Color("#0ea5e9"); // Light Blue
      case "generating": return new THREE.Color("#0d9488"); // Teal
      case "success": return new THREE.Color("#22c55e"); // Green
      case "error": return new THREE.Color("#ef4444"); // Red
      default: return new THREE.Color(isDark ? "#ffffff" : "#09090b"); // Default
    }
  }, [state, isDark]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      // Smoothly interpolate material properties
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, delta * 2);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, delta * 2);
      materialRef.current.color.lerp(targetColor, delta * 3);
    }
    
    if (meshRef.current) {
      // Faster rotation during generation
      const rotSpeed = state === "generating" ? 2 : 0.5;
      meshRef.current.rotation.y += delta * rotSpeed;
      meshRef.current.rotation.x += delta * (rotSpeed * 0.5);
    }
  });

  return (
    <Float speed={state === "idle" ? 2 : 1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color={targetColor}
          envMapIntensity={isDark ? 1 : 0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          metalness={0.8}
          roughness={0.2}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export function AIAssistantOrb({ state, className = "" }: AIAssistantOrbProps) {
  return (
    <div className={`relative w-32 h-32 ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#0d9488" />
        
        <OrbCore state={state} />

        {/* Dynamic particles based on state */}
        {state === "generating" && (
          <Sparkles count={50} scale={3} size={2} speed={0.4} opacity={0.5} color="#0d9488" />
        )}
        {state === "thinking" && (
          <Sparkles count={20} scale={2} size={1} speed={0.2} opacity={0.3} color="#0ea5e9" />
        )}
      </Canvas>
    </div>
  );
}
