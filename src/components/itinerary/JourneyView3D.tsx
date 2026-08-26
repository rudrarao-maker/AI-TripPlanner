"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { MapPin } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  category: string;
  lat?: number;
  lng?: number;
}

interface JourneyView3DProps {
  activities: Activity[];
}

function JourneyScene({ activities }: JourneyView3DProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  const lineRef = useRef<any>(null);

  // Generate 3D points based on array index to create a winding journey path
  const points = useMemo(() => {
    return activities.map((_, i) => {
      const angle = (i / activities.length) * Math.PI * 2;
      const radius = 2 + (i % 2 === 0 ? 0.5 : -0.5); // Stagger radius for a zigzag
      const x = Math.cos(angle) * radius;
      const y = (i * 0.5) - (activities.length * 0.25); // Ascending/descending
      const z = Math.sin(angle) * radius;
      return new THREE.Vector3(x, y, z);
    });
  }, [activities]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      // Animate line dashed offset to simulate travel
      lineRef.current.material.dashOffset -= 0.01;
    }
  });

  return (
    <group rotation={[0.2, 0, 0]}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* The connected path */}
        <Line
          ref={lineRef}
          points={points}
          color={isDark ? "#2dd4bf" : "#0d9488"} // Teal
          lineWidth={3}
          dashed={true}
          dashSize={0.5}
          dashScale={2}
          gapSize={0.2}
        />

        {/* The location nodes */}
        {points.map((pos, i) => (
          <group key={activities[i].id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial 
                color={i === 0 ? "#22c55e" : i === points.length - 1 ? "#ef4444" : "#0ea5e9"} 
                emissive={i === 0 ? "#22c55e" : i === points.length - 1 ? "#ef4444" : "#0ea5e9"}
                emissiveIntensity={0.5}
              />
            </mesh>
            <Html distanceFactor={15} center position={[0, 0.4, 0]}>
              <div className="bg-background/90 backdrop-blur-md px-2 py-1 rounded-md border border-border shadow-lg whitespace-nowrap text-xs font-bold flex items-center gap-1 transition-transform hover:scale-110">
                <MapPin className="w-3 h-3 text-primary" />
                {activities[i].name}
              </div>
            </Html>
          </group>
        ))}
      </Float>
    </group>
  );
}

export function JourneyView3D({ activities }: JourneyView3DProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-2xl border border-border">
        <p className="text-muted-foreground font-medium">Add activities to see your journey</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-background to-muted/20 relative shadow-inner cursor-move">
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold border border-border flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Interactive 3D Journey
      </div>
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="city" />
        <JourneyScene activities={activities} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
