import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Star, MapPin, Clock, Ticket } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Activity } from '@/types';

interface AttractionCardProps {
  activity: Activity;
}

export function AttractionCard({ activity }: AttractionCardProps) {
  const imageUrl = activity.image || `https://source.unsplash.com/600x400/?${encodeURIComponent(activity.title)},attraction`;

  return (
    <Card className="glass-card overflow-hidden group border-border/50 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        {activity.rating && (
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {activity.rating}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900" />
        <img 
          src={imageUrl} 
          alt={activity.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-xl font-bold line-clamp-1 text-foreground mb-1">{activity.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 text-sm mt-auto">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span className="line-clamp-1">{activity.location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-accent" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center text-muted-foreground col-span-2">
            <Ticket className="h-4 w-4 mr-2 text-emerald-500" />
            <span className="font-medium text-foreground">
              {activity.cost === 0 ? 'Free Entry' : formatCurrency(activity.cost)}
            </span>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Add to Itinerary
        </Button>
      </CardContent>
    </Card>
  );
}
