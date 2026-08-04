import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { SupabaseProvider } from "@/lib/supabase/auth-context";

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
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <MainLayout>{children}</MainLayout>
        </SupabaseProvider>
      </body>
    </html>
  );
}
