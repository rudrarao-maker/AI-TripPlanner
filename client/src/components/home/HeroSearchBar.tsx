import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, MapPin, Building2, UtensilsCrossed, Landmark, Compass, Clock, Search, X } from 'lucide-react';

const SEARCH_CATEGORIES = [
  { id: 'destinations', label: 'Destinations', icon: MapPin, placeholder: 'Where do you want to go?' },
  { id: 'hotels', label: 'Hotels', icon: Building2, placeholder: 'Search hotels...' },
  { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, placeholder: 'Find restaurants...' },
  { id: 'attractions', label: 'Attractions', icon: Landmark, placeholder: 'Discover attractions...' },
  { id: 'things', label: 'Things to Do', icon: Compass, placeholder: 'Activities & experiences...' },
];

const AUTO_SUGGESTIONS: Record<string, string[]> = {
  destinations: ['Bali, Indonesia', 'Paris, France', 'Goa, India', 'Tokyo, Japan', 'Dubai, UAE', 'Maldives', 'Santorini, Greece', 'Kerala, India'],
  hotels: ['Taj Mahal Palace, Mumbai', 'Marina Bay Sands, Singapore', 'Burj Al Arab, Dubai', 'The Leela, Goa', 'Oberoi Udaivilas, Udaipur'],
  restaurants: ['Indian Accent, Delhi', 'Bukhara, Delhi', 'Le Cirque, Mumbai', 'Karavalli, Bangalore', 'Wasabi by Morimoto, Mumbai'],
  attractions: ['Taj Mahal, Agra', 'Eiffel Tower, Paris', 'Great Wall of China', 'Machu Picchu, Peru', 'Hawa Mahal, Jaipur'],
  things: ['Scuba Diving', 'Safari', 'Hot Air Balloon', 'Cooking Class', 'Trekking', 'Surfing', 'City Walking Tour'],
};

const QUICK_TAGS = [
  'Group trip', 'Honeymoon', 'Solo escape', 'Family', 'Weekend', 'Beach', 'Adventure',
];

export function HeroSearchBar() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('destinations');
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('tripcraft_recent_searches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredSuggestions = AUTO_SUGGESTIONS[activeCategory]?.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase())
  ) || [];

  const handleSearch = (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const searchQuery = preset || query;
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tripcraft_recent_searches', JSON.stringify(updated));
    setShowSuggestions(false);

    // Route based on category
    const routeMap: Record<string, string> = {
      destinations: `/plan?dest=${encodeURIComponent(searchQuery)}`,
      hotels: `/hotels?q=${encodeURIComponent(searchQuery)}`,
      restaurants: `/restaurants?q=${encodeURIComponent(searchQuery)}`,
      attractions: `/explore?q=${encodeURIComponent(searchQuery)}`,
      things: `/things-to-do?q=${encodeURIComponent(searchQuery)}`,
    };
    navigate(routeMap[activeCategory] || `/plan?dest=${encodeURIComponent(searchQuery)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('tripcraft_recent_searches');
  };

  const activeConfig = SEARCH_CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="w-full max-w-2xl mt-8 flex flex-col gap-4 animate-slide-up" ref={containerRef} style={{ animationDelay: '0.2s' }}>
      
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar px-1">
        {SEARCH_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Search Pill */}
      <div className="relative">
        <form 
          onSubmit={handleSearch}
          className="bg-white dark:bg-card border-2 border-border/30 dark:border-border/50 p-1.5 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] flex items-center w-full transition-all hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/30"
        >
          <div className="flex-1 flex items-center px-4">
            <Search className="h-5 w-5 text-primary/60 mr-3 shrink-0" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder={activeConfig.placeholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="bg-transparent border-none outline-none text-lg text-foreground w-full placeholder:text-muted-foreground/60"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-full mr-2 transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Start Planning</span>
            <ArrowRight className="h-4 w-4 sm:hidden" />
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (query || recentSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-down">
            
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Recent Searches
                  </span>
                  <button onClick={clearRecent} className="text-xs text-primary hover:underline font-medium">Clear</button>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(undefined, s)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-muted/60 flex items-center gap-3 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Auto-suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="p-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-3 mb-2">
                  {query ? 'Suggestions' : 'Popular'}
                </span>
                {filteredSuggestions.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(undefined, s)}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-muted/60 flex items-center gap-3 transition-colors group"
                  >
                    <activeConfig.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="flex-1">{s}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap items-center justify-start gap-2 px-1">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleSearch(undefined, tag)}
            className="px-4 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-foreground/70 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 active:scale-95"
          >
            {tag}
          </button>
        ))}
      </div>
      
    </div>
  );
}
