"use client";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plane, Train, Bus, Car, Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Transport } from "@/types";
import { useState } from "react";
import { BookingModal } from "../booking/BookingModal";

interface TransportCardProps {
  transport: Transport & { vehicleType?: string; bookingUrl?: string };
}

export function TransportCard({ transport }: TransportCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getIcon = () => {
    switch (transport.type) {
      case "flight":
        return <Plane className="h-5 w-5" />;
      case "train":
        return <Train className="h-5 w-5" />;
      case "bus":
        return <Bus className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  const imageUrl =
    transport.images && transport.images.length > 0
      ? transport.images[0]
      : `https://source.unsplash.com/600x400/?${transport.type},travel`;

  return (
    <Card className="glass-card overflow-hidden group border-border/50 h-full flex flex-col">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute top-3 left-3 z-20 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm capitalize">
          {getIcon()} {transport.type}
        </div>
        {/* Provider Badge */}
        {transport.provider && transport.provider !== "mock" && (
          <div className="absolute top-3 right-3 z-20 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm shadow-black/20">
            Book via {transport.provider}
          </div>
        )}
        <img
          src={imageUrl}
          alt={transport.provider}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            {/* Show airline/vehicle as title if flight, otherwise provider */}
            <h3 className="text-lg font-bold text-foreground">
              {transport.type === "flight"
                ? transport.vehicleType
                : transport.provider}
            </h3>
            {transport.type === "flight" && (
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Flight {(transport as any).flightNumber || "N/A"}
              </span>
            )}
            {transport.type !== "flight" && (
              <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
                {transport.vehicleType || transport.comfortLevel}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-foreground">
              {formatCurrency(transport.price)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm my-2 px-2 py-3 bg-background/50 rounded-lg border border-border/50">
          <div className="text-center">
            <p className="font-bold text-lg">
              {new Date(transport.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 mt-1 rounded-md">
              {transport.origin}
            </p>
          </div>
          <div className="flex flex-col items-center px-4 text-muted-foreground">
            <div className="flex items-center gap-1 text-[10px] mb-1 font-medium bg-background px-2 py-0.5 rounded-full border border-border">
              <Clock className="h-3 w-3" /> {transport.duration}
            </div>
            <div className="w-full h-[1px] bg-border relative">
              <ArrowRight className="absolute -top-2 -right-1 h-4 w-4 text-primary" />
            </div>
            {transport.type === "flight" && (
              <span className="text-[9px] mt-1 text-muted-foreground">
                {(transport as any).stops === 0
                  ? "Non-stop"
                  : `${(transport as any).stops} stops`}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">
              {new Date(transport.arrivalTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 mt-1 rounded-md">
              {transport.destination}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-3">
          {transport.bookingUrl || transport.provider ? (
            <Button
              variant="outline"
              className="w-full font-bold shadow-sm"
              onClick={() =>
                transport.bookingUrl
                  ? window.open(transport.bookingUrl, "_blank")
                  : setShowModal(true)
              }
            >
              Book on {transport.provider}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full font-bold shadow-sm"
              onClick={() => setShowModal(true)}
            >
              Select Option
            </Button>
          )}
        </div>
      </CardContent>

      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={transport}
        type="transport"
      />
    </Card>
  );
}
