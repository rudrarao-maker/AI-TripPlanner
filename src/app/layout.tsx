import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/PostHogProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { PostHogPageView } from '@/components/analytics/PostHogPageView'
import { UserAnalyticsProvider } from '@/components/analytics/UserAnalyticsProvider'
import Script from "next/script";
import { SplashScreen } from "@/components/ui/splash-screen";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "@/components/theme-provider";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Trip Planner - AI Travel Companion",
  description: "Plan your perfect trip with AI-powered itineraries, expense tracking, and real-time collaboration.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trip Planner",
    startupImage: [
      {
        url: '/icon.png',
        media: '(device-width: 768px) and (device-height: 1024px)'
      }
    ]
  },
  formatDetection: {
    telephone: false,
  },
};

// Admin status is determined at the layout/page level where it's needed (e.g., admin/layout.tsx).
// Removed the per-request DB query that was running on EVERY page load to check admin role,
// which added unnecessary latency. The MainLayout now handles admin nav visibility client-side.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PostHogProvider>
              <UserAnalyticsProvider>
                <SplashScreen />
                <PostHogPageView />
                <QueryProvider>
                  <MainLayout>{children}</MainLayout>
                </QueryProvider>
              </UserAnalyticsProvider>
            </PostHogProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

