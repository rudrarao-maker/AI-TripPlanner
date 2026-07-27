import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, MapPin, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHotels } from '@/hooks/useRecommendations';
import { HotelCard } from '@/components/recommendations/HotelCard';
import { HotelCardSkeleton } from '@/components/ui/Skeletons';

export function HotelSearchPage() {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  });
  const [maxPrice, setMaxPrice] = useState(50000);
  
  const [hasSearched, setHasSearched] = useState(false);

  const { data: hotels = [], isLoading, refetch } = useHotels({ location: searchParams.location, maxPrice }, { enabled: false });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Building2 className="h-10 w-10 text-primary" />
          Hotel Search
        </h1>
        <p className="text-muted-foreground">Find the perfect stay for your trip.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl shadow-xl max-w-4xl mx-auto mb-12 border-primary/20">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium ml-1">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                required
                placeholder="City or location" 
                className="bg-background/50 h-12 pl-10"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Check-in / Out</label>
            <Input 
              required
              type="date" 
              className="bg-background/50 h-12"
              value={searchParams.checkIn}
              onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Guests</label>
            <Input 
              required
              type="number"
              min="1"
              className="bg-background/50 h-12"
              value={searchParams.guests}
              onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <Button type="submit" size="lg" className="w-full md:w-auto h-12 px-8 font-bold gap-2">
              <Search className="h-5 w-5" /> Search Hotels
            </Button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="glass-card p-5 space-y-4 sticky top-24">
              <h3 className="font-bold flex items-center gap-2 border-b pb-2"><Filter className="h-4 w-4" /> Filters</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Max Price</label>
                  <span className="text-sm font-bold text-primary">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  onMouseUp={() => refetch()}
                  onTouchEnd={() => refetch()}
                  className="w-full accent-primary" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹1,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium">Star Rating</label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 5 Stars</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 4 Stars</label>
                  <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 3 Stars</label>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                </>
              ) : hotels.length > 0 ? (
                hotels.map((hotel: any) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={hotel.id}>
                    <HotelCard hotel={{...hotel, checkIn: searchParams.checkIn}} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center p-12 glass-card rounded-2xl">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold">No hotels found</h3>
                  <p className="text-muted-foreground">Try adjusting your search parameters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
