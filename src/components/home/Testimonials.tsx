"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
    content: "We were overwhelmed with planning our Europe trip. TripPlanner generated a magical 14-day itinerary in seconds. Being able to swap out restaurants on the fly was a game changer."
  },
  {
    name: "David Chen",
    role: "Digital Nomad",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    content: "As someone who travels constantly for work, I use the 'Moderate' budget tool for quick weekend escapes. The cost estimations are incredibly accurate."
  }
];

export function Testimonials() {
  return (
    <section className="relative z-10 py-32 bg-transparent overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Travelers Love Us</h2>
          <p className="text-muted-foreground text-lg font-light">
            Don't just take our word for it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="glass p-8 rounded-3xl border border-white/10 relative"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg mb-8 font-light italic leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
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
