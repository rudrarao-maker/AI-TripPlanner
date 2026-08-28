"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Loader2, CheckCircle2, AlertCircle, MapPin, Tag, PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface SocialImporterProps {
  onImportSuccess: (parsedData: any) => void;
}

export function SocialImporter({ onImportSuccess }: SocialImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url.trim() || !url.startsWith("http")) {
      toast.error("Please enter a valid URL.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/places/scrape-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (data.success) {
        setParsedResult(data.data);
        toast.success("Place extracted successfully!");
      } else {
        setError(data.error || "Failed to extract place.");
        toast.error("Failed to extract place.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (parsedResult) {
      onImportSuccess(parsedResult);
      setIsOpen(false);
      // Reset state for next time
      setTimeout(() => {
        setUrl("");
        setParsedResult(null);
        setError(null);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:flex border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-400"
        >
          <Instagram className="h-4 w-4 mr-2" /> Add from Socials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" /> Social Media AI Importer
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!parsedResult ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found a hidden gem on Instagram or TikTok? Paste the link below, and our AI will extract the location and add it to your trip!
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="https://instagram.com/reel/best-cafe-in-paris-cafe-de-flore"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>

              {/* Demo Hint */}
              <div className="text-xs text-muted-foreground/70 bg-muted p-2 rounded">
                <strong>Demo Hint:</strong> Try pasting <code>https://instagram.com/reel/hidden-waterfall-bali</code>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              <Button onClick={handleScrape} disabled={isLoading || !url.trim()} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting Location...
                  </>
                ) : (
                  "Extract Place"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-full w-16 h-16 mx-auto mb-2">
                <CheckCircle2 className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-center font-bold text-lg">Place Found!</h3>
              
              <div className="bg-muted p-4 rounded-xl space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-lg">{parsedResult.name}</p>
                    <p className="text-muted-foreground">{parsedResult.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="uppercase tracking-wider text-xs font-bold px-2 py-0.5 bg-background rounded-md">
                    {parsedResult.category}
                  </span>
                </div>

                <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                  <p className="italic text-muted-foreground">"{parsedResult.description}"</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="w-full" onClick={() => setParsedResult(null)}>
                  Try Another
                </Button>
                <Button className="w-full gap-2 bg-pink-600 hover:bg-pink-700 text-white" onClick={handleConfirmAdd}>
                  <PlusCircle className="h-4 w-4" /> Add to Itinerary
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
