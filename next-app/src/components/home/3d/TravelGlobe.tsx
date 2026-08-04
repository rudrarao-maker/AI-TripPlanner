"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useThemeStore } from "@/store/themeStore";

export function TravelGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  // Load realistic textures from stable CDNs
  const [colorMap, bumpMap, specularMap, cloudsMap] = useTexture([
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    "https://unpkg.com/three-globe/example/img/earth-topology.png",
    "https://unpkg.com/three-globe/example/img/earth-water.png",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
  ]);

  // Optimize texture quality
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 16;

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
      globeRef.current.rotation.x += delta * 0.02;
    }
    if (cloudsRef.current) {
      // Clouds rotate slightly faster for dynamic weather effect
      cloudsRef.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Outer Atmosphere Edge Glow */}
      <mesh>
        <sphereGeometry args={[2.12, 64, 64]} />
        <meshBasicMaterial 
          color="#3b82f6"
          transparent
          opacity={isDark ? 0.2 : 0.3}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dynamic Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Photorealistic Earth Surface */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.08}
          roughnessMap={specularMap} // The water map helps differentiate ocean specular highlights
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
