"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Loader2,
  Plane,
  Building2,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCreateBooking } from "@/hooks/useBookings";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  type: "hotel" | "flight" | "transport";
  tripId?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  item,
  type,
  tripId,
}: BookingModalProps) {
  const [step, setStep] = useState<
    "details" | "guest" | "payment" | "processing" | "success"
  >("details");
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const createBookingMutation = useCreateBooking();

  const price =
    type === "hotel" ? item.pricePerNight || item.price : item.price;
  const name =
    type === "hotel"
      ? item.name || item.hotelName
      : `${item.airline || item.provider} Flight ${item.flightNumber || ""}`;
  const Icon = type === "hotel" ? Building2 : Plane;

  const basePrice = price || 0;
  const taxes = basePrice * 0.18;
  const total = basePrice + taxes;

  const handleNext = () => {
    if (step === "details") setStep("guest");
    else if (step === "guest") setStep("payment");
  };

  const handleBook = () => {
    setStep("processing");

    const bookingData: any = {
      type: type === "transport" ? "flight" : type,
      totalAmount: total,
      currency: item.currency || "INR",
      provider: item.provider || "mock",
      tripId,
    };

    if (type === "flight" || type === "transport") {
      bookingData.flightDetails = {
        origin: item.origin,
        destination: item.destination,
        departureTime: item.departureTime,
        arrivalTime: item.arrivalTime,
        airline: item.airline || item.provider,
        flightNumber: item.flightNumber || "TBD",
        class: item.class || item.comfortLevel || "ECONOMY",
        passengers: 1,
      };
    } else if (type === "hotel") {
      bookingData.hotelDetails = {
        hotelName: item.name,
        location: item.location || item.address,
        checkIn: item.checkIn || new Date().toISOString(), // Mock dates if not provided
        checkOut:
          item.checkOut || new Date(Date.now() + 86400000).toISOString(),
        roomType: "Standard Room",
        guests: 2,
      };
    }

    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        setStep("success");
      },
      onError: () => {
        setStep("payment"); // Go back to payment on error
      },
    });
  };

  const handleClose = () => {
    setTimeout(() => setStep("details"), 300);
    setGuestInfo({ name: "", email: "", phone: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Progress Bar */}
              {(step === "details" ||
                step === "guest" ||
                step === "payment") && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width:
                        step === "details"
                          ? "33%"
                          : step === "guest"
                            ? "66%"
                            : "100%",
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                {(step === "details" ||
                  step === "guest" ||
                  step === "payment") && (
                  <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4 mt-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">
                        {name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {step === "details"
                          ? "Review Details"
                          : step === "guest"
                            ? "Guest Info"
                            : "Payment"}
                      </p>
                    </div>
                  </div>
                )}

                {step === "details" && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Base Price
                        </span>
                        <span className="font-medium">
                          {formatCurrency(basePrice, item.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Taxes & Fees (18%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(taxes, item.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-4 border-t border-border/50">
                        <span>Total to pay</span>
                        <span className="text-primary">
                          {formatCurrency(total, item.currency)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-bold shadow-lg"
                      onClick={handleNext}
                    >
                      Continue to Guest Details
                    </Button>
                  </motion.div>
                )}

                {step === "guest" && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <div className="space-y-4 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9 bg-background/50"
                            placeholder="John Doe"
                            value={guestInfo.name}
                            onChange={(e) =>
                              setGuestInfo({
                                ...guestInfo,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            className="pl-9 bg-background/50"
                            placeholder="john@example.com"
                            value={guestInfo.email}
                            onChange={(e) =>
                              setGuestInfo({
                                ...guestInfo,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            className="pl-9 bg-background/50"
                            placeholder="+1 234 567 8900"
                            value={guestInfo.phone}
                            onChange={(e) =>
                              setGuestInfo({
                                ...guestInfo,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => setStep("details")}
                      >
                        Back
                      </Button>
                      <Button
                        className="w-full h-12 font-bold"
                        onClick={handleNext}
                        disabled={!guestInfo.name || !guestInfo.email}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 mb-6 border border-border/50">
                      <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Simulated Payment</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          This is a demonstration environment. Clicking "Pay
                          Now" will simulate a successful transaction and create
                          a real booking record in your database.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <Input
                        className="bg-background/50 font-mono"
                        placeholder="Card Number (4242 4242 4242 4242)"
                        disabled
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          className="bg-background/50"
                          placeholder="MM/YY"
                          disabled
                        />
                        <Input
                          className="bg-background/50"
                          placeholder="CVC"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => setStep("guest")}
                      >
                        Back
                      </Button>
                      <Button
                        className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
                        onClick={handleBook}
                      >
                        Pay {formatCurrency(total, item.currency)}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "processing" && (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <h3 className="text-xl font-bold">Processing Payment...</h3>
                    <p className="text-muted-foreground text-sm max-w-[250px]">
                      Securing your {type} reservation. Please don't close this
                      window.
                    </p>
                  </div>
                )}

                {step === "success" && (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                    <p className="text-muted-foreground text-sm px-4">
                      Your booking has been successfully saved to your database
                      and added to your trip.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={handleClose}
                    >
                      View in Dashboard
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
