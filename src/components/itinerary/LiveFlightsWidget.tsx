import { useState, useEffect } from "react";
import { Plane, Loader2, AlertCircle } from "lucide-react";
import { FlightCard } from "@/components/recommendations/FlightCard";

export function LiveFlightsWidget({ origin, destination, date, passengers }: any) {
  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination, date, passengers }),
        });
        
        const data = await res.json();
        if (data.success) {
          setFlights(data.flights);
        } else {
          setError("Failed to load flights.");
        }
      } catch (err) {
        setError("Network error while loading flights.");
      } finally {
        setIsLoading(false);
      }
    }

    if (destination) {
      fetchFlights();
    }
  }, [origin, destination, date, passengers]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-2xl border border-dashed border-border">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Searching live flight data to {destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" /> Available Flights
        </h3>
        <p className="text-sm text-muted-foreground">Showing {flights.length} best options</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
