"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Float } from "@react-three/drei";
import { useThemeStore } from "@/store/themeStore";

export function FloatingElements() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const elementColor = isDark ? "#8b5cf6" : "#4f46e5"; // Abstract purple/indigo

  // Generate some random positions for the floating elements in a spherical shell around the globe
  const elements = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const radius = 2.8 + Math.random() * 0.5;
      const phi = Math.acos(-1 + (2 * i) / 8);
      const theta = Math.sqrt(8 * Math.PI) * phi;
      
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      const scale = 0.03 + Math.random() * 0.04;
      arr.push({ position: [x, y, z] as [number, number, number], scale });
    }
    return arr;
  }, []);

  return (
    <group>
      {elements.map((el, index) => (
        <Float 
          key={index} 
          speed={1.5} 
          rotationIntensity={2} 
          floatIntensity={2}
          position={el.position}
        >
          <mesh scale={el.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color={elementColor}
              wireframe={true}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}

      {/* Adding a subtle particle ring around the globe */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.01, 16, 100]} />
        <meshBasicMaterial 
          color={isDark ? "#ffffff" : "#000000"} 
          transparent 
          opacity={isDark ? 0.05 : 0.03} 
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[3.8, 0.005, 16, 100]} />
        <meshBasicMaterial 
          color={isDark ? "#ffffff" : "#000000"} 
          transparent 
          opacity={isDark ? 0.03 : 0.02} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
