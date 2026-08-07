"use client";
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const DESTINATIONS = [
  {
    id: "tokyo",
    name: "Tokyo, Japan",
    description: "Neon lights, ancient temples, and incredible street food.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000&auto=format&fit=crop",
    tags: ["Culture", "Food", "City"],
  },
  {
    id: "santorini",
    name: "Santorini, Greece",
    description:
      "Iconic white-washed buildings and stunning Mediterranean sunsets.",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop",
    tags: ["Romance", "Beach", "Relax"],
  },
  {
    id: "banff",
    name: "Banff, Canada",
    description: "Majestic rocky peaks and crystal-clear turquoise lakes.",
    image:
      "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=2000&auto=format&fit=crop",
    tags: ["Nature", "Hiking", "Adventure"],
  },
  {
    id: "bali",
    name: "Bali, Indonesia",
    description: "Lush jungles, vibrant culture, and world-class surfing.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2000&auto=format&fit=crop",
    tags: ["Tropical", "Wellness", "Beach"],
  },
];

export function TrendingDestinations() {
  return (
    <div className="space-y-6 animate-fade-in mt-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Get Inspired
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Trending destinations recommended just for you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DESTINATIONS.map((dest, idx) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <Card className="overflow-hidden border-none shadow-lg h-[280px] relative cursor-pointer">
              {/* Background Image with Hover Zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${dest.image})` }}
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300" />

              <CardContent className="absolute inset-0 p-6 flex flex-col justify-end z-10 text-white">
                <div className="flex gap-2 mb-3">
                  {dest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> {dest.name}
                </h3>

                <p className="text-white/80 text-sm line-clamp-2 mb-4">
                  {dest.description}
                </p>

                <div className="translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full gap-2 shadow-xl shadow-primary/25"
                    asChild
                  >
                    <Link
                      href={`/trip-planner?destination=${encodeURIComponent(dest.name)}`}
                    >
                      Plan a trip here <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
