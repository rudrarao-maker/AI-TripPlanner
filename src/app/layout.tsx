import type { Metadata } from "next";
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

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Trip Planner - AI Travel Companion",
  description: "Plan your perfect trip with AI",
  manifest: '/manifest.json',
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
