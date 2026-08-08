"use client";
import { useRouter, useParams } from 'next/navigation';
import { useGetTrip } from "@/hooks/useTrips";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, CreditCard, ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const DraggableItinerary = dynamic(() => import("@/components/itinerary/DraggableItinerary").then((mod) => mod.DraggableItinerary), { ssr: false, loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-3xl" /> });
const InteractiveRouteMap = dynamic(() => import("@/components/itinerary/ItineraryMap").then((mod) => mod.InteractiveRouteMap), { ssr: false, loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-3xl" /> });
const ExportPDFButton = dynamic(() => import("@/components/itinerary/ExportPDFButton").then((mod) => mod.ExportPDFButton), { ssr: false });
const BudgetTracker = dynamic(() => import("@/components/budget/BudgetTracker").then((mod) => mod.BudgetTracker), { ssr: false });
const SmartPackingList = dynamic(() => import("@/components/recommendations/SmartPackingList").then((mod) => mod.SmartPackingList), { ssr: false });

export default function ItineraryDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: itinerary, isLoading } = useGetTrip(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Itinerary not found</h1>
        <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
      </div>
    );
  }

  const handleUseItinerary = () => {
    router.push(
      `/trip-planner?dest=${encodeURIComponent(itinerary.destination)}&days=${(itinerary as any).tripDays?.length || 5}`,
    );
  };

  const tripDays = (itinerary as any).tripDays || [];
  const durationDays = tripDays.length;

  return (
    <div className="min-h-screen pb-20 bg-muted/20">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop"
          alt={itinerary.title || "Trip"}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-24 left-4 md:left-8 z-20">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 container mx-auto text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-white/90 font-medium mb-3 uppercase tracking-wider text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{itinerary.destination}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {itinerary.title || `${itinerary.destination} Getaway`}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> {durationDays} Days
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Est.{" "}
                ₹{Number(itinerary.budget).toLocaleString()}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-6 right-6 md:right-12 z-20">
          <ExportPDFButton elementId="itinerary-pdf-content" />
        </div>
      </div>

      <div id="itinerary-pdf-content" className="container mx-auto px-4 md:px-6 py-12 max-w-7xl flex flex-col xl:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-12 w-full">
          <section>
            <h2 className="text-2xl font-bold mb-4">About this trip</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore {itinerary.destination} with a curated plan for {durationDays} days. 
              Features {itinerary.travelStyle} style traveling and {itinerary.hotelCategory} accommodation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-8">Day-by-Day Itinerary</h2>
            <div className="space-y-12">
              {tripDays.map((day: any, dayIndex: number) => {
                // Seed lat/lng from destination name for consistent mock coordinates
                const destHash = (itinerary.destination || "Paris").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
                const baseLat = ((destHash % 180) - 90) * 0.5 + 25;
                const baseLng = ((destHash * 7) % 360) - 180 + 75;

                const mappedActivities = (day.activities || []).map((act: any, i: number) => ({
                  id: act.id || `${day.id}-${i}`,
                  name: act.name,
                  time: act.time,
                  location: act.location,
                  description: act.description,
                  category: act.category || "activity",
                  estimatedCost: act.estimatedCost,
                  imageUrl: act.imageUrl,
                  lat: act.lat || baseLat + (i * 0.008) + (dayIndex * 0.003),
                  lng: act.lng || baseLng + (i * 0.01) - (dayIndex * 0.005),
                }));

                return (
                  <motion.div
                    key={day.id || dayIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: dayIndex * 0.1, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="flex flex-col gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-background">
                          {day.dayNumber}
                        </div>
                        <h3 className="text-xl font-bold text-primary">
                          {new Date(day.date).toLocaleDateString()}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Drag and Drop List */}
                        <div className="bg-card/50 p-4 rounded-2xl border border-border">
                          <DraggableItinerary 
                            initialActivities={mappedActivities} 
                            tripId={itinerary.id} 
                          />
                        </div>

                        {/* Interactive Route Map for the Day */}
                        <div className="h-[450px] w-full rounded-2xl overflow-hidden hidden lg:block">
                          <InteractiveRouteMap activities={mappedActivities} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-[400px] shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <SmartPackingList destination={itinerary.destination} />
            
            <div className="bg-card border border-border p-6 rounded-2xl shadow-lg flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Ready to go?</h3>
                <p className="text-sm text-muted-foreground">
                  Clone this itinerary to your dashboard. You can customize the
                  dates, add new activities, and book hotels directly.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full font-bold text-lg h-14 shadow-lg hover:scale-105 transition-transform"
                onClick={handleUseItinerary}
              >
                Use This Itinerary
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* V2 Budget Tracker Section */}
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl border-t border-border mt-12">
        <h2 className="text-3xl font-bold mb-8">Trip Budget & Expenses</h2>
        <BudgetTracker 
          tripId={itinerary.id}
          totalBudget={Number(itinerary.budget) || 120000} 
          currency="INR" 
          travelers={2} 
          initialExpenses={[]}
        />
      </div>
    </div>
  );
}
