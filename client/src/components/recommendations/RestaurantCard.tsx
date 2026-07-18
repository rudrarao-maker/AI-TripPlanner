import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Star, MapPin, Utensils } from 'lucide-react';
import type { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const cuisineStr = restaurant.cuisine && restaurant.cuisine.length > 0 ? restaurant.cuisine.join(', ') : 'Various';
  const imageUrl = (restaurant.images && restaurant.images.length > 0) ? restaurant.images[0] : `https://source.unsplash.com/600x400/?restaurant,food,${encodeURIComponent(cuisineStr)}`;

  return (
    <Card className="glass-card overflow-hidden group border-border/50 h-full flex flex-col">
      <div className="relative h-40 overflow-hidden">
        <div className="absolute top-3 left-3 z-20 bg-primary text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
          {restaurant.priceRange}
        </div>
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {restaurant.rating}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900" />
        <img 
          src={imageUrl} 
          alt={restaurant.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold line-clamp-1 mb-1 text-foreground">{restaurant.name}</h3>
        
        <div className="flex items-center text-muted-foreground text-xs mb-3 space-x-3">
          <span className="flex items-center line-clamp-1">
            <Utensils className="h-3 w-3 mr-1 shrink-0" />
            {cuisineStr}
          </span>
          <span className="flex items-center line-clamp-1">
            <MapPin className="h-3 w-3 mr-1" />
            {restaurant.location}
          </span>
        </div>



        <Button variant="outline" size="sm" className="w-full mt-auto">View Menu</Button>
      </CardContent>
    </Card>
  );
}
