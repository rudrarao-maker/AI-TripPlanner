import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plane, Train, Bus, Car, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transport } from '@/types';

interface TransportCardProps {
  transport: Transport;
}

export function TransportCard({ transport }: TransportCardProps) {
  const getIcon = () => {
    switch (transport.type) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'train': return <Train className="h-5 w-5" />;
      case 'bus': return <Bus className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const imageUrl = (transport.images && transport.images.length > 0) 
    ? transport.images[0] 
    : `https://source.unsplash.com/600x400/?${transport.type},travel`;

  return (
    <Card className="glass-card overflow-hidden group border-border/50 h-full flex flex-col">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute top-3 left-3 z-20 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm capitalize">
          {getIcon()} {transport.type}
        </div>
        <img 
          src={imageUrl} 
          alt={transport.provider} 
          className="absolute inset-0 w-full h-full object-cover" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{transport.provider}</h3>
            <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">{transport.comfortLevel}</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-foreground">{formatCurrency(transport.price)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm my-2 px-2 py-3 bg-background/50 rounded-lg">
          <div className="text-center">
            <p className="font-bold">{new Date(transport.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs text-muted-foreground">{transport.origin}</p>
          </div>
          <div className="flex flex-col items-center px-4 text-muted-foreground">
            <div className="flex items-center gap-1 text-[10px] mb-1">
              <Clock className="h-3 w-3" /> {transport.duration}
            </div>
            <div className="w-full h-[1px] bg-border relative">
              <ArrowRight className="absolute -top-2 -right-1 h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold">{new Date(transport.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs text-muted-foreground">{transport.destination}</p>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <Button variant="outline" className="w-full">Select Option</Button>
        </div>
      </CardContent>
    </Card>
  );
}
