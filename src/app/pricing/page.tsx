"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

const plans = [
  {
    name: "Explorer",
    id: "free",
    price: "Free",
    description: "Perfect for quick weekend getaways.",
    features: [
      "Up to 3 trips per month",
      "Standard AI generation",
      "Basic itinerary (no map)",
      "Email support"
    ],
    buttonText: "Start for Free",
    popular: false,
    priceId: null, // No Stripe Price ID for Free
  },
  {
    name: "Pro Traveler",
    id: "pro",
    price: "$12",
    period: "/mo",
    description: "The ultimate tool for frequent travelers.",
    features: [
      "Unlimited trip generations",
      "Gemini Advanced AI model",
      "3-Tier Budget Comparisons",
      "Interactive Maps & PDF Export",
      "Collaborative editing"
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
    priceId: "price_1U2U264CAnFWeeEGI1QS3hqE",
  },
  {
    name: "Wanderlust Plus",
    id: "premium",
    price: "$99",
    period: "/yr",
    description: "Best value for yearly adventurers.",
    features: [
      "Everything in Pro",
      "Priority customer support",
      "Exclusive hidden gem data",
      "Offline itinerary access",
      "Custom branding for exports"
    ],
    buttonText: "Get Yearly Plan",
    popular: false,
    priceId: "price_1U2U274CAnFWeeEG9L6575N3",
  }
];

export default function PricingPage() {
  const { isLoaded, userId } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    if (!isLoaded || !userId) {
      toast.error("Please sign in to subscribe.");
      return;
    }

    if (!priceId) {
      toast.success("You are already on the Free plan!");
      return;
    }

    setLoadingId(planId);

    try {
      const res = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate checkout.");
        setLoadingId(null);
      }
    } catch (err) {
      toast.error("An error occurred during checkout.");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-primary uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-black mb-6">
            Travel smarter, <br /> not harder.
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan to unlock the full potential of AI-powered travel planning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-8 bg-card border shadow-xl ${
                plan.popular 
                  ? "border-primary/50 shadow-primary/10 ring-1 ring-primary/20 transform md:-translate-y-4" 
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-5xl font-black">
                  {plan.price}
                  {plan.period && <span className="text-lg font-medium text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <p className="mt-4 text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.priceId, plan.id)}
                disabled={loadingId === plan.id}
                variant={plan.popular ? "gradient" : "outline"}
                className={`w-full py-6 rounded-xl font-bold ${plan.popular ? "shadow-lg shadow-primary/25" : ""}`}
              >
                {loadingId === plan.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {plan.buttonText} {plan.priceId && <ArrowRight className="ml-2 h-4 w-4" />}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
