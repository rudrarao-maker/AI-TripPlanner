import { FEATURED_DESTINATIONS } from "@/lib/constants";
import { notFound } from "next/navigation";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
import { z } from "zod";
import { MapPin, Star, Calendar, Wallet, Map, Utensils, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { Suspense } from "react";

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const destination = FEATURED_DESTINATIONS.find(d => d.id === resolvedParams.id);

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <img 
          src={destination.image} 
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg text-center">{destination.name}</h1>
          <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-medium opacity-90 drop-shadow-md">
            <MapPin className="h-6 w-6" /> {destination.country}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        {/* Quick Stats Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-6 md:p-8 flex flex-wrap gap-6 justify-around items-center mb-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Best Season</p>
            <p className="text-lg font-semibold flex items-center justify-center gap-2"><Calendar className="h-5 w-5 text-primary"/> {destination.bestSeason}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Avg. Budget</p>
            <p className="text-lg font-semibold flex items-center justify-center gap-2"><Wallet className="h-5 w-5 text-primary"/> ₹{destination.averageBudget}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Rating</p>
            <p className="text-lg font-semibold flex items-center justify-center gap-2"><Star className="h-5 w-5 text-amber-500 fill-amber-500"/> {destination.rating} / 5</p>
          </div>
          <div>
            <Link href={`/trip-planner?dest=${destination.name}`}>
              <Button size="lg" className="rounded-full text-md font-bold px-8 shadow-lg shadow-primary/20">
                Plan a Trip Here ✨
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Content Section with Suspense for instant page load */}
        <Suspense fallback={
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            <p className="animate-pulse">AI is writing your personalized travel guide for {destination.name}...</p>
          </div>
        }>
          <AITravelGuide destinationName={destination.name} country={destination.country} />
        </Suspense>
      </div>
    </div>
  );
}

// Server Component that fetches the AI Guide
async function AITravelGuide({ destinationName, country }: { destinationName: string, country: string }) {
  try {
    const { object: guide } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: z.object({
        overview: z.string().describe("A beautiful, inspiring 2-paragraph description of the destination."),
        thingsToExplore: z.array(
          z.object({
            name: z.string(),
            description: z.string()
          })
        ).describe("Top 5 must-visit places or activities."),
        famousFood: z.array(
          z.object({
            dishName: z.string(),
            description: z.string()
          })
        ).describe("Top 4 famous local dishes to try.")
      }),
      prompt: `Act as an expert travel guide. Write a captivating and accurate travel guide for ${destinationName}, ${country}.`,
    });

    return (
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        {/* Overview */}
        <section className="bg-muted/30 rounded-3xl p-8 border border-border/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Info className="h-8 w-8 text-primary" /> Overview
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{guide.overview}</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Things to Explore */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Map className="h-8 w-8 text-primary" /> Things to Explore
            </h2>
            <div className="space-y-4">
              {guide.thingsToExplore.map((item, idx) => (
                <div key={idx} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-bold text-foreground mb-2">{item.name}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Famous Food */}
          <section>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Utensils className="h-8 w-8 text-primary" /> Famous Local Food
            </h2>
            <div className="space-y-4">
              {guide.famousFood.map((item, idx) => (
                <div key={idx} className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-bold text-foreground mb-2">{item.dishName}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to generate AI guide:", error);
    return (
      <div className="text-center py-20 text-destructive bg-destructive/10 rounded-2xl">
        <p>Failed to generate the AI travel guide. Please try refreshing.</p>
      </div>
    );
  }
}
