import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plane, Users, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchFlights } from "@/hooks/useFlights";
import { TransportCard } from "@/components/recommendations/TransportCard";
import { TransportCardSkeleton } from "@/components/ui/Skeletons";

export function FlightSearchPage() {
  const [searchParams, setSearchParams] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    travelClass: "ECONOMY",
  });

  const [hasSearched, setHasSearched] = useState(false);

  const {
    data: flights = [],
    isLoading,
    refetch,
  } = useSearchFlights(searchParams as any, false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 container mx-auto">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Plane className="h-10 w-10 text-primary" />
          Flight Search
        </h1>
        <p className="text-muted-foreground">
          Find the best deals for your next journey.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl shadow-xl max-w-4xl mx-auto mb-12 border-primary/20">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">From</label>
            <Input
              required
              placeholder="Origin (e.g. DEL)"
              className="bg-background/50 h-12"
              value={searchParams.origin}
              onChange={(e) =>
                setSearchParams({ ...searchParams, origin: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">To</label>
            <Input
              required
              placeholder="Destination (e.g. BOM)"
              className="bg-background/50 h-12"
              value={searchParams.destination}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  destination: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Departure</label>
            <Input
              required
              type="date"
              className="bg-background/50 h-12"
              value={searchParams.departureDate}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  departureDate: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Class</label>
            <select
              className="w-full bg-background/50 h-12 rounded-lg border border-input px-3"
              value={searchParams.travelClass}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  travelClass: e.target.value,
                })
              }
            >
              <option value="ECONOMY">Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First Class</option>
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto h-12 px-8 font-bold gap-2"
            >
              <Search className="h-5 w-5" /> Search Flights
            </Button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="glass-card p-5 space-y-4 sticky top-24">
              <h3 className="font-bold flex items-center gap-2 border-b pb-2">
                <Filter className="h-4 w-4" /> Filters
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stops</label>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked /> Direct
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked /> 1 Stop
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked /> 2+ Stops
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            {isLoading ? (
              <>
                <TransportCardSkeleton />
                <TransportCardSkeleton />
                <TransportCardSkeleton />
              </>
            ) : flights.length > 0 ? (
              flights.map((flight: any) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={flight.id}
                >
                  <TransportCard
                    transport={{
                      id: flight.id,
                      provider: flight.airline,
                      type: "flight",
                      departureTime: flight.departureTime,
                      arrivalTime: flight.arrivalTime,
                      duration: flight.duration,
                      origin: flight.origin,
                      destination: flight.destination,
                      price: flight.price,
                      currency: flight.currency,
                      comfortLevel: flight.class.toLowerCase(),
                      createdAt: new Date().toISOString(),
                      images: [
                        `https://source.unsplash.com/600x400/?airplane,${flight.airline.replace(/\s+/g, "")}`,
                      ],
                    }}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center p-12 glass-card rounded-2xl">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-bold">No flights found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search parameters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
