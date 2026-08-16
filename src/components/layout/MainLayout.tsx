"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatWidget } from "../chat/ChatWidget";
import { LocationPromptModal } from "../location/LocationPromptModal";

export function MainLayout({ children, isAdmin = false }: { children: React.ReactNode, isAdmin?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dbIsAdmin={isAdmin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
      <LocationPromptModal />
    </div>
  );
}
