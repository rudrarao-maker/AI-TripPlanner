import React from "react";

export const metadata = {
  title: "Terms of Service | TripCraft AI",
  description: "Terms of Service for TripCraft AI.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl pt-24">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p><strong>Last Updated:</strong> August 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using TripCraft AI ("we", "our", or "us"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.
        </p>

        <h2>2. Use of AI and Google Maps Data</h2>
        <p>
          TripCraft AI utilizes advanced Artificial Intelligence (LLMs) and third-party services like Google Maps to generate itineraries. You acknowledge that:
        </p>
        <ul>
          <li>AI-generated content may occasionally contain inaccuracies or hallucinations. Always verify critical travel details (e.g., operating hours, visa requirements) independently.</li>
          <li>Location data, ratings, and maps are provided by third-party APIs. We are not responsible for closed businesses, inaccurate coordinates, or unexpected conditions upon arrival.</li>
        </ul>

        <h2>3. User Accounts and Subscriptions</h2>
        <p>
          To access premium features, you may be required to register for an account via Clerk and purchase a subscription via Stripe. You are responsible for maintaining the confidentiality of your account credentials. All payments are non-refundable unless legally required.
        </p>

        <h2>4. User-Generated Content</h2>
        <p>
          Any itineraries you mark as "Public" can be viewed by other users. You grant us a non-exclusive license to display and distribute this content within the TripCraft AI platform.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, TripCraft AI shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the service. This includes missed flights, closed attractions, or unsatisfactory accommodations recommended by the AI.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Continued use of the platform after changes implies acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}
