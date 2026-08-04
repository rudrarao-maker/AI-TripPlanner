"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  X,
  ChevronRight,
  Zap,
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
import api from "@/lib/api";

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  actions?: ChatAction[];
  timestamp: Date;
}

interface ChatAction {
  type: string;
  label: string;
  data?: Record<string, any>;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      text: "Hi! I'm your AI Travel Assistant powered by Gemini. I can help you modify your itinerary, find restaurants, optimize your budget, and more. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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
      setMessages((prev) => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0 && newMsgs[0].id === "1") {
          newMsgs[0].text = `Hi! I'm your AI Travel Assistant for your trip to ${tripContext.destination}. I can help you modify your itinerary, find restaurants, optimize your budget, and more. What would you like to do?`;
        }
        return newMsgs;
      });
    }
  }, [tripContext?.destination]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        type: "user",
        text: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        // Send to real API with trip context and chat history
        const response = await api.post("/chat", {
          message: text.trim(),
          tripContext: {
            destination: tripContext?.destination,
            budget: tripContext?.budget,
            currency: tripContext?.currency || "INR",
            days: tripContext?.days,
            travelStyle: tripContext?.travelStyle,
            transportPreference: tripContext?.transportPreference,
            hotelCategory: tripContext?.hotelCategory,
            foodPreference: tripContext?.foodPreference,
          },
          chatHistory: messages.slice(-8).map((m) => ({
            type: m.type,
            text: m.text,
          })),
        });

        const data = response.data.data;

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          text: data.reply,
          actions: data.actions || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Update suggestions from AI response
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error("Chat API error:", error);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          text: "Sorry, I encountered an error. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages, tripContext],
  );

  const handleActionClick = (action: ChatAction) => {
    // Send the action as a follow-up message
    handleSend(`Apply action: ${action.label}`);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        type: "ai",
        text: "Chat cleared! How can I help you with your trip?",
        timestamp: new Date(),
      },
    ]);
    setSuggestions([
      "Find vegetarian restaurants near my hotel.",
      "Plan Day 3 with less walking.",
      "Reduce budget by ₹5000.",
    ]);
  };

  // Format message text with markdown-like bold
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
      // Handle newlines
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
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[88%] gap-2 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-auto ${
                        msg.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                      }`}
                    >
                      {msg.type === "user" ? (
                        <User className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`p-3.5 rounded-2xl ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {formatText(msg.text)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {msg.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleActionClick(action)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors"
                            >
                              <Zap className="h-3 w-3" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p
                        className={`text-[10px] text-muted-foreground/50 ${msg.type === "user" ? "text-right" : ""}`}
                      >
                        {msg.timestamp.toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
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
                    onClick={() => handleSend(s)}
                    disabled={isTyping}
                    className="text-[10px] bg-background border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                  >
                    {s} <ChevronRight className="h-3 w-3" />
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative"
              >
                <Input
                  ref={inputRef}
                  placeholder="Ask me anything about your trip..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`pr-[5.5rem] rounded-full bg-background ${listening ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : ""}`}
                  disabled={isTyping}
                />

                {browserSupportsSpeechRecognition && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleMicClick}
                    className={`absolute right-10 top-1 bottom-1 h-auto w-10 ${listening ? "text-red-500 animate-pulse bg-red-500/10 hover:bg-red-500/20 hover:text-red-600" : "text-muted-foreground hover:bg-transparent hover:text-primary/80"}`}
                    disabled={isTyping}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 bottom-1 h-auto w-10 text-primary hover:bg-transparent hover:text-primary/80"
                  disabled={!input.trim() || isTyping}
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
