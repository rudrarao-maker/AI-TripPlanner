"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    description: "Perfect for quick weekend getaways.",
    features: [
      "Up to 3 trips per month",
      "Standard AI generation",
      "Basic itinerary (no map)",
      "Email support"
    ],
    buttonText: "Start for Free",
    popular: false
  },
  {
    name: "Pro Traveler",
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
    popular: true
  },
  {
    name: "Wanderlust Plus",
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
    popular: false
  }
];

export function Pricing() {
  return (
    <section className="relative z-10 py-32 bg-background/30 backdrop-blur-xl border-y border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg font-light">
            Choose the plan that fits your travel style.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className={`relative glass p-8 rounded-[2rem] border ${
                plan.popular ? "border-primary shadow-2xl shadow-primary/20 bg-primary/5" : "border-white/10 hover:border-white/20"
              } transition-all duration-300 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm font-light h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-light">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/pricing" className="w-full">
                <Button 
                  variant={plan.popular ? "default" : "outline"} 
                  className="w-full rounded-full h-12 font-medium"
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
