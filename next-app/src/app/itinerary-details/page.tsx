"use client";
import { useRouter, useParams } from 'next/navigation';
import { MOCK_ITINERARIES } from "@/lib/mockItineraries";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, CreditCard, ChevronLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function ItineraryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const itinerary = MOCK_ITINERARIES.find((i) => i.id === id);

  if (!itinerary) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Itinerary not found</h1>
        <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
      </div>
    );
  }

  const handleUseItinerary = () => {
    // In a real app, this would dispatch to a store or API to clone the itinerary
    // For now, we redirect to the trip planner and pre-fill the destination
    router.push(
      `/plan?dest=${encodeURIComponent(itinerary.destination)}&days=${itinerary.durationDays}`,
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-muted/20">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={itinerary.coverImage}
          alt={itinerary.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-24 left-4 md:left-8 z-20">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => router.push(-1)}
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
              {itinerary.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> {itinerary.durationDays} Days
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Est.{" "}
                {itinerary.estimatedCost}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl flex flex-col md:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">About this trip</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {itinerary.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-8">Day-by-Day Itinerary</h2>
            <div className="space-y-12">
              {itinerary.days.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: dayIndex * 0.1, duration: 0.5 }}
                  className="relative pl-8 md:pl-0"
                >
                  {/* Timeline line */}
                  <div className="hidden md:block absolute left-[11.5px] top-10 bottom-[-48px] w-0.5 bg-border z-0" />

                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="md:w-32 shrink-0 pt-2 flex items-center md:items-start gap-4 md:gap-0">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-md md:absolute md:left-2 md:-translate-x-1/2 md:z-10 relative z-10 ring-4 ring-background">
                        {day.day}
                      </div>
                      <h3 className="text-xl font-bold md:pl-6 text-primary">
                        Day {day.day}
                      </h3>
                    </div>

                    <div className="flex-1 space-y-6">
                      <h4 className="text-2xl font-bold">{day.title}</h4>

                      <div className="space-y-6">
                        {day.activities.map((activity, actIndex) => (
                          <div
                            key={actIndex}
                            className="bg-card border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row gap-5">
                              {activity.imageUrl && (
                                <img
                                  src={activity.imageUrl}
                                  alt={activity.title}
                                  className="w-full sm:w-32 h-32 object-cover rounded-lg shrink-0"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mb-2 bg-muted inline-flex px-2 py-0.5 rounded-md">
                                  <Clock className="h-3 w-3" /> {activity.time}
                                </div>
                                <h5 className="text-lg font-bold mb-2">
                                  {activity.title}
                                </h5>
                                <p className="text-muted-foreground">
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <div className="sticky top-24 bg-card border border-border p-6 rounded-2xl shadow-lg flex flex-col gap-6">
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

            <div className="text-xs text-center text-muted-foreground">
              Estimated costs are based on historical data and do not include
              flights.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
