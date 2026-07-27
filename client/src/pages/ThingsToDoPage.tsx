import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Search, Filter, Compass, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { THINGS_TO_DO } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

const ACTIVITY_CATEGORIES = ['All', 'Adventure', 'Hiking', 'Beaches', 'Museums', 'Wildlife', 'Water Sports', 'Local Experiences', 'Food Tours'];

export function ThingsToDoPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = THINGS_TO_DO.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-emerald-500/10 to-background pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-bold">
              <Compass className="h-4 w-4" /> Experiences
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Things To Do
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover unforgettable activities, tours, and experiences curated by locals
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities..." className="pl-12 py-6 text-lg rounded-2xl bg-card border-border/50 shadow-xl" />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
          {ACTIVITY_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-emerald-500 text-white shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
              <Card className="glass-card group cursor-pointer overflow-hidden h-full flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">{item.category}</div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><MapPin className="h-3 w-3" /> {item.location}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration}</span>
                    <span>{item.reviews.toLocaleString()} reviews</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">From</span>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <Button variant="gradient" size="sm" className="rounded-full gap-1.5 shadow-lg">
                      <Ticket className="h-4 w-4" /> Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl font-medium">No activities found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
