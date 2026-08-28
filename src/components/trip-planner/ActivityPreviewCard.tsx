"use client";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, ExternalLink, Star, Clock, IndianRupee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateHotelBookingLink, generateRestaurantBookingLink, generateActivityBookingLink } from "@/lib/booking-providers";
import { autoBookTable } from "@/lib/api/reservations";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ActivityPreviewCardProps {
  activity: {
    name?: string;
    title?: string;
    location?: string;
    address?: string;
    description?: string;
    category?: string;
    estimatedCost?: number;
    time?: string;
    startTime?: string;
    coordinates?: { lat: number; lng: number };
    rating?: number;
  };
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  hotel: { emoji: "🏨", label: "Hotel", color: "from-blue-500/20 to-blue-600/10" },
  food: { emoji: "🍽️", label: "Restaurant", color: "from-orange-500/20 to-orange-600/10" },
  transport: { emoji: "🚕", label: "Transport", color: "from-green-500/20 to-green-600/10" },
  sightseeing: { emoji: "📍", label: "Sightseeing", color: "from-purple-500/20 to-purple-600/10" },
  shopping: { emoji: "🛍️", label: "Shopping", color: "from-pink-500/20 to-pink-600/10" },
  other: { emoji: "✨", label: "Activity", color: "from-indigo-500/20 to-indigo-600/10" },
};

export function ActivityPreviewCard({ activity, onClose }: ActivityPreviewCardProps) {
  const categoryInfo = CATEGORY_CONFIG[activity.category || "other"] || CATEGORY_CONFIG.other;
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<{success: boolean, message: string} | null>(null);
  
  // Real-world data state
  const [placeData, setPlaceData] = useState<any>(null);
  const [isLoadingPlace, setIsLoadingPlace] = useState(true);

  // Live pricing state
  const [livePriceData, setLivePriceData] = useState<any>(null);
  const [isLoadingLivePrice, setIsLoadingLivePrice] = useState(false);

  useEffect(() => {
    async function fetchPlaceDetails() {
      setIsLoadingPlace(true);
      try {
        const query = encodeURIComponent(`${activity.title || activity.name || ""} ${activity.location || activity.address || ""}`);
        const res = await fetch(`/api/places/details?query=${query}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPlaceData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch place details:", err);
      } finally {
        setIsLoadingPlace(false);
      }
    }

    async function fetchLivePricing() {
      setIsLoadingLivePrice(true);
      try {
        const queryParams = new URLSearchParams({
          name: activity.title || activity.name || "",
          category: activity.category || "other",
          location: activity.location || activity.address || ""
        });
        const res = await fetch(`/api/booking/live-price?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && data.data) {
          setLivePriceData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch live price:", err);
      } finally {
        setIsLoadingLivePrice(false);
      }
    }

    fetchPlaceDetails();
    fetchLivePricing();
  }, [activity]);

  // Generate Unsplash image URL as fallback
  const imageQuery = encodeURIComponent(`${activity.title || activity.name || "Activity"} ${activity.location || activity.address || "Local area"} travel`);
  const fallbackImageUrl = `https://source.unsplash.com/800x600/?${imageQuery}`;
  
  const displayImage = placeData?.photoUrl || fallbackImageUrl;
  const displayRating = placeData?.rating || activity.rating;

  // Google Maps link
  const mapsUrl = placeData?.googleMapsUrl || (activity.coordinates
    ? `https://www.google.com/maps/@${activity.coordinates.lat},${activity.coordinates.lng},17z`
    : `https://www.google.com/maps/search/${encodeURIComponent((activity.title || activity.name || "Activity") + " " + (activity.location || "Local area"))}`);

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full w-full rounded-2xl overflow-hidden border border-border/50 shadow-lg bg-card flex flex-col"
      style={{ backfaceVisibility: "hidden" }}
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={displayImage}
          alt={activity.title || activity.name || "Activity image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
          <span>{categoryInfo.emoji}</span>
          {categoryInfo.label}
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
            {activity.title || activity.name || "Activity"}
          </h3>
          <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {placeData?.address || activity.location || "Local area"}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {(activity.startTime || activity.time) && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
              <Clock className="h-3.5 w-3.5" /> {activity.startTime || activity.time}
            </span>
          )}
          {isLoadingLivePrice ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-primary/70 bg-primary/5 px-2 py-1 rounded-lg animate-pulse">
              <IndianRupee className="h-3.5 w-3.5" /> Fetching live price...
            </span>
          ) : livePriceData ? (
            <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
              <IndianRupee className="h-3.5 w-3.5" /> {Number(livePriceData.livePrice).toLocaleString("en-IN")}
              <span className="text-[10px] uppercase ml-1 opacity-70 bg-green-200 dark:bg-green-800 px-1 rounded">
                LIVE via {livePriceData.provider}
              </span>
            </span>
          ) : activity.estimatedCost !== undefined && activity.estimatedCost > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
              <IndianRupee className="h-3.5 w-3.5" /> {Number(activity.estimatedCost).toLocaleString("en-IN")}
              <span className="text-[10px] uppercase ml-1 opacity-70">EST.</span>
            </span>
          )}
          {displayRating && (
            <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
              <Star className="h-3.5 w-3.5 fill-amber-500" /> {displayRating}
              {placeData?.userRatingsTotal && <span className="text-xs opacity-70 ml-1">({placeData.userRatingsTotal})</span>}
            </span>
          )}
          {placeData && placeData.openNow !== undefined && (
            <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg font-medium ${placeData.openNow ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              <Clock className="h-3.5 w-3.5" /> {placeData.openNow ? 'Open Now' : 'Closed'}
            </span>
          )}
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {activity.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={onClose}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => window.open(mapsUrl, "_blank")}
            >
              <MapPin className="h-3.5 w-3.5" /> Map
            </Button>
            {placeData?.website && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => window.open(placeData.website, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" /> Website
              </Button>
            )}
          </div>
          
          {bookingStatus && (
            <div className={`p-2 text-xs rounded-md ${bookingStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {bookingStatus.message}
            </div>
          )}

          {activity.category === 'food' ? (
            <Button
              variant="default"
              size="sm"
              className="w-full gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isBooking || bookingStatus?.success}
              onClick={async () => {
                setIsBooking(true);
                const name = activity.title || activity.name || "Restaurant";
                const res = await autoBookTable(name, "2024-12-01", activity.startTime || "19:00", 2, {});
                setBookingStatus(res);
                setIsBooking(false);
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" /> 
              {isBooking ? 'Auto Booking...' : bookingStatus?.success ? 'Booked!' : 'Auto Book Table'}
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => {
                let url = mapsUrl;
                const loc = activity.location || activity.address || "Local area";
                const nam = activity.title || activity.name || "Activity";
                if (activity.category === 'hotel') url = generateHotelBookingLink(loc);
                else url = generateActivityBookingLink(nam, loc);
                window.open(url, "_blank");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" /> 
              {activity.category === 'hotel' ? 'Book Hotel' : 'Book Tickets'}
              {livePriceData && ` via ${livePriceData.provider}`}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
