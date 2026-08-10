"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Lock, ArrowLeft, Building, Plane, ShieldCheck } from "lucide-react";
import { useGetTrip } from "@/hooks/useTrips";
import toast from "react-hot-toast";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: trip, isLoading } = useGetTrip(id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Mock costs
      const totalBudget = Number(trip.budget) || 120000;
      const amount = totalBudget * 0.75 + totalBudget * 0.05; // flights + hotel + fee

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          amount,
          currency: 'inr' // keeping the UI currency consistent
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error(data.error || 'Failed to initiate checkout.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  // Mock costs if not present
  const totalBudget = Number(trip.budget) || 120000;
  const flightsCost = Math.round(totalBudget * 0.3);
  const hotelCost = Math.round(totalBudget * 0.4);
  const feeCost = Math.round(totalBudget * 0.05);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side - Summary */}
      <div className="w-full md:w-5/12 bg-muted/30 p-8 md:p-12 border-r border-border/50 flex flex-col justify-between">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Itinerary
          </button>
          
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Booking Summary</p>
          <h1 className="text-3xl font-extrabold mb-8">{trip.destination} Getaway</h1>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary h-fit">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">Roundtrip Flights</p>
                  <p className="text-sm text-muted-foreground">{trip.origin} to {trip.destination}</p>
                </div>
              </div>
              <p className="font-semibold">₹{flightsCost.toLocaleString()}</p>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="bg-accent/10 p-3 rounded-xl text-accent h-fit">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{trip.hotelCategory || 'Premium'} Accommodation</p>
                  <p className="text-sm text-muted-foreground">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="font-semibold">₹{hotelCost.toLocaleString()}</p>
            </div>

            <div className="pt-6 border-t border-border/50 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{(flightsCost + hotelCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxes & Fees</span>
                <span>₹{feeCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border/50">
          <div className="flex justify-between items-end">
            <p className="font-medium">Total due today</p>
            <p className="text-3xl font-black">₹{(flightsCost + hotelCost + feeCost).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Payment Form */}
      <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-20 bg-background flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold">Secure Checkout</h2>
          </div>

          <div className="space-y-6 text-center">
            <p className="text-muted-foreground mb-8">
              You will be securely redirected to Stripe to complete your payment via credit card, debit card, or local payment methods.
            </p>

            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              variant="gradient" 
              className="w-full py-8 text-xl font-bold shadow-xl shadow-primary/20 rounded-2xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-3" /> Redirecting to Stripe...
                </>
              ) : (
                `Pay ₹${(flightsCost + hotelCost + feeCost).toLocaleString()}`
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-4 mt-8 opacity-60">
              <ShieldCheck className="h-8 w-8" />
              <Lock className="h-8 w-8" />
              <CreditCard className="h-8 w-8" />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Secured and Encrypted by Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
