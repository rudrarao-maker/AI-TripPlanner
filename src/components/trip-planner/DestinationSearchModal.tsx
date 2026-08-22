"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { findDestinationInfo } from "@/lib/destinationData";

export function DestinationSearchModal({
  isOpen,
  onClose,
  onSelect,
  existingDestinations = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dest: any) => void;
  existingDestinations?: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      // In a real app, this would call a geocoding API (e.g., Google Places or Mapbox)
      // For now, we use our local destinationData as a fallback + simulate a search
      
      const localMatch = findDestinationInfo(searchQuery);
      
      const mockResults = [];
      if (localMatch) {
        mockResults.push({
          name: localMatch.name,
          country: localMatch.country,
          state: localMatch.state,
          lat: 20 + Math.random() * 10,
          lng: 70 + Math.random() * 10,
        });
      }

      // Add some generic fallback if no local match
      if (mockResults.length === 0 && searchQuery.length > 2) {
         mockResults.push({
           name: searchQuery,
           country: "Unknown",
           // Mock lat/lng
           lat: 20 + Math.random() * 10,
           lng: 70 + Math.random() * 10,
         });
      }

      setResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: any) => {
    if (existingDestinations.includes(result.name)) {
      alert("This destination is already in your trip.");
      return;
    }
    onSelect(result);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Destination</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1.5">Search for a city or region to add to your trip.</p>
        </DialogHeader>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search destination (e.g., Tokyo, Paris)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 py-6 text-lg"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
          {results.length > 0 ? (
            results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{result.name}</p>
                    {result.country && <p className="text-sm text-muted-foreground">{result.country}</p>}
                  </div>
                </div>
              </button>
            ))
          ) : query && !isSearching ? (
             <div className="p-4 text-center text-muted-foreground">
               No results found for "{query}"
             </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Start typing to search destinations
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
