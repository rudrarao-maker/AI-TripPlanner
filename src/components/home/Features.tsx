"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Brain, CreditCard, Sparkles, Map } from "lucide-react";

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
    icon: <Sparkles className="h-6 w-6" />,
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
    <section className="relative z-10 py-32 bg-background/50 backdrop-blur-2xl border-y border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Designed for the Modern Traveler</h2>
          <p className="text-muted-foreground text-lg font-light">
            Everything you need to plan, book, and experience the perfect trip, consolidated into one premium platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/10 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
