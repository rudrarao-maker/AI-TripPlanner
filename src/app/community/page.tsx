"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Eye, Loader2, Globe2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  travelers: number;
  travelStyle: string;
  createdAt: string;
  authorName: string | null;
  authorAvatar: string | null;
}

export default function CommunityFeedPage() {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPublicTrips() {
      try {
        const res = await fetch("/api/community");
        const json = await res.json();
        if (json.success) {
          setTrips(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch community trips", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicTrips();
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 pb-20 pt-28">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold mb-2 tracking-wide uppercase">
              <Globe2 className="h-5 w-5" />
              <span>Explore</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Community Feed</h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
              Discover amazing itineraries created by fellow travelers. Clone them or use them as inspiration for your next adventure.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <Card className="glass-card border-dashed p-12 text-center">
            <Globe2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No public trips yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your itinerary with the community!</p>
            <Button onClick={() => router.push("/my-trips")}>Go to My Trips</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card overflow-hidden group cursor-pointer border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5" onClick={() => router.push(`/trip/${trip.id}`)}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={trip.coverImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"} 
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground flex items-center gap-1.5 shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {trip.destination}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold line-clamp-1 mb-1">{trip.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/80 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(trip.startDate), "MMM d")}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {trip.travelers}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {trip.authorAvatar ? (
                        <img src={trip.authorAvatar} alt="Author" className="w-8 h-8 rounded-full border border-border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {trip.authorName ? trip.authorName.charAt(0) : "A"}
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-semibold leading-none">{trip.authorName || "Anonymous Traveler"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{trip.travelStyle} Style</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
