"use client";
import { lazy, Suspense } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import { motion, useScroll, useTransform } from "framer-motion";

// New Components
import { TrendingTrips } from "@/components/home/TrendingTrips";
import { Features } from "@/components/home/Features";
import { Testimonials } from "@/components/home/Testimonials";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/FAQ";
import { CobeGlobe } from "@/components/ui/cobe-globe";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TiltCard } from "@/components/ui/tilt-card";

// Lazy load the heavy 3D background component
const Scroll3DBackground = lazy(() => import("@/components/home/Scroll3DBackground").then(module => ({ default: module.Scroll3DBackground })));

import dynamic from "next/dynamic";
const InteractiveGlobe = dynamic(() => import("@/components/home/3d/InteractiveGlobe").then(mod => mod.InteractiveGlobe), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center animate-pulse bg-primary/5 rounded-full" />
});

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  
  // Parallax calculations
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const globeOpacity = useTransform(scrollY, [0, 600], [0.6, 0]);
  const globeScale = useTransform(scrollY, [0, 600], [1, 0.8]);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-transparent">
      {/* 3D Background with Suspense */}
      <Suspense fallback={<div className="fixed inset-0 bg-background -z-10" />}>
        <Scroll3DBackground />
      </Suspense>

      {/* ============================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4">
        {/* Globe Background for reliable rendering on mobile */}
        <motion.div 
          style={{ opacity: globeOpacity, scale: globeScale }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center"
        >
          <div className="w-[150%] max-w-[1200px] h-[150%] flex items-center justify-center">
            <InteractiveGlobe />
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: MOTION_EASE }}
          className="text-center max-w-4xl mx-auto flex flex-col items-center relative z-10 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 text-sm font-medium backdrop-blur-md">
            <Globe className="h-4 w-4" /> AI-Powered Trip Planning
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-foreground leading-[1.1]">
            Plan smarter. <br className="hidden md:block" />
            <span className="text-muted-foreground">Travel better.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl">
            Tell us where you want to go, how long, and your budget.
            Our AI builds a day-by-day itinerary in seconds.
          </p>

          <div className="w-full max-w-3xl glass p-4 rounded-2xl shadow-lg pointer-events-auto">
            <HeroSearchBar />
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* 2. FEATURES */}
      {/* ============================================ */}
      <Features />

      {/* ============================================ */}
      {/* 3. POPULAR DESTINATIONS */}
      {/* ============================================ */}
      <section className="relative z-10 py-32 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Popular Destinations</h2>
              <p className="text-muted-foreground text-lg">
                Curated picks based on traveler ratings and seasonal trends.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-2 rounded-full" asChild>
              <Link href="/destinations">
                View Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_DESTINATIONS.slice(0, 4).map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: MOTION_EASE }}
              >
                  <TiltCard 
                    className="group h-[400px] shadow-md hover:shadow-xl transition-shadow duration-500"
                    onClick={() => router.push(`/destinations/${dest.id}`)}
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      style={{ transform: "translateZ(-10px)" }} // Push image back slightly
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    
                    <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/10" style={{ transform: "translateZ(30px)" }}>
                      <Star className="h-3 w-3 fill-white" /> {dest.rating}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20" style={{ transform: "translateZ(40px)" }}>
                      <h3 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-md">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <MapPin className="h-4 w-4" /> {dest.country}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
            ))}
          </div>

          {/* Interactive Globe Section */}
          <div className="mt-24 pt-16 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
                Explore every continent.
              </h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                See where travelers are headed right now. Our routing engine finds the most efficient multi-stop paths across 150+ countries.
              </p>
              <div className="flex gap-4">
                <div className="bg-card border border-border p-4 rounded-2xl flex-1 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    <AnimatedCounter value={150} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl flex-1 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    <AnimatedCounter value={10000} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Routes Optimized</div>
                </div>
              </div>
            </div>
            <div className="relative pointer-events-auto flex items-center justify-center h-[500px]">
              <InteractiveGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. TRENDING TRIPS */}
      {/* ============================================ */}
      <TrendingTrips />

      {/* ============================================ */}
      {/* 5. TESTIMONIALS */}
      {/* ============================================ */}
      <Testimonials />

      {/* ============================================ */}
      {/* 6. PRICING */}
      {/* ============================================ */}
      <Pricing />

      {/* ============================================ */}
      {/* 7. FAQ */}
      {/* ============================================ */}
      <FAQ />

      {/* ============================================ */}
      {/* 8. CTA SECTION (Plan My Trip) */}
      {/* ============================================ */}
      <section className="relative z-10 py-32 mb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
          className="container mx-auto max-w-5xl bg-card p-16 rounded-2xl text-center border border-border shadow-md relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold tracking-tight">
              Start planning your next trip
            </h2>
            <p className="text-lg text-muted-foreground">
              Tell us where you want to go. Our AI handles the rest.
            </p>
            <Button
              size="lg"
              variant="default"
              className="rounded-full h-14 px-10 text-lg font-medium shadow-sm hover:-translate-y-0.5 transition-transform"
              asChild
            >
              <Link href="/dashboard">
                Plan My Trip <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
