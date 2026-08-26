"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Solo Traveler",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    content: "The AI understood exactly what I wanted. It balanced high-energy sightseeing with quiet cafe breaks in Kyoto perfectly. The luxury plan option was totally worth comparing!"
  },
  {
    name: "Michael & Emma",
    role: "Honeymooners",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    content: "We were overwhelmed with planning our Europe trip. TripPlanner generated a 14-day itinerary in seconds. Being able to swap out restaurants on the fly was a game changer."
  },
  {
    name: "David Chen",
    role: "Digital Nomad",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    content: "As someone who travels constantly for work, I use the Moderate budget tool for quick weekend escapes. The cost estimations are incredibly accurate."
  }
];

export function Testimonials() {
  return (
    <section className="relative z-10 py-32 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What travelers are saying</h2>
          <p className="text-muted-foreground text-lg">
            Real feedback from real trips.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4, ease: MOTION_EASE }}
              className="bg-card p-8 rounded-2xl border border-border relative"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg mb-8 italic leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
