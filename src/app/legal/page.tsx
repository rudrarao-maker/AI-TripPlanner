"use client";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LegalContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type = (typeParam === "privacy" || typeParam === "cookies") ? typeParam : "terms";

  const content = {
    privacy: {
      title: "Privacy Policy",
      text: "Last updated: July 18, 2026.\n\nTripCraft AI respects your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our services.\n\n1. Information We Collect: We collect information you provide directly (such as your email and name when creating an account), as well as travel preferences, saved destinations, and location data used to generate personalized itineraries.\n\n2. How We Use Your Information: We use this data to provide and improve our AI trip planning services, to process your payments securely, and to communicate with you about your account.\n\n3. Data Sharing: Your travel preferences and location data are encrypted. We never sell your personal data to third parties. We may share necessary data with service providers (like Stripe for payments or Clerk for authentication).\n\n4. Your Rights: You have the right to access, update, or delete your personal information at any time from your account settings.",
    },
    terms: {
      title: "Terms of Service",
      text: "Last updated: July 18, 2026.\n\nBy using TripCraft AI, you agree to our Terms of Service.\n\n1. Service Description: TripCraft AI provides AI-generated travel itineraries and recommendations. These are automated suggestions and should be verified independently before booking.\n\n2. User Responsibilities: You are responsible for ensuring your account details are secure. You agree not to misuse our API or attempt to scrape data from our services.\n\n3. Limitation of Liability: We are not liable for any changes in hotel pricing, flight cancellations, or travel disruptions. You are solely responsible for your travel decisions and bookings made based on our itineraries.\n\n4. Subscriptions and Refunds: Payments are processed securely. Subscriptions can be canceled at any time, but refunds are subject to our refund policy.",
    },
    cookies: {
      title: "Cookie Policy",
      text: "We use strictly necessary cookies to keep you logged in securely and functional cookies to remember your travel preferences (like dark mode and currency settings). We do not use third-party tracking cookies for targeted advertising.",
    },
  };

  const { title, text } = content[type as keyof typeof content];

  return (
    <div className="container mx-auto px-4 py-24 min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <div className="prose prose-slate dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
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

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 min-h-[70vh]">Loading...</div>}>
      <LegalContent />
    </Suspense>
  );
}
