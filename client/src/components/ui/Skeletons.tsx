import { motion } from 'framer-motion';

// ===== Generic Shimmer Effect =====
function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-muted rounded animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%] ${className}`} />
  );
}

// ===== Card Skeleton =====
export function CardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <Shimmer className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <Shimmer className="h-6 w-24" />
        <Shimmer className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// ===== Hotel Card Skeleton =====
export function HotelCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Shimmer className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-4 w-1/2" />
        <div className="flex gap-2 mt-4">
          <Shimmer className="h-6 w-14 rounded-md" />
          <Shimmer className="h-6 w-14 rounded-md" />
          <Shimmer className="h-6 w-14 rounded-md" />
        </div>
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div className="space-y-1">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-6 w-16" />
          </div>
          <Shimmer className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ===== Itinerary Skeleton =====
export function ItinerarySkeleton({ days = 2 }: { days?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: days }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden">
          <div className="bg-muted/30 border-b p-4 flex items-center gap-3">
            <Shimmer className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Shimmer className="h-5 w-48" />
              <Shimmer className="h-3 w-32" />
            </div>
          </div>
          <div className="p-5 space-y-4">
            {[1, 2, 3].map(j => (
              <div key={j} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Shimmer className="h-3 w-3 rounded-full" />
                  {j !== 3 && <div className="w-px flex-1 bg-border/30 mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="p-3 rounded-xl border border-border/30 space-y-2">
                    <Shimmer className="h-4 w-20 rounded-md" />
                    <Shimmer className="h-5 w-3/4" />
                    <Shimmer className="h-4 w-full" />
                    <div className="flex gap-3 mt-1">
                      <Shimmer className="h-3 w-16" />
                      <Shimmer className="h-3 w-12" />
                      <Shimmer className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Weather Skeleton =====
export function WeatherSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Shimmer className="h-5 w-28" />
          <Shimmer className="h-4 w-20" />
        </div>
        <div className="space-y-1 items-end">
          <Shimmer className="h-12 w-20" />
          <Shimmer className="h-3 w-16 ml-auto" />
        </div>
      </div>
      <div className="flex gap-6 pt-2">
        <Shimmer className="h-5 w-20" />
        <Shimmer className="h-5 w-16" />
        <Shimmer className="h-5 w-20" />
        <Shimmer className="h-5 w-16" />
      </div>
      <div className="pt-4 border-t">
        <Shimmer className="h-3 w-24 mb-3" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-2.5 rounded-xl bg-background/50 space-y-2 flex flex-col items-center">
              <Shimmer className="h-3 w-8" />
              <Shimmer className="h-6 w-6 rounded-full" />
              <Shimmer className="h-4 w-8" />
              <Shimmer className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Page Loading Skeleton =====
export function PageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-20 space-y-8"
    >
      <div className="space-y-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  );
}

// ===== Transport Card Skeleton =====
export function TransportCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <Shimmer className="h-10 w-10 rounded-lg" />
          <div className="space-y-1.5">
            <Shimmer className="h-5 w-32" />
            <Shimmer className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-1 items-end">
          <Shimmer className="h-6 w-20" />
          <Shimmer className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
