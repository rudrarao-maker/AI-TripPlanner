"use client";
import { useRouter, useParams } from 'next/navigation';
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, Wallet, ChevronLeft, ChevronRight, ArrowRight, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURED_DESTINATIONS, PREMADE_ITINERARIES, DEFAULT_PREMADE_ITINERARIES } from "@/lib/constants";

export default function DestinationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const destination = FEATURED_DESTINATIONS.find((d) => d.id === id);
  const itineraries = id && PREMADE_ITINERARIES[id] ? PREMADE_ITINERARIES[id] : DEFAULT_PREMADE_ITINERARIES;

  if (!destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-3xl font-bold mb-4">Destination Not Found</h1>
        <Button onClick={() => router.push("/destinations")}>Back to Destinations</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 animate-fade-in bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-end pb-16 px-4">
        <img
          src={destination.image}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white mb-6 backdrop-blur-md"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-white/80 font-medium mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-lg tracking-wide uppercase">{destination.country}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-heading drop-shadow-lg">
              {destination.name}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 leading-relaxed">
              {destination.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="glass flex items-center gap-2 px-4 py-2 rounded-full border-white/20 text-white bg-white/10 backdrop-blur-md">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold">{destination.rating} Rating</span>
              </div>
              <div className="glass flex items-center gap-2 px-4 py-2 rounded-full border-white/20 text-white bg-white/10 backdrop-blur-md">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>{destination.bestSeason}</span>
              </div>
              <div className="glass flex items-center gap-2 px-4 py-2 rounded-full border-white/20 text-white bg-white/10 backdrop-blur-md">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>₹{destination.averageBudget.toLocaleString()} avg/trip</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pre-made Itineraries Section */}
      <div className="container mx-auto max-w-6xl px-4 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2">Curated Itineraries</h2>
            <p className="text-muted-foreground">Select a pre-made trip tailored to your budget and style.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-2 mr-4">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => {
                const container = document.getElementById("itinerary-carousel");
                if (container) container.scrollBy({ left: -300, behavior: "smooth" });
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => {
                const container = document.getElementById("itinerary-carousel");
                if (container) container.scrollBy({ left: 300, behavior: "smooth" });
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => router.push(`/plan?dest=${encodeURIComponent(destination.name)}`)}>
              Create Custom Plan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CSS Scroll Snap Carousel Slider */}
        <div id="itinerary-carousel" className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {itineraries.map((itinerary, index) => (
            <motion.div
              key={itinerary.id}
              className="snap-center shrink-0 w-[85vw] sm:w-[400px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="glass-card h-full flex flex-col group overflow-hidden border-border/50">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={itinerary.image}
                    alt={itinerary.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                      {itinerary.travelStyle}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Wallet className="h-4 w-4 text-primary" /> ₹{itinerary.amount.toLocaleString()}
                  </div>
                </div>
                
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{itinerary.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {itinerary.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm font-medium text-foreground/80 mb-6 bg-muted/50 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {itinerary.duration}
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-border pl-4">
                      <Activity className="h-4 w-4 text-primary" />
                      {itinerary.tags[1] || 'Exploration'}
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-xl shadow-md group-hover:shadow-lg transition-all"
                    onClick={() => router.push(`/plan?dest=${encodeURIComponent(destination.name)}&budget=${itinerary.amount}&style=${itinerary.travelStyle.toLowerCase()}&days=${parseInt(itinerary.duration)}`)}
                  >
                    View & Clone Plan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
