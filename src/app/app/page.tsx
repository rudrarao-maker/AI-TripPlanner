"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, Share, PlusSquare, Smartphone, Plane, Sparkles, Map, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PWALandingPage() {
  const { isInstallable, isInstalled, platform, triggerInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-24 md:py-32 relative z-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          The Ultimate Travel Companion
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          Trip Planner, <br className="hidden md:block" /> Now in Your Pocket.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mb-12"
        >
          Get the native app experience without the App Store. Access your itineraries offline, receive instant flight delay alerts, and plan trips on the go.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-24"
        >
          {isInstalled ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-green-500/10 text-green-500 px-6 py-3 rounded-full font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5" /> App Installed
              </div>
              <Link href="/">
                <Button size="lg" className="rounded-full shadow-lg">Launch Planner</Button>
              </Link>
            </div>
          ) : platform === "ios" ? (
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-2xl max-w-sm mx-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                <Download className="w-5 h-5 text-primary" /> Install on iPhone
              </h3>
              <ol className="text-left space-y-4 text-muted-foreground text-sm font-medium">
                <li className="flex items-center gap-3">
                  <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                  <span>Tap the <Share className="w-4 h-4 inline mx-1 text-blue-500" /> Share button in Safari</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-4 h-4 inline mx-1 text-primary" /></span>
                </li>
              </ol>
            </div>
          ) : (
            <Button 
              size="lg" 
              onClick={triggerInstall}
              disabled={!isInstallable}
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity shadow-xl shadow-indigo-500/20"
            >
              <Download className="w-5 h-5 mr-2" /> 
              {isInstallable ? "Install App Now" : "Please open in Chrome/Edge"}
            </Button>
          )}
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">True Offline Mode</h3>
            <p className="text-muted-foreground text-sm">Wandering without cell service? Your itineraries and maps are cached directly on your device.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="bg-pink-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-pink-500">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Push Notifications</h3>
            <p className="text-muted-foreground text-sm">Get instant alerts on your lock screen if your flight is delayed or a reservation changes.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-emerald-500">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Native Speed</h3>
            <p className="text-muted-foreground text-sm">Experience buttery smooth animations and instant load times without taking up phone storage.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
