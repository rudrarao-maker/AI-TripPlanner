import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThemeStore } from "@/store/themeStore";

export function Scroll3DBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    
    // Add fog to blend into background
    const isDark = theme === "dark";
    const bgColor = isDark ? 0x09090b : 0xffffff;
    const particleColor = isDark ? 0x3b82f6 : 0x2563eb; // Primary color
    
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.002);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create abstract globe/sphere with particles
    const geometry = new THREE.IcosahedronGeometry(15, 3);
    
    // Create wireframe material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: particleColor,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    
    // Convert to points
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Add some larger floating particles around it
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: isDark ? 0x8b5cf6 : 0x7c3aed, // Accent color
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Scroll interaction variables
    let scrollY = window.scrollY;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onScroll = () => {
      scrollY = window.scrollY;
      // Calculate rotation based on scroll
      targetRotationX = scrollY * 0.001;
      targetRotationY = scrollY * 0.0005;
      
      // Move camera slightly down as we scroll
      camera.position.y = -(scrollY * 0.01);
    };

    window.addEventListener("scroll", onScroll);

    // Mouse interaction for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    window.addEventListener("mousemove", onMouseMove);

    // Handle resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", onWindowResize);

    // Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Idle rotation
      points.rotation.y += 0.001;
      points.rotation.x += 0.0005;
      
      particlesMesh.rotation.y = -elapsedTime * 0.02;

      // Scroll rotation
      points.rotation.x += (targetRotationX - points.rotation.x) * 0.05;
      points.rotation.y += (targetRotationY - points.rotation.y) * 0.05;

      // Mouse parallax
      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;
      
      points.position.x += (targetX - points.position.x) * 0.02;
      points.position.y += (-targetY - points.position.y) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onWindowResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000"
      style={{ opacity: 0.6 }}
    />
  );
}
