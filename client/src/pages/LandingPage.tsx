import { Link } from 'react-router-dom';
import { Map, Plane, Sparkles, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HOW_IT_WORKS, STATS } from '@/lib/constants';
import { DynamicBackground } from '@/components/home/DynamicBackground';
import { HeroSearchBar } from '@/components/home/HeroSearchBar';
import { RecommendationCarousel } from '@/components/home/RecommendationCarousel';
import { HotelCard } from '@/components/recommendations/HotelCard';
import { TransportCard } from '@/components/recommendations/TransportCard';
import { useHotels, useTransport } from '@/hooks/useRecommendations';

export function LandingPage() {
  const { data: hotels = [] } = useHotels({ maxPrice: 15000 }); // Show some premium hotels on homepage
  const { data: transportOptions = [] } = useTransport({}); // Fetch general flights
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <DynamicBackground />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white mb-6 border border-white/20 shadow-xl animate-fade-in">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold tracking-wide">Google Travel Inspired AI</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Plan Your Dream Trip <br className="hidden md:block" />
            in Seconds.
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 drop-shadow-lg font-medium max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Enter your destination and let our advanced AI build a personalized itinerary complete with live hotel & flight bookings.
          </p>

          <HeroSearchBar />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value.toLocaleString()}{stat.suffix}
                </span>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How TripCraft AI Works</h2>
            <p className="text-muted-foreground text-lg">Your perfect itinerary is just three simple steps away.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border z-0" />
            
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-background shadow-xl flex items-center justify-center text-4xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold">{item.step}. {item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Recommendation Feeds */}
      {hotels.length > 0 && (
        <RecommendationCarousel 
          title="Top Rated Hotels for You" 
          subtitle="Discover luxury stays and budget-friendly options directly from our database."
        >
          {hotels.map((hotel: any) => (
            <div key={hotel.id} className="min-w-[300px] max-w-[300px] md:min-w-[350px] snap-center">
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </RecommendationCarousel>
      )}

      {transportOptions.length > 0 && (
        <RecommendationCarousel 
          title="Explore Flights & Routes" 
          subtitle="Compare travel options from multiple providers."
        >
          {transportOptions.map((transport: any) => (
            <div key={transport.id} className="min-w-[300px] max-w-[300px] md:min-w-[350px] snap-center">
              <TransportCard transport={transport} />
            </div>
          ))}
        </RecommendationCarousel>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to start your adventure?</h2>
            <p className="text-xl text-primary-foreground/80">
              Join thousands of travelers who have already discovered the smartest way to plan their trips.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-lg font-bold shadow-2xl hover:scale-105 transition-transform" asChild>
              <Link to="/plan">
                Generate My Itinerary
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
