"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Copy, Loader2, Users, Wallet } from "lucide-react";
import toast from "react-hot-toast";

export default function DiscoverPage() {
  const [publicTrips, setPublicTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch("/api/trips/public");
        const data = await res.json();
        if (data.success) {
          setPublicTrips(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch public trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleClone = async (id: string) => {
    try {
      setCloningId(id);
      const res = await fetch(`/api/trips/${id}/clone`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Trip cloned successfully!");
        router.push(`/itinerary-details/${data.data.id}`);
      } else {
        toast.error("Failed to clone trip. Are you logged in?");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCloningId(null);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Community Discover Feed</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore beautiful itineraries published by the community. Found a trip you love? Clone it instantly and make it your own!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : publicTrips.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-2">No public trips yet</h3>
            <p className="text-muted-foreground">Be the first to publish a trip from your dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicTrips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow glass-card border-primary/10">
                <div className="h-48 bg-muted relative overflow-hidden">
                  <img
                    src={`https://source.unsplash.com/1600x900/?${encodeURIComponent(trip.destination)}`}
                    alt={trip.destination}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-md truncate">
                      {trip.title}
                    </h3>
                    <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {trip.destination}
                    </p>
                  </div>
                </div>
                <CardContent className="pt-4 pb-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> 
                      {new Date(trip.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Wallet className="h-4 w-4" /> 
                      {Number(trip.budget).toLocaleString()} {trip.currency}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" /> 
                      {trip.travelers} Travelers
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                        {trip.travelStyle}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="gradient"
                    onClick={() => handleClone(trip.id)}
                    disabled={cloningId === trip.id}
                  >
                    {cloningId === trip.id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cloning...</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-2" /> Clone to My Trips</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
