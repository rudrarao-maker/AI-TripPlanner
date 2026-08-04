"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Sparkles, Mic, Navigation, ArrowRight } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSearch = (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = preset || prompt;
    if (!finalPrompt.trim()) return;

    // Pass the raw prompt to the planner page to parse and generate
    router.push(`/plan?prompt=${encodeURIComponent(finalPrompt)}`);
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div
      className="w-full max-w-3xl mt-8 flex flex-col gap-4 animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* AI Search Box */}
      <div
        className={`relative bg-background/80 dark:bg-card/90 backdrop-blur-2xl border-2 p-2 rounded-3xl transition-all duration-300 ${isFocused ? "border-primary/50 shadow-[0_8px_40px_rgba(0,0,0,0.15)] ring-4 ring-primary/10" : "border-border/50 shadow-xl"}`}
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
              className="w-full bg-transparent border-none outline-none text-xl sm:text-2xl text-foreground placeholder:text-muted-foreground/50 resize-none px-6 py-5 min-h-[90px] overflow-hidden leading-relaxed"
              rows={1}
            />
            {mounted && browserSupportsSpeechRecognition && (
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all ${listening ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Mic className="h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-4 pb-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Powered by Gemini AI</span>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() && !listening}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              <span>Generate Trip</span>
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Quick AI Prompts */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 px-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">
          Try:
        </span>
        {SUGGESTED_PROMPTS.map((tag, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSearch(undefined, tag)}
            className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-foreground/80 text-xs sm:text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
