"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2, Sparkles, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function TravelJournalPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [photos, setPhotos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [journal, setJournal] = useState<any>(null);

  // Mock photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, upload to S3 or similar. We will just use local object URLs for preview.
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleGenerateJournal = async () => {
    if (photos.length === 0) {
      toast.error("Please add some photos first.");
      return;
    }

    try {
      setIsGenerating(true);
      
      // In a real app, we'd send the actual hosted URLs or base64. 
      // For this demo, we'll send placeholder URLs to the AI since local blob URLs can't be read by the AI server directly.
      const mockHostedUrls = photos.map((_, i) => `https://source.unsplash.com/800x600/?travel,trip,sig=${i}`);

      const res = await fetch("/api/journal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrls: mockHostedUrls,
          tripContext: {
            destination: "Amazing Destination", // Would fetch real trip data
            duration: "5 days",
          }
        }),
      });

      if (!res.ok) throw new Error("Failed to generate journal");
      const data = await res.json();
      
      // Merge AI data with our local blob URLs for display
      const memories = data.data.memories.map((m: any, i: number) => ({
        ...m,
        photoUrl: photos[i % photos.length] // Use our local blobs
      }));

      setJournal({ ...data.data, memories });
      toast.success("AI Journal generated!");
    } catch (err: any) {
      toast.error(err.message || "Error generating journal");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/trips/${tripId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold font-display">Travel Journal</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/trips/${tripId}`)}>
            View Itinerary
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!journal ? (
          <div className="space-y-8">
            <div className="text-center space-y-4 max-w-xl mx-auto mt-12">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight font-display">Create Your AI Memory Timeline</h2>
              <p className="text-muted-foreground text-lg">
                Upload photos from your trip, and our AI will automatically organize them and write beautiful captions based on your itinerary context.
              </p>
            </div>

            <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
              <label htmlFor="photo-upload" className="cursor-pointer group flex flex-col items-center">
                <div className="h-16 w-16 bg-background border shadow-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4 text-primary">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-lg group-hover:text-primary transition-colors">Select Photos</span>
                <span className="text-sm text-muted-foreground mt-1">PNG, JPG, HEIC up to 10MB</span>
                <input 
                  id="photo-upload" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl">Selected Photos ({photos.length})</h3>
                  <Button variant="outline" size="sm" onClick={() => setPhotos([])}>Clear All</Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                      <img src={photo} alt="Upload preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button 
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-8 border-t">
                  <Button 
                    size="lg" 
                    className="rounded-full shadow-lg h-14 px-8 text-lg font-bold"
                    onClick={handleGenerateJournal}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing photos...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" /> Generate Magic Journal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Journal Summary */}
            <div className="text-center space-y-4 max-w-2xl mx-auto bg-primary/5 p-8 rounded-3xl border border-primary/10">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              <h2 className="text-3xl font-extrabold font-display">Your Journey</h2>
              <p className="text-lg leading-relaxed text-muted-foreground italic">
                "{journal.overallSummary}"
              </p>
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-primary/20 ml-4 md:ml-8 space-y-12 py-8">
              {journal.memories.map((memory: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative pl-8 md:pl-12"
                >
                  <div className="absolute -left-[9px] top-4 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  
                  <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border group">
                    <div className="md:flex">
                      <div className="md:w-1/2 relative">
                        <img 
                          src={memory.photoUrl} 
                          alt="Memory" 
                          className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                      </div>
                      <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-center bg-gradient-to-br from-card to-muted/20">
                        <div className="flex flex-wrap gap-3 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1 bg-background px-3 py-1 rounded-full shadow-sm">
                            <Calendar className="h-3 w-3" /> {memory.date}
                          </span>
                          <span className="flex items-center gap-1 bg-background px-3 py-1 rounded-full shadow-sm text-primary">
                            <MapPin className="h-3 w-3" /> {memory.location}
                          </span>
                        </div>
                        
                        <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground">
                          {memory.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <Button variant="outline" size="lg" onClick={() => setJournal(null)}>
                <Camera className="mr-2 h-4 w-4" /> Add More Photos
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
