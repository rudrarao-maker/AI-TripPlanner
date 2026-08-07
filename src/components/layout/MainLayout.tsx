"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatWidget } from "../chat/ChatWidget";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
