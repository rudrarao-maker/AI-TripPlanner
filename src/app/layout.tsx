import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/providers/PostHogProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { PostHogPageView } from '@/components/analytics/PostHogPageView'
import { UserAnalyticsProvider } from '@/components/analytics/UserAnalyticsProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trip Planner - AI Travel Companion",
  description: "Plan your perfect trip with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <PostHogProvider>
            <UserAnalyticsProvider>
              <PostHogPageView />
              <QueryProvider>
                <MainLayout>{children}</MainLayout>
              </QueryProvider>
            </UserAnalyticsProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
