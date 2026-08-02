import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useThemeStore } from "@/store/themeStore";

interface Route {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

// Some sample routes
const ROUTES: Route[] = [
  { start: { lat: 23.0225, lng: 72.5714 }, end: { lat: 25.2048, lng: 55.2708 } }, // Ahmedabad -> Dubai
  { start: { lat: 23.0225, lng: 72.5714 }, end: { lat: 51.5074, lng: -0.1278 } }, // Ahmedabad -> London
  { start: { lat: 23.0225, lng: 72.5714 }, end: { lat: 1.3521, lng: 103.8198 } }, // Ahmedabad -> Singapore
  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 40.7128, lng: -74.0060 } }, // London -> New York
  { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: 35.6762, lng: 139.6503 } }, // Singapore -> Tokyo
];

const RADIUS = 2.05; // Curve slightly above the globe

function getPosition(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

function getCurvePoints(start: Route["start"], end: Route["end"]) {
  const vStart = getPosition(start.lat, start.lng, RADIUS);
  const vEnd = getPosition(end.lat, end.lng, RADIUS);

  // Control point is pushed outwards to form a curve
  const distance = vStart.distanceTo(vEnd);
  const midPoint = vStart.clone().lerp(vEnd, 0.5);
  // Normalize midpoint and extend it
  midPoint.normalize().multiplyScalar(RADIUS + distance * 0.3);

  const curve = new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
  return curve.getPoints(50);
}

function AnimatedLine({ points, color }: { points: THREE.Vector3[], color: string }) {
  const materialRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.dashOffset -= delta * 0.5; // Animate dash
    }
  });

  return (
    <Line 
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.6}
      dashed={true}
      dashSize={0.5}
      dashScale={1}
      dashOffset={0}
      gapSize={1}
    >
      <lineDashedMaterial ref={materialRef} attach="material" color={color} dashSize={0.5} gapSize={1} transparent opacity={0.6} depthTest={true} />
    </Line>
  );
}

export function TravelRoutes() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const routeColor = isDark ? "#60a5fa" : "#3b82f6";

  const allRoutePoints = useMemo(() => {
    return ROUTES.map(r => getCurvePoints(r.start, r.end));
  }, []);

  return (
    <group>
      {allRoutePoints.map((points, i) => (
        <AnimatedLine key={i} points={points} color={routeColor} />
      ))}
    </group>
  );
}
