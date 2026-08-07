"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Lock, ArrowLeft, Building, Plane, ShieldCheck } from "lucide-react";
import { useGetTrip } from "@/hooks/useTrips";
import toast from "react-hot-toast";

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: trip, isLoading } = useGetTrip(params.id);
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call to Stripe
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    toast.success("Payment successful! Your trip is booked.");
    router.push("/dashboard?payment=success");
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

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <Input 
                type="email" 
                placeholder="Email address" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="py-6 glass"
              />
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Payment Details <CreditCard className="h-4 w-4 text-muted-foreground" />
              </h3>
              
              <div className="space-y-3">
                <Input 
                  placeholder="Cardholder Name" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="py-6 glass"
                />
                
                <div className="relative">
                  <Input 
                    placeholder="Card Number" 
                    required 
                    value={formData.cardNumber}
                    onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                    className="py-6 glass pl-12"
                    maxLength={19}
                  />
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="MM/YY" 
                    required 
                    value={formData.expiry}
                    onChange={e => setFormData({...formData, expiry: e.target.value})}
                    className="py-6 glass"
                    maxLength={5}
                  />
                  <div className="relative">
                    <Input 
                      type="password"
                      placeholder="CVC" 
                      required 
                      value={formData.cvc}
                      onChange={e => setFormData({...formData, cvc: e.target.value})}
                      className="py-6 glass pl-12"
                      maxLength={4}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isProcessing}
              variant="gradient" 
              className="w-full py-6 text-lg shadow-xl shadow-primary/20 mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...
                </>
              ) : (
                `Pay ₹${(flightsCost + hotelCost + feeCost).toLocaleString()}`
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Payments are secure and encrypted.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
