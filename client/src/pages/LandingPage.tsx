import { Link } from 'react-router-dom';
import { Map, Plane, Sparkles, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FEATURED_DESTINATIONS, HOW_IT_WORKS, TESTIMONIALS, STATS } from '@/lib/constants';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
            alt="Travel Background" 
            className="w-full h-full object-cover opacity-30 dark:opacity-20 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl z-0" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Plan Your Dream Trip <br className="hidden md:block" />
            in <span className="gradient-text">Seconds</span> with AI
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Enter your destination and preferences, and our advanced AI will instantly generate a personalized, day-by-day itinerary complete with hotels, restaurants, and attractions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up w-full sm:w-auto" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" variant="gradient" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg group" asChild>
              <Link to="/plan">
                Start Planning Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg" asChild>
              <Link to="/explore">Explore Destinations</Link>
            </Button>
          </div>
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

      {/* Featured Destinations */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Destinations</h2>
              <p className="text-muted-foreground text-lg">Discover the most popular spots our users are traveling to right now.</p>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/explore">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_DESTINATIONS.slice(0, 6).map((dest) => (
              <Card key={dest.id} className="glass-card group overflow-hidden border-border/50">
                <div className="relative h-48 sm:h-60 overflow-hidden">
                  <img 
                    src={`https://source.unsplash.com/600x400/?${encodeURIComponent(dest.name + ' travel')}`} 
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1 shadow-sm">{dest.name}</h3>
                      <div className="flex items-center text-white/90 text-sm font-medium">
                        <MapPin className="h-4 w-4 mr-1" />
                        {dest.country}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-white flex items-center font-bold text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {dest.rating}
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {dest.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">From </span>
                      <span className="font-bold text-foreground">₹{dest.averageBudget.toLocaleString()}</span>
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/plan?dest=${dest.name}`}>Plan Trip</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/explore">View All Destinations</Link>
            </Button>
          </div>
        </div>
      </section>

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
