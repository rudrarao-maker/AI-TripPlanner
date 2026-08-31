import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock } from "lucide-react";

export function FlightCard({ flight }: { flight: any }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1 w-full">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
              <Plane className="h-6 w-6" />
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg">{flight.airline}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Flight {flight.flightNumber}
                </p>
              </div>

              <div className="flex items-center gap-4 text-center sm:text-left flex-1 justify-center sm:justify-start">
                <div>
                  <p className="font-bold text-xl">{flight.departure.time}</p>
                  <p className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full inline-block mt-1">{flight.departure.airport}</p>
                </div>
                
                <div className="flex flex-col items-center px-4 flex-1 min-w-[100px]">
                  <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                  <div className="w-full h-px bg-border relative flex items-center justify-center">
                    <Plane className="h-3 w-3 text-muted-foreground absolute" />
                  </div>
                  <p className="text-xs text-primary font-medium mt-1">{flight.stops}</p>
                </div>

                <div>
                  <p className="font-bold text-xl">{flight.arrival.time}</p>
                  <p className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full inline-block mt-1">{flight.arrival.airport}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:pl-6 md:border-l border-border/50 w-full md:w-auto md:min-w-[140px] gap-4">
            <div className="text-left md:text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</p>
              <p className="font-extrabold text-2xl text-foreground">
                ${flight.price}
              </p>
            </div>
            <Button 
              className="w-full md:w-auto shadow-md"
              onClick={() => window.open(flight.bookingUrl, "_blank")}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
