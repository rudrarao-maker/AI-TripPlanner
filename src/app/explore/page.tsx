"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  Clock,
  Map,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_ITINERARIES } from "@/lib/mockItineraries";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Card3D } from "@/components/ui/3d-card";
import { motion } from "framer-motion";

const TRENDING_DESTINATIONS = [
  {
    id: "1",
    name: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    type: "Cultural",
    rating: 4.9,
    reviews: "12k",
  },
  {
    id: "2",
    name: "Amalfi Coast, Italy",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800",
    type: "Scenic",
    rating: 4.8,
    reviews: "9.5k",
  },
  {
    id: "3",
    name: "Banff, Canada",
    image: "https://images.unsplash.com/photo-1542640244-7e672d6cb461?w=800",
    type: "Nature",
    rating: 4.9,
    reviews: "8k",
  },
];

const CURATED_LISTS = [
  {
    id: "c1",
    title: "Top 10 Culinary Capitals",
    icon: "🍷",
    color: "bg-red-500/10 text-red-500",
  },
  {
    id: "c2",
    title: "Travelers Choice 2026",
    icon: "🏆",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    id: "c3",
    title: "Hidden Gems of Asia",
    icon: "🏮",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "c4",
    title: "Best Digital Nomad Hubs",
    icon: "💻",
    color: "bg-blue-500/10 text-blue-500",
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [publicTrips, setPublicTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await api.get("/trips/public");
        setPublicTrips(data.data || []);
      } catch (err) {
        console.error("Error fetching public trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleClone = async (e: any, tripId: string) => {
    e.stopPropagation();
    toast.loading("Cloning trip...", { id: "clone-trip" });
    try {
      const { data } = await api.post(`/trips/${tripId}/clone`);
      if (data.success) {
        toast.success("Trip cloned successfully!", { id: "clone-trip" });
        router.push(`/trip-planner?id=${data.data.id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Failed to clone trip. Please log in.", { id: "clone-trip" });
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore millions of reviews, tips, and AI-curated itineraries for
            destinations across the globe.
          </p>

          <div className="relative max-w-2xl mx-auto flex items-center shadow-2xl shadow-primary/10 rounded-2xl">
            <Search className="absolute left-4 text-muted-foreground h-6 w-6" />
            <Input
              className="pl-12 py-8 text-lg rounded-2xl glass border-primary/20 bg-card text-foreground"
              placeholder="Search for places, hotels, or restaurants..."
            />
            <Button
              variant="gradient"
              className="absolute right-2 top-2 bottom-2 rounded-xl px-6"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-16">
        {/* Curated Categories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" /> Curated Collections
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURATED_LISTS.map((list) => (
              <Card3D key={list.id} className="h-full">
                <Card
                  className="glass-card hover:bg-muted/50 cursor-pointer border-border/50 h-full border-0 shadow-none bg-transparent"
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${list.color}`}
                    >
                      {list.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold leading-tight">{list.title}</h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Card3D>
            ))}
          </div>
        </section>

        {/* Ready-Made Itineraries */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" /> Ready-Made Itineraries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground">Loading community trips...</div>
            ) : publicTrips.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-muted-foreground border border-dashed rounded-2xl">No public trips found yet. Be the first to share one!</div>
            ) : (
              publicTrips.map((itinerary, index) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/shared/trip/${itinerary.id}`)}
                >
                  <Card3D className="h-full">
                    <Card className="glass-card overflow-hidden group cursor-pointer border-0 shadow-none bg-transparent h-full flex flex-col relative">
                      <div className="absolute top-3 right-3 z-30">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-background/80 backdrop-blur shadow-sm hover:bg-background"
                          onClick={(e) => handleClone(e, itinerary.id)}
                        >
                          Clone Trip
                        </Button>
                      </div>
                      <div className="relative h-48 overflow-hidden bg-muted rounded-t-xl">
                        <div className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          {itinerary.durationDays || 7} Days
                        </div>
                        {itinerary.coverImage ? (
                          <img
                            src={itinerary.coverImage}
                            alt={itinerary.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Map className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" /> {itinerary.destination}
                        </div>
                        <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
                          {itinerary.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {itinerary.description || `A ${itinerary.travelStyle || 'planned'} trip to ${itinerary.destination}`}
                        </p>

                        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-muted px-2 py-1 rounded-md font-medium">
                              {itinerary.travelStyle || "Adventure"}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {itinerary.budget ? `₹${itinerary.budget.toLocaleString()}` : 'Budget Flexible'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Trending Destinations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" /> Trending
              Destinations
            </h2>
            <Button variant="ghost">See all</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRENDING_DESTINATIONS.map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="glass-card overflow-hidden group cursor-pointer border-border/50 h-full">
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10">
                      {dest.type}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                      <h3 className="text-2xl font-bold mb-2">{dest.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/90">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{dest.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{dest.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
