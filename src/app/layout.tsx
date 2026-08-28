import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/PostHogProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { PostHogPageView } from '@/components/analytics/PostHogPageView'
import { UserAnalyticsProvider } from '@/components/analytics/UserAnalyticsProvider'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
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
  description: "Plan your perfect trip with AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trip Planner",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  let isAdmin = false;
  
  if (userId) {
    try {
      const userRecord = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });
      if (userRecord && (userRecord.role === "admin" || userRecord.role === "owner")) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to fetch user role in layout:", e);
    }
  }

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
                  <MainLayout isAdmin={isAdmin}>{children}</MainLayout>
                </QueryProvider>
              </UserAnalyticsProvider>
            </PostHogProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
