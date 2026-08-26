"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

const TRENDING_TRIPS = [
  { id: "1", name: "Tokyo Neon Nights", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1994", rating: "4.9", tags: ["City", "Food", "Culture"] },
  { id: "2", name: "Amalfi Coast Drive", country: "Italy", image: "https://images.unsplash.com/photo-1533682805518-48d1f5a8bb3c?auto=format&fit=crop&q=80&w=2070", rating: "4.8", tags: ["Coastal", "Romance", "Views"] },
  { id: "3", name: "Swiss Alps Adventure", country: "Switzerland", image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=2070", rating: "5.0", tags: ["Nature", "Hiking", "Snow"] }
];

export function TrendingTrips() {
  const router = useRouter();
  
  return (
    <section className="relative z-10 py-32 bg-transparent">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRENDING_TRIPS.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4, ease: MOTION_EASE }}
              className="group relative cursor-pointer"
              onClick={() => router.push(`/trip-planner?destination=${trip.name}`)}
            >
              <div className="relative h-[450px] w-full rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow duration-300">
                <img
                  src={trip.image}
                  alt={trip.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  {trip.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/20">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/10">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {trip.rating}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  <h3 className="text-2xl font-bold text-white mb-2">{trip.name}</h3>
                  <div className="flex items-center justify-between text-white/80">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" /> {trip.country}
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
