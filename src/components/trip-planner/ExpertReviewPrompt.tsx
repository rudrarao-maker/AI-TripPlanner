import { useState } from "react";
import { ShieldCheck, UserCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpertReviewPromptProps {
  tripId: string;
  currentStatus: "none" | "pending" | "completed";
}

export function ExpertReviewPrompt({ tripId, currentStatus }: ExpertReviewPromptProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReview = async () => {
    setIsSubmitting(true);
    // Simulate API call to mark as pending
    setTimeout(() => {
      setStatus("pending");
      setIsSubmitting(false);
    }, 1500);
  };

  if (status === "completed") {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-green-500/20 p-3 rounded-xl shrink-0">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-1">Expert Review Completed</h3>
          <p className="text-sm text-green-600 dark:text-green-500/80">
            A human travel expert has reviewed and validated this itinerary. All logistics, bookings, and timings are optimized.
          </p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-amber-500/20 p-3 rounded-xl shrink-0 animate-pulse">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-1">Review in Progress</h3>
          <p className="text-sm text-amber-600 dark:text-amber-500/80">
            Our travel experts are currently reviewing your itinerary. You'll receive a notification once everything is finalized and verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border border-primary/20 rounded-2xl p-6 relative overflow-hidden shadow-sm">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 opacity-10">
        <UserCheck className="w-40 h-40" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> Premium Feature
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">Want absolute peace of mind?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            While our AI is highly accurate, sometimes you want a human touch. Have one of our certified travel planners review this itinerary, verify logistics, and offer booking assistance with 24x7 support during your trip.
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
          <Button 
            onClick={handleRequestReview} 
            disabled={isSubmitting}
            className="rounded-full shadow-lg hover:-translate-y-0.5 transition-transform bg-primary text-primary-foreground font-medium px-8 h-12"
          >
            {isSubmitting ? "Requesting..." : "Request Expert Review"} 
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          <span className="text-xs text-muted-foreground font-medium pr-2">One-time fee of $49</span>
        </div>
      </div>
    </div>
  );
}
