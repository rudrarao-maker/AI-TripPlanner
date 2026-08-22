"use client";
import { lazy, Suspense } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearchBar } from "@/components/home/HeroSearchBar";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import { motion } from "framer-motion";

// New Components
import { TrendingTrips } from "@/components/home/TrendingTrips";
import { Features } from "@/components/home/Features";
import { Testimonials } from "@/components/home/Testimonials";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/FAQ";
import { CobeGlobe } from "@/components/ui/cobe-globe";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SafeSpline } from "@/components/ui/safe-spline";

// Lazy load the heavy 3D background component
const Scroll3DBackground = lazy(() => import("@/components/home/Scroll3DBackground").then(module => ({ default: module.Scroll3DBackground })));

export default function LandingPage() {
  const router = useRouter();
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
        {/* Spline 3D Scene Background */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-60">
          <SafeSpline 
            scene="https://prod.spline.design/q0gE0gN-NxtWjEIn/scene.splinecode" 
            fallback={<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 -z-10" />}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto flex flex-col items-center relative z-10 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 text-sm font-medium backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> The Future of Travel
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-6 text-foreground leading-[1.1] drop-shadow-sm">
            Experience <br className="hidden md:block" />
            <span className="italic font-light text-muted-foreground">the world</span> differently.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl font-light">
            An intelligent travel companion that crafts perfect itineraries,
            finds hidden gems, and manages your bookings seamlessly.
          </p>

          <div className="w-full max-w-3xl glass p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-auto">
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
              <h2 className="text-4xl font-bold tracking-tight mb-4">Popular Destinations</h2>
              <p className="text-muted-foreground text-lg font-light">
                Discover destinations tailored to your taste.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex gap-2 rounded-full hover:bg-white/5 backdrop-blur-md" asChild>
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
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div 
                  className="group cursor-pointer relative h-[400px] rounded-3xl overflow-hidden shadow-2xl"
                  onClick={() => router.push(`/destinations/${dest.id}`)}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/10">
                    <Star className="h-3 w-3 fill-white" /> {dest.rating}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white mb-2 font-heading tracking-wide">
                      {dest.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/70 text-sm font-light">
                      <MapPin className="h-4 w-4" /> {dest.country}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Globe Section */}
          <div className="mt-24 pt-16 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
                Connect your journey.
              </h3>
              <p className="text-muted-foreground text-lg mb-8 font-light max-w-md">
                Spin the globe and see where fellow travelers are exploring right now. Our AI routing engine calculates the most efficient path across oceans.
              </p>
              <div className="flex gap-4">
                <div className="glass p-4 rounded-2xl flex-1 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">150+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
                <div className="glass p-4 rounded-2xl flex-1 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">10k+</div>
                  <div className="text-sm text-muted-foreground">Routes Optimized</div>
                </div>
              </div>
            </div>
            <div className="relative pointer-events-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <CobeGlobe />
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-5xl glass p-16 rounded-[3rem] text-center border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-5xl font-bold tracking-tighter">
              Ready to embark?
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Your next extraordinary journey begins with a single click. Let AI design the perfect itinerary for you.
            </p>
            <Button
              size="lg"
              variant="default"
              className="rounded-full h-14 px-10 text-lg font-medium shadow-xl hover:scale-105 transition-transform"
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

