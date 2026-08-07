"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useThemeStore } from "@/store/themeStore";

interface Location {
  name: string;
  lat: number;
  lng: number;
}

const DESTINATIONS: Location[] = [
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
];

const RADIUS = 2.02; // Slightly above the globe surface

function getPosition(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return [x, y, z];
}

export function DestinationPoints() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const pointColor = isDark ? "#8b5cf6" : "#7c3aed"; // Accent purple

  return (
    <group>
      {DESTINATIONS.map((dest, i) => {
        const position = getPosition(dest.lat, dest.lng, RADIUS);
        
        return (
          <group key={i} position={position}>
            {/* Glowing core */}
            <mesh>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color={pointColor} />
            </mesh>
            
            {/* Outer aura */}
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial 
                color={pointColor} 
                transparent 
                opacity={0.4} 
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
