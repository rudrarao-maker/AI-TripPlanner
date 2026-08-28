import { WifiOff, Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflineFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-muted/30 p-8 rounded-full mb-8 shadow-inner">
        <WifiOff className="h-16 w-16 text-muted-foreground" />
      </div>
      
      <h1 className="text-3xl font-extrabold tracking-tight mb-4">
        Looks like you're off the grid.
      </h1>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
        You can't plan new trips without an internet connection, but don't worry! Your cached itineraries are still safely stored on your device.
      </p>
      
      <Link href="/">
        <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg">
          <Compass className="h-5 w-5" />
          View Offline Trips
        </Button>
      </Link>
    </div>
  );
}
