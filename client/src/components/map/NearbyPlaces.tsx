import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin, Coffee, Utensils, ShoppingBag, Landmark, Building, CreditCard, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import type { Coordinates } from '@/types';

interface NearbyPlacesProps {
  center: Coordinates;
  locationName: string;
}

const CATEGORIES = [
  { id: 'cafe', label: 'Cafes', icon: Coffee },
  { id: 'restaurant', label: 'Restaurants', icon: Utensils },
  { id: 'shopping_mall', label: 'Shopping', icon: ShoppingBag },
  { id: 'museum', label: 'Museums', icon: Landmark },
  { id: 'hospital', label: 'Hospitals', icon: Building },
  { id: 'atm', label: 'ATMs', icon: CreditCard },
  { id: 'hindu_temple', label: 'Temples', icon: Landmark },
];

export function NearbyPlaces({ center, locationName }: NearbyPlacesProps) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      setIsLoading(true);
      try {
        const response = await api.get(`/places/nearby`, {
          params: {
            lat: center.lat,
            lng: center.lng,
            type: activeCategory,
            radius: 5000 // 5km
          }
        });
        setPlaces(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch nearby places', error);
        // Fallback mock data if API fails or no key
        setPlaces([
          { place_id: '1', name: `Mock ${activeCategory} 1`, rating: 4.5, user_ratings_total: 120, vicinity: `Near ${locationName}` },
          { place_id: '2', name: `Mock ${activeCategory} 2`, rating: 4.2, user_ratings_total: 85, vicinity: `Central ${locationName}` },
          { place_id: '3', name: `Mock ${activeCategory} 3`, rating: 4.8, user_ratings_total: 300, vicinity: `North ${locationName}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    if (center.lat && center.lng) {
      fetchPlaces();
    }
  }, [center, activeCategory, locationName]);

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> 
          Explore Around {locationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Category Filter Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`rounded-full shrink-0 flex items-center gap-1.5 ${isActive ? 'bg-primary' : 'bg-background hover:bg-muted'}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Places List */}
        <div className="space-y-3 mt-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
            </div>
          ) : places.length > 0 ? (
            places.map(place => (
              <div key={place.place_id} className="flex items-start justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{place.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{place.vicinity || place.formatted_address}</p>
                  
                  {place.rating && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex text-yellow-400 text-[10px]">
                        {'★'.repeat(Math.round(place.rating))}{(Math.round(place.rating) < 5) ? '☆'.repeat(5 - Math.round(place.rating)) : ''}
                      </div>
                      <span className="text-[10px] font-medium">{place.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({place.user_ratings_total})</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No {CATEGORIES.find(c => c.id === activeCategory)?.label.toLowerCase()} found nearby.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
