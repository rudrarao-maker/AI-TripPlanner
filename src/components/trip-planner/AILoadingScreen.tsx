"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const LOADING_STEPS = [
  "Understanding preferences",
  "Searching destinations",
  "Finding hotels",
  "Checking weather",
  "Finding transport",
  "Calculating budget",
  "Optimizing itinerary",
  "Generating recommendations",
  "Finalizing itinerary"
];

export function AILoadingScreen({ formData }: { formData: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Total generation usually takes 10-15 seconds.
    // We have 9 steps, so advance one step roughly every 1.5 seconds.
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98; // Cap at 98 until actually finished
        return prev + 1;
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <Card className="glass relative z-10 p-10 border-primary/30 shadow-2xl rounded-3xl overflow-hidden">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI is crafting your perfect trip
            </h2>
            <p className="text-sm text-muted-foreground">
              Processing data for {formData?.destinations[0] || "your destination"}...
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {LOADING_STEPS.slice(0, currentStep + 2).map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 ${
                    isCompleted ? "text-primary" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className="text-sm">{step}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground font-medium">
            {Math.floor(progress)}% Complete
          </div>
        </Card>
      </div>
    </div>
  );
}
