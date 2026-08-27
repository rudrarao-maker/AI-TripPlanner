"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Brain, CreditCard, Compass, Map } from "lucide-react";

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Intelligence",
    description: "Our Gemini-backed AI creates ultra-personalized itineraries in seconds, perfectly matched to your travel style."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-time Adaptability",
    description: "Modify your trip on the go. Swap restaurants, skip activities, or add rest days with intelligent recalculations."
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Smart Budgeting",
    description: "Choose between Cheap, Moderate, and Luxury tiers. We estimate every expense down to local transport."
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: "Interactive Maps",
    description: "Visualize your entire journey with integrated, interactive maps showing daily routes and travel times."
  },
  {
    icon: <Compass className="h-6 w-6" />,
    title: "Hidden Gems",
    description: "Go beyond tourist traps. Discover local secrets, authentic eateries, and exclusive premium experiences."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Private",
    description: "Your data and travel plans are secured with industry-leading encryption and safe payment gateways."
  }
];

export function Features() {
  return (
    <section className="relative z-10 py-16 md:py-32 bg-background/50 backdrop-blur-2xl border-y border-border">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-20"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 md:mb-6">Built for how you actually travel</h2>
          <p className="text-muted-foreground text-lg">
            Plan, book, and manage your entire trip from one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: MOTION_EASE }}
              className="bg-card p-5 md:p-8 rounded-2xl border border-border hover:border-primary/20 transition-colors duration-200 group"
            >
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 md:mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
