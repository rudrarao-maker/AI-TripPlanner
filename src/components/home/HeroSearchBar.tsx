"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Cpu, Mic, Navigation, Loader2, Image as ImageIcon, X } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SUGGESTED_PROMPTS = [
  "A 5-day luxury honeymoon in Bali for two, $3000 budget.",
  "Weekend getaway to Goa with friends, budget-friendly.",
  "Solo backpacking trip across Europe for 2 weeks.",
  "Family road trip to Manali, kid-friendly activities.",
];

export function HeroSearchBar() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening && transcript) {
      setPrompt(transcript);
    }
  }, [transcript, listening]);

  const handleMicClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = preset || prompt;
    if (!finalPrompt.trim() && !selectedImage) return;

    setIsSubmitting(true);
    
    if (selectedImage) {
      sessionStorage.setItem("pendingTripImage", selectedImage);
    } else {
      sessionStorage.removeItem("pendingTripImage");
    }

    // Pass the raw prompt to the planner page to parse and generate
    const queryParams = new URLSearchParams();
    if (finalPrompt.trim()) queryParams.append("prompt", finalPrompt);
    if (selectedImage) queryParams.append("hasImage", "true");
    
    router.push(`/trip-planner?${queryParams.toString()}`);
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div
      className="w-full max-w-3xl mt-4 md:mt-8 flex flex-col gap-3 md:gap-4 animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* AI Search Box */}
      <div
        className={`relative bg-background/80 dark:bg-card/90 backdrop-blur-2xl border-2 p-1.5 md:p-2 rounded-2xl transition-all duration-300 ${isFocused ? "border-primary/40 shadow-lg ring-2 ring-primary/10" : "border-border/50 shadow-md"}`}
      >
        <form onSubmit={handleSearch} className="flex flex-col relative z-10">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                autoResize();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="e.g. Plan a 5-day honeymoon to Bali for two with a budget of $2000..."
              className="w-full bg-transparent border-none outline-none text-base sm:text-lg md:text-xl lg:text-2xl text-foreground placeholder:text-muted-foreground/50 resize-none px-4 md:px-6 py-3 md:py-5 min-h-[60px] md:min-h-[90px] overflow-hidden leading-relaxed"
              rows={1}
              disabled={isSubmitting}
            />
            
            {/* Image Preview Thumbnail */}
            {selectedImage && (
              <div className="absolute left-4 top-3 h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden border-2 border-primary/50 shadow-sm z-20">
                <img src={selectedImage} alt="Upload preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center gap-1 md:gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                title="Upload Inspiration Image"
                className={`p-2 md:p-3 rounded-full transition-all ${selectedImage ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <ImageIcon className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              
              {mounted && browserSupportsSpeechRecognition && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isSubmitting}
                  className={`p-2 md:p-3 rounded-full transition-all ${listening ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Mic className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between px-3 md:px-4 pb-2 md:pb-3 pt-1 md:pt-2">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Powered by Gemini AI</span>
            </div>

            <button
              type="submit"
              disabled={(!prompt.trim() && !listening && !selectedImage) || isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 md:h-12 px-5 md:px-8 rounded-full font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 text-sm md:text-base w-full sm:w-auto justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate Trip</span>
                  <Navigation className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick AI Prompts — horizontal scroll on mobile, show 2 on small screens */}
      <div className="flex overflow-x-auto items-center gap-2 mt-2 md:mt-4 px-1 md:px-2 scrollbar-hide snap-x">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-1 md:mr-2 shrink-0">
          Try:
        </span>
        {SUGGESTED_PROMPTS.map((tag, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSearch(undefined, tag)}
            disabled={isSubmitting}
            className="snap-start px-3 md:px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-foreground/80 text-xs sm:text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
