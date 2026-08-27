"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_TAGS = ["All", "Trending", "Adventure", "Romance", "Culture", "Relaxation", "Food"];

const TRENDING_TRIPS = [
  { id: "1", name: "Tokyo Neon Nights", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1994", rating: "4.9", tags: ["Trending", "Food", "Culture"] },
  { id: "2", name: "Amalfi Coast Drive", country: "Italy", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8bb3c?auto=format&fit=crop&q=80&w=2070", rating: "4.8", tags: ["Trending", "Romance", "Relaxation"] },
  { id: "3", name: "Swiss Alps Adventure", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=2070", rating: "5.0", tags: ["Adventure", "Trending"] },
  { id: "4", name: "Bali Bliss", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=2000", rating: "4.7", tags: ["Relaxation", "Romance"] },
];

export function TrendingTrips() {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState("All");

  const filteredTrips = TRENDING_TRIPS.filter(
    trip => selectedTag === "All" || trip.tags.includes(selectedTag)
  );

  return (
    <section className="relative z-10 py-24 bg-transparent" id="inspiration-hub">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent mb-6 text-sm font-medium backdrop-blur-md">
              <TrendingUp className="h-4 w-4" /> Trending Now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Most Loved Itineraries</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">
              The highest-rated AI-generated trips from the past month.
            </p>
          </div>
          <Button variant="outline" className="rounded-full border-border" asChild>
            <Link href="/explore">
              Explore All <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Category Tags (Scrollable on mobile) */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedTag === tag 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Trips Grid (Horizontal swipe on mobile, Grid on desktop) */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-6 md:pb-0 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: MOTION_EASE }}
                className="group relative cursor-pointer snap-center shrink-0 w-[85vw] md:w-auto"
                onClick={() => router.push(`/trip-planner?template=${trip.id}`)}
              >
                <div className="relative h-[400px] md:h-[450px] w-full rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    fill
                    sizes="(max-width: 768px) 85vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap max-w-[70%]">
                    {trip.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {trip.rating}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-md">{trip.name}</h3>
                    <div className="flex items-center justify-between text-white/90 font-medium">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" /> {trip.country}
                      </div>
                      <span className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        Use Template
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
