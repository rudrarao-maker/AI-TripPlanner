"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  Trash2,
  Eye,
  Plus,
  Plane,
  Clock,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetTrips } from "@/hooks/useTrips";
import api from "@/lib/api";

export default function MyTripsPage() {
  const router = useRouter();
  const { data: trips = [], isLoading, refetch } = useGetTrips();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    setDeletingId(tripId);
    try {
      await api.delete(`/trips/${tripId}`);
      toast.success("Trip deleted!");
      refetch();
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 w-64 bg-muted rounded-lg animate-pulse mx-auto mb-4" />
            <div className="h-4 w-96 bg-muted rounded-lg animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <Plane className="h-3 w-3" /> Your Adventures
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">My Trips</h1>
            <p className="text-muted-foreground mt-2">
              {trips.length === 0
                ? "You haven't planned any trips yet. Let's change that!"
                : `You have ${trips.length} trip${trips.length === 1 ? "" : "s"} planned.`}
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            className="rounded-full px-8 shadow-lg shadow-primary/20"
            onClick={() => router.push("/trip-planner")}
          >
            <Plus className="mr-2 h-4 w-4" /> Plan New Trip
          </Button>
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No trips yet!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start planning your dream vacation with our AI-powered trip planner.
              Just tell us where you want to go and we'll handle the rest.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="gradient"
                size="lg"
                className="rounded-full"
                onClick={() => router.push("/trip-planner")}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Guided Wizard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => router.push("/trip-planner")}
              >
                Advanced Planner
              </Button>
            </div>
          </motion.div>
        )}

        {/* Trip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip: any, index: number) => {
            const dayCount = trip.days?.length || 0;
            const activityCount = trip.days?.reduce(
              (sum: number, d: any) => sum + (d.activities?.length || 0),
              0,
            ) || 0;

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        trip.coverImage ||
                        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600"
                      }
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md ${
                        trip.status === "completed"
                          ? "bg-green-500/20 text-green-300"
                          : trip.status === "ongoing"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-white/20 text-white"
                      }`}>
                        {trip.status || "planned"}
                      </span>
                    </div>

                    {/* Destination overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white text-xl font-bold drop-shadow-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {trip.destination}
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h4 className="font-semibold text-lg mb-3 line-clamp-1">{trip.title}</h4>

                    {/* Trip Details */}
                    <div className="space-y-2 text-sm text-muted-foreground flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          —{" "}
                          {new Date(trip.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-3.5 w-3.5" />
                        <span>
                          ₹{trip.budget?.toLocaleString()} • {trip.travelStyle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{trip.travelers} travelers</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {dayCount} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" /> {activityCount} activities
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      <Button
                        variant="gradient"
                        size="sm"
                        className="flex-1 rounded-full"
                        onClick={() => router.push(`/itinerary-details/${trip.id}`)}
                        aria-label={`View itinerary for ${trip.title}`}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(trip.id)}
                        disabled={deletingId === trip.id}
                        aria-label={`Delete trip ${trip.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
