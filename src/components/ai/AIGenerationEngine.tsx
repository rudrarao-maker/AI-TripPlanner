"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { type AIOrbState } from "./AIAssistantOrb";

const AIAssistantOrb = dynamic(() => import("./AIAssistantOrb").then(mod => mod.AIAssistantOrb), {
  ssr: false,
  loading: () => <div className="w-40 h-40 rounded-full bg-primary/5 animate-pulse flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/40" /></div>
});

const GENERATION_STEPS = [
  "Understanding preferences...",
  "Analyzing destination data...",
  "Finding relevant places...",
  "Optimizing travel route...",
  "Building day-by-day itinerary...",
  "Calculating estimated budget...",
  "Checking local schedules...",
  "Personalizing recommendations..."
];

interface AIGenerationEngineProps {
  isGenerating: boolean;
  hasImage?: boolean;
  onComplete?: () => void;
}

export function AIGenerationEngine({ isGenerating, hasImage, onComplete }: AIGenerationEngineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [orbState, setOrbState] = useState<AIOrbState>("idle");

  const steps = [
    ...(hasImage ? ["Scanning uploaded image..."] : []),
    "Understanding preferences...",
    "Analyzing destination data...",
    "Finding relevant places...",
    "Optimizing travel route...",
    "Building day-by-day itinerary...",
    "Calculating estimated budget...",
    "Checking local schedules...",
    "Personalizing recommendations..."
  ];

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setOrbState("idle");
      return;
    }

    setOrbState("thinking");
    
    // Simulate progression through steps for visual feedback
    const totalSteps = steps.length;
    let step = 0;
    
    // Switch orb to generating after thinking phase
    const orbTimer = setTimeout(() => setOrbState("generating"), 1500);

    const interval = setInterval(() => {
      step += 1;
      if (step < totalSteps) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setOrbState("success");
        if (onComplete) {
          setTimeout(onComplete, 1000); // Allow success animation to play
        }
      }
    }, 2000); // Each step takes 2 seconds to simulate real processing

    return () => {
      clearTimeout(orbTimer);
      clearInterval(interval);
    };
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center gap-12"
    >
      {/* Left side: The AI Orb */}
      <div className="flex-shrink-0 flex flex-col items-center gap-4">
        <AIAssistantOrb state={orbState} className="w-40 h-40" />
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">
          AI Trip Engine
        </div>
      </div>

      {/* Right side: The Checklist */}
      <div className="flex-1 w-full space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: isPending ? 0.4 : 1, 
                x: 0,
                scale: isActive ? 1.02 : 1 
              }}
              className={`flex items-center gap-3 transition-colors duration-300 ${
                isActive ? "text-primary font-medium" : 
                isCompleted ? "text-foreground" : 
                "text-muted-foreground"
              }`}
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isCompleted && (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500 bg-green-500/10 p-1 rounded-full"
                    >
                      <Check className="w-3 h-3 font-bold" />
                    </motion.div>
                  )}
                  {isActive && (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.div>
                  )}
                  {isPending && (
                    <motion.div
                      key="circle"
                      className="text-border"
                    >
                      <Circle className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-sm md:text-base">{step}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
