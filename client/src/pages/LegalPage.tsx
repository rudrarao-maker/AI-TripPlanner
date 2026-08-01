import { motion } from "framer-motion";

export function LegalPage({ type }: { type: "privacy" | "terms" | "cookies" }) {
  const content = {
    privacy: {
      title: "Privacy Policy",
      text: "Last updated: July 18, 2026. TripCraft AI respects your privacy. We collect minimal data necessary to generate personalized itineraries. Your location data and travel preferences are encrypted and never sold to third parties.",
    },
    terms: {
      title: "Terms of Service",
      text: "By using TripCraft AI, you agree to our terms of service. Our AI-generated itineraries are suggestions and should be verified independently. We are not liable for changes in hotel pricing or flight cancellations.",
    },
    cookies: {
      title: "Cookie Policy",
      text: "We use strictly necessary cookies to keep you logged in and functional cookies to remember your travel preferences (like dark mode and currency settings). We do not use third-party tracking cookies.",
    },
  };

  const { title, text } = content[type];

  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <div className="prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed text-lg">
            {text}
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            For more detailed legal information, please contact our support team
            at legal@tripcraft.ai.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
