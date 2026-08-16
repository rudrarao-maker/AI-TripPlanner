"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";

export function LocationPromptModal() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only show if user is signed in and hasn't been prompted yet
    if (isLoaded && isSignedIn) {
      const hasPrompted = localStorage.getItem("location_prompted");
      const hasLocation = localStorage.getItem("user_location_city");
      if (!hasPrompted && !hasLocation) {
        // slight delay so it doesn't jump scare immediately on mount
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, isSignedIn]);

  const handleSkip = () => {
    localStorage.setItem("location_prompted", "true");
    setIsOpen(false);
  };

  const handleEnableLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      handleSkip();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
          let city = "Current Location";
          try {
            // Reverse geocoding using OSM Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
              const data = await res.json();
              city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Current Location";
            }
          } catch (e: any) {
            console.log("Failed to reverse geocode:", e.message || e);
          }
          
          localStorage.setItem("user_location_lat", latitude.toString());
          localStorage.setItem("user_location_lng", longitude.toString());
          localStorage.setItem("user_location_city", city);
          localStorage.setItem("location_prompted", "true");
          
          // Trigger a custom event so other components (like LocalDiscoveries) can update
          window.dispatchEvent(new Event("locationUpdated"));
          setIsLoading(false);
          setIsOpen(false);
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setIsLoading(false);
        handleSkip();
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      if (!open) handleSkip();
    }}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <DialogHeader className="flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-2">Discover Local Experiences</DialogTitle>
          <p className="text-base text-muted-foreground mt-2 text-center">
            Turn on location services to get personalized recommendations for nearby airports, railway stations, hotels, and restaurants.
          </p>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleEnableLocation} 
            disabled={isLoading}
            variant="gradient"
            size="lg"
            className="w-full gap-2 font-semibold text-base"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Navigation className="h-5 w-5" />
            )}
            {isLoading ? "Locating..." : "Enable Location"}
          </Button>
          <Button 
            onClick={handleSkip} 
            disabled={isLoading}
            variant="ghost" 
            size="lg"
            className="w-full text-muted-foreground"
          >
            Not right now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
