"use client";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Star, MapPin, Award, Wifi, Coffee, Waves } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Hotel } from "@/types";
import { useState } from "react";
import { BookingModal } from "../booking/BookingModal";

interface HotelCardProps {
  hotel: Hotel & { bookingUrl?: string; description?: string };
}

export function HotelCard({ hotel }: HotelCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Mock image if not provided
  const imageUrl =
    hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : `https://source.unsplash.com/600x400/?hotel,resort,${encodeURIComponent(hotel.location)}`;

  return (
    <Card className="glass-card overflow-hidden group border-border/50 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        {/* Provider Badge */}
        {(hotel as any).provider && (
          <div className="absolute top-3 left-3 z-20 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm shadow-black/20">
            Book via {(hotel as any).provider}
          </div>
        )}
        {/* Traveler's Choice Badge (moved below if provider exists) */}
        {!(hotel as any).provider && (
          <div className="absolute top-3 left-3 z-20 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
            <Award className="h-3 w-3" /> Traveler's Choice
          </div>
        )}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          {hotel.rating}
        </div>
        {/* Placeholder gradient in case image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900" />
        <img
          src={imageUrl}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-xl font-bold line-clamp-1 text-foreground">
            {hotel.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
              <span className="line-clamp-1">{hotel.location}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {hotel.reviewCount} reviews
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 mb-6">
          {hotel.amenities.slice(0, 3).map((amenity, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-muted rounded-md flex items-center gap-1 text-muted-foreground"
            >
              {amenity.toLowerCase().includes("wifi") && (
                <Wifi className="h-3 w-3" />
              )}
              {amenity.toLowerCase().includes("pool") && (
                <Waves className="h-3 w-3" />
              )}
              {amenity.toLowerCase().includes("breakfast") && (
                <Coffee className="h-3 w-3" />
              )}
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
              +{hotel.amenities.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">
              Price per night
            </p>
            <p className="font-bold text-lg text-foreground">
              {formatCurrency(hotel.pricePerNight)}
            </p>
          </div>
          {(hotel as any).bookingUrl || (hotel as any).provider ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={() =>
                (hotel as any).bookingUrl
                  ? window.open((hotel as any).bookingUrl, "_blank")
                  : setShowModal(true)
              }
            >
              Book on{" "}
              {(hotel as any).provider || hotel.description || "Provider"}
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              Book Now
            </Button>
          )}
        </div>
      </CardContent>

      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={hotel}
        type="hotel"
      />
    </Card>
  );
}
