import React from "react";

export const metadata = {
  title: "Privacy Policy | TripCraft AI",
  description: "Privacy Policy for TripCraft AI.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl pt-24">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p><strong>Last Updated:</strong> August 2026</p>

        <h2>1. Introduction</h2>
        <p>
          TripCraft AI respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
        </p>

        <h2>2. Data We Collect</h2>
        <ul>
          <li><strong>Authentication Data:</strong> We use Clerk for authentication. When you sign up, we collect your email address, name, and profile picture.</li>
          <li><strong>Payment Data:</strong> Payments are processed securely via Stripe. We do not store your full credit card numbers on our servers.</li>
          <li><strong>Travel Data:</strong> We store the itineraries you generate, including your destination preferences, budget, and saved places, to provide a personalized experience.</li>
          <li><strong>Usage Data:</strong> We use PostHog and Sentry to collect anonymous analytics and error reports to improve our application stability and UX.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>
          We use your data to:
        </p>
        <ul>
          <li>Provide and maintain the TripCraft AI service.</li>
          <li>Process AI generation requests based on your travel preferences.</li>
          <li>Notify you about account updates, subscription changes, or platform news.</li>
          <li>Monitor and analyze usage trends and diagnose technical issues.</li>
        </ul>

        <h2>4. Data Sharing & Third Parties</h2>
        <p>
          We do not sell your personal data. However, we share necessary data with trusted third-party services:
        </p>
        <ul>
          <li><strong>OpenAI/Google:</strong> Your travel preferences and prompts are sent to AI providers to generate the itineraries. These providers do not use your API data to train their models.</li>
          <li><strong>Clerk & Stripe:</strong> For identity verification and billing infrastructure.</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal data. You can manage your account settings directly within the app or contact us to request full account deletion.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at hello@tripcraft.ai.
        </p>
      </div>
    </div>
  );
}
