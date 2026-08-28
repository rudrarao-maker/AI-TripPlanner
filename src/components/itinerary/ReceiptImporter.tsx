"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Loader2, CheckCircle2, AlertCircle, Plane, Hotel, MapPin, Calendar, Clock, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReceiptImporterProps {
  onImportSuccess: (parsedData: any) => void;
}

export function ReceiptImporter({ onImportSuccess }: ReceiptImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!text.trim()) {
      toast.error("Please paste the receipt text first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trips/import-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.success) {
        setParsedResult(data.data);
        toast.success("Receipt parsed successfully!");
      } else {
        setError(data.error || "Failed to parse receipt.");
        toast.error("Failed to parse receipt.");
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
        setText("");
        setParsedResult(null);
        setError(null);
      }, 300);
    }
  };

  const Icon = parsedResult?.type === "flight" ? Plane : parsedResult?.type === "hotel" ? Hotel : Receipt;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:flex border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
        >
          <Receipt className="h-4 w-4 mr-2" /> Import Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber-500" /> Magic Email Importer
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!parsedResult ? (
            <>
              <p className="text-sm text-muted-foreground">
                Paste the raw text from your flight, hotel, or booking confirmation email here. Our AI will instantly parse it and add it to your itinerary.
              </p>
              <Textarea
                placeholder="Paste email text here... e.g. 'Your booking at Marriott is confirmed. Check-in: Oct 12, 3:00 PM...'"
                className="min-h-[200px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              <Button onClick={handleParse} disabled={isLoading || !text.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing with AI...
                  </>
                ) : (
                  "Extract Booking Details"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-full w-16 h-16 mx-auto mb-2">
                <CheckCircle2 className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-center font-bold text-lg">Booking Found!</h3>
              
              <div className="bg-muted p-4 rounded-xl space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{parsedResult.provider}</p>
                    <p className="text-muted-foreground">{parsedResult.description}</p>
                  </div>
                </div>
                
                {parsedResult.bookingReference && (
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span>Ref: <span className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">{parsedResult.bookingReference}</span></span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{parsedResult.location} {parsedResult.destination ? `→ ${parsedResult.destination}` : ""}</span>
                </div>

                {(parsedResult.startTime || parsedResult.endTime) && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      {parsedResult.startTime && <span>Start: {parsedResult.startTime}</span>}
                      {parsedResult.endTime && <span>End: {parsedResult.endTime}</span>}
                    </div>
                  </div>
                )}

                {parsedResult.totalCost && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-green-600">
                      {parsedResult.currency || "USD"} {parsedResult.totalCost}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="w-full" onClick={() => setParsedResult(null)}>
                  Try Again
                </Button>
                <Button className="w-full" onClick={handleConfirmAdd}>
                  Add to Itinerary
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
