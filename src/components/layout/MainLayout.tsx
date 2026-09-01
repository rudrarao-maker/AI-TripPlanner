"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { ChatWidget } from "../chat/ChatWidget";
import { LocationPromptModal } from "../location/LocationPromptModal";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      {/* Footer hidden on mobile — bottom nav replaces it */}
      <div className="hidden md:block">
        <Footer />
      </div>
      <MobileBottomNav />
      <ChatWidget />
      <LocationPromptModal />
    </div>
  );
}

