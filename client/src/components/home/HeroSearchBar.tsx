import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSearchBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travelers, setTravelers] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;
    
    // Pass destination as query param to the planner
    navigate(`/plan?dest=${encodeURIComponent(destination)}`);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="bg-background/90 backdrop-blur-xl border border-border p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center w-full max-w-4xl mx-auto gap-2 md:gap-0 mt-8 animate-slide-up"
      style={{ animationDelay: '0.3s' }}
    >
      
      {/* Destination */}
      <div className="flex-1 flex items-center px-4 w-full h-12 md:h-14 hover:bg-muted/50 rounded-full transition-colors group cursor-text focus-within:bg-muted/50">
        <MapPin className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Where to?</label>
          <input 
            type="text" 
            placeholder="Search destinations (e.g., Bali, Paris)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-transparent border-none outline-none text-sm md:text-base font-semibold w-full placeholder:font-normal placeholder:text-muted-foreground"
            required
          />
        </div>
      </div>

      <div className="hidden md:block w-[1px] h-8 bg-border mx-2" />

      {/* Dates (Mock) */}
      <div className="flex-1 flex items-center px-4 w-full h-12 md:h-14 hover:bg-muted/50 rounded-full transition-colors cursor-pointer group">
        <Calendar className="h-5 w-5 text-muted-foreground mr-3 group-hover:text-primary transition-colors" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:block">When</label>
          <input 
            type="text"
            placeholder="Add dates"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="bg-transparent border-none outline-none text-sm md:text-base font-semibold w-full cursor-pointer placeholder:font-normal placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="hidden md:block w-[1px] h-8 bg-border mx-2" />

      {/* Travelers (Mock) */}
      <div className="w-full md:w-48 flex items-center px-4 h-12 md:h-14 hover:bg-muted/50 rounded-full transition-colors cursor-pointer group">
        <Users className="h-5 w-5 text-muted-foreground mr-3 group-hover:text-primary transition-colors" />
        <div className="flex flex-col flex-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Who</label>
          <select 
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            className="bg-transparent border-none outline-none text-sm md:text-base font-semibold w-full cursor-pointer appearance-none"
          >
            <option value="1">1 traveler</option>
            <option value="2">2 travelers</option>
            <option value="4">Family (4)</option>
            <option value="group">Group</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto h-12 md:h-14 rounded-full px-8 gap-2 shrink-0 text-base shadow-lg">
        <Search className="h-5 w-5" />
        <span className="md:hidden lg:inline">Explore</span>
      </Button>

    </form>
  );
}
