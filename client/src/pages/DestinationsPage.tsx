import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Wallet, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FEATURED_DESTINATIONS } from '@/lib/constants';

const CATEGORIES = ['All', 'Beach', 'Adventure', 'Culture', 'Nature', 'Romantic', 'Hill Station', 'Wildlife'];

export function DestinationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredDestinations = FEATURED_DESTINATIONS.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(search.toLowerCase()) || dest.country.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || dest.category.some(c => c.toLowerCase() === activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-primary/10 via-accent/5 to-background pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          >
            Explore Destinations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Discover your next adventure from our curated collection of dream destinations
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
              className="pl-12 py-6 text-lg rounded-2xl bg-card border-border/50 shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-10">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <Card
                className="glass-card group cursor-pointer overflow-hidden border-border/30 h-full flex flex-col"
                onClick={() => navigate(`/plan?dest=${encodeURIComponent(dest.name)}`)}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 z-20 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {dest.rating}
                  </div>

                  {/* Destination Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                    <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                    <div className="flex items-center gap-1.5 text-white/90 text-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {dest.country}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-5 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{dest.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">{dest.bestSeason}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-primary">
                      <Wallet className="h-3.5 w-3.5" />
                      ₹{dest.averageBudget.toLocaleString()}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    Explore <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl font-medium">No destinations found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
