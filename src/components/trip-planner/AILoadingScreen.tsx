"use client";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PipelineStep } from "@/hooks/useTripPlanner";

export function AILoadingScreen({ formData, pipelineSteps }: { formData: any, pipelineSteps?: PipelineStep[] }) {
  
  // Calculate progress based on steps
  const totalSteps = pipelineSteps?.length || 1;
  const completedSteps = pipelineSteps?.filter(s => s.status === "done").length || 0;
  const progress = Math.min(98, Math.floor((completedSteps / totalSteps) * 100));

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
              Processing data for {formData?.destinations?.[0] || "your destination"}...
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {pipelineSteps?.map((step, index) => {
              const isCompleted = step.status === "done";
              const isCurrent = step.status === "running";
              const isError = step.status === "error";

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 ${
                    isCompleted ? "text-primary" : isCurrent ? "text-foreground font-medium" : isError ? "text-red-500" : "text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : isError ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm">{step.label}</span>
                    {step.message && isCurrent && (
                      <span className="text-xs text-muted-foreground mt-0.5">{step.message}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.5 }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground font-medium">
            {progress}% Complete
          </div>
        </Card>
      </div>
    </div>
  );
}
