"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  ChevronRight,
  RefreshCw,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import posthog from "posthog-js";

interface TripContext {
  destination?: string;
  budget?: number;
  currency?: string;
  days?: any[];
  travelStyle?: string;
  transportPreference?: string;
  hotelCategory?: string;
  foodPreference?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tripContext?: TripContext;
}

export function AIChatSidebar({
  isOpen,
  onClose,
  tripContext,
}: AIChatSidebarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm your AI Travel Assistant. I can help you modify your itinerary, find restaurants, optimize your budget, and more. What would you like to do?`,
    },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([
    "Find vegetarian restaurants near my hotel.",
    "Plan Day 3 with less walking.",
    "Reduce budget by ₹5000.",
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic welcome message
  useEffect(() => {
    if (tripContext?.destination) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hi! I'm your AI Travel Assistant for your trip to ${tripContext.destination}. I can help you modify your itinerary, find restaurants, optimize your budget, and more. What would you like to do?`,
        },
      ]);
    }
  }, [tripContext?.destination]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Voice AI Hooks
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (listening && transcript) {
      setInput(transcript);
    }
  }, [transcript, listening]);

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat cleared! How can I help you with your trip?",
      },
    ]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    posthog.capture('chat_message_sent', { 
      length: input.length,
      has_context: !!tripContext?.destination 
    });

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          tripContext,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        // Next.js AI SDK streams text in simple chunks, but sometimes formats them like: 0:"Chunk"
        // Let's implement a very basic text parsing:
        const lines = chunkValue.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              text += JSON.parse(line.substring(2));
            } catch (e) {
              text += line.substring(2);
            }
          } else if (line.trim()) {
            // Some streams just send raw text chunks
            // We just append plain string if it's not JSON structured
            if (!line.includes('0:"')) {
               text += line.replace(/\\n/g, "\n").replace(/\\"/g, '"');
            }
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: text } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    setTimeout(() => {
      document.getElementById("chat-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 50);
  };

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-16 bottom-0 w-full md:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary/30 to-accent/30 p-2.5 rounded-xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground leading-tight">
                    TripCraft AI
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Online • Gemini Powered
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="rounded-full h-8 w-8"
                  title="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              ref={scrollRef}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={idx > 0 ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[88%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-auto ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`p-3.5 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {formatText(msg.content)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1].role === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 flex-row max-w-[85%]">
                    <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center mt-auto">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-bl-sm flex gap-1.5 items-center">
                      <span
                        className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="text-xs text-muted-foreground ml-2">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions + Input */}
            <div className="p-4 bg-card border-t">
              {/* Dynamic Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={`${s}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSuggestion(s)}
                    disabled={isLoading}
                    className="text-[10px] bg-background border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  >
                    {s} <ChevronRight className="h-3 w-3" />
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <form
                id="chat-form"
                onSubmit={handleSubmit}
                className="relative"
              >
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about your trip..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`pr-[5.5rem] rounded-full bg-background ${listening ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : ""}`}
                  disabled={isLoading}
                />

                {mounted && browserSupportsSpeechRecognition && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleMicClick}
                    className={`absolute right-10 top-1 bottom-1 h-auto w-10 ${listening ? "text-red-500 animate-pulse bg-red-500/10 hover:bg-red-500/20 hover:text-red-600" : "text-muted-foreground hover:bg-transparent hover:text-primary/80"}`}
                    disabled={isLoading}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 bottom-1 h-auto w-10 text-primary hover:bg-transparent hover:text-primary/80"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
