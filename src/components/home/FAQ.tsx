"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does the AI generate my itinerary?",
    answer: "Our system uses Google's advanced Gemini AI. We feed it your specific preferences—destination, dates, budget, interests, and travel style. It then synthesizes data from vast travel knowledge bases to create a logically sequenced, realistic daily plan tailored just for you."
  },
  {
    question: "Can I modify the itinerary after it's generated?",
    answer: "Absolutely. Step 10 of our workflow allows you to fully customize your trip. You can swap hotels, remove or add attractions, extend the trip, or change your budget. The AI will intelligently regenerate only the affected portions, keeping the rest of your plan intact."
  },
  {
    question: "How accurate are the budget estimations?",
    answer: "We provide three budget tiers (Cheap, Moderate, Luxury) based on current averages for accommodations, transport, and dining in that specific region. While prices fluctuate, they serve as a highly accurate baseline for planning your expenses."
  },
  {
    question: "Can I book my flights and hotels directly?",
    answer: "Yes, you can! Our integrated booking module allows you to confirm flights, hotels, and activities, and process payments securely via Stripe."
  },
  {
    question: "Can I share my itinerary with travel companions?",
    answer: "Yes. You can invite friends for collaborative editing, generate a shareable public link, or export the entire itinerary as a beautiful PDF."
  }
];

export function FAQ() {
  return (
    <section className="relative z-10 py-32 bg-transparent">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg font-light">
            Everything you need to know about AI Trip Planner.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass p-8 rounded-3xl border border-white/10"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10">
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
