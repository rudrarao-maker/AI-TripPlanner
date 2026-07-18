import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  location: string;
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const [loading, setLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-6 flex items-center justify-center h-[160px]">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <Sun className="h-8 w-8 text-muted-foreground opacity-50" />
            <span className="text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data based on location
  const isSunny = !location.toLowerCase().includes('london');
  const temp = isSunny ? 28 : 15;

  return (
    <Card className="glass-card overflow-hidden relative group">
      {/* Dynamic Background based on weather */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
        isSunny 
          ? 'bg-gradient-to-br from-orange-400/20 via-yellow-300/20 to-blue-400/20' 
          : 'bg-gradient-to-br from-slate-400/20 to-slate-600/20'
      }`} />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{location}</h3>
            <p className="text-sm text-muted-foreground">{isSunny ? 'Sunny & Clear' : 'Overcast'}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-start">
              <span className="text-4xl font-bold tracking-tighter">{temp}</span>
              <span className="text-xl font-medium mt-1">°C</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>Feels {temp + 2}°</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{isSunny ? '10%' : '60%'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="h-4 w-4 text-teal-500" />
            <span>12 km/h</span>
          </div>
        </div>
        
        {/* Decorative Weather Icon */}
        <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
          {isSunny ? (
            <Sun className="w-40 h-40 text-yellow-500" />
          ) : (
            <CloudRain className="w-40 h-40 text-slate-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
