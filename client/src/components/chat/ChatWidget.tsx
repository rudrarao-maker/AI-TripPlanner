import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hi! I am your AI travel assistant. Need help planning your trip or finding recommendations?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate API call to our backend Chat controller
    setTimeout(() => {
      let reply = "I'm here to help! Could you specify your destination or budget constraints?";
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('goa') && lowerMsg.includes('20000')) {
        reply = "A 5-day Goa trip under ₹20,000 is definitely doable! I recommend staying in North Goa hostels (₹800/night) and renting a scooter (₹400/day). Shall I generate this itinerary?";
      } else if (lowerMsg.includes('vegetarian')) {
        reply = "For pure vegetarian options, I highly recommend 'Navtara Veg Restaurant' and 'Jalsa'. I've added them to your Food Picks filter!";
      } else if (lowerMsg.includes('closest') && lowerMsg.includes('beach')) {
        reply = "'Ayana Resort' is located directly on Jimbaran beach and is only a 2-minute walk to the water.";
      } else if (lowerMsg.includes('weather')) {
        reply = "Tomorrow's forecast for your destination shows a high of 28°C with clear sunny skies. Perfect beach weather! ☀️";
      } else if (lowerMsg.includes('optimize')) {
        reply = "I've analyzed your itinerary. By moving the Sacred Monkey Forest visit to Day 2 morning, you can avoid peak afternoon crowds and save 2 hours of transit time. Would you like me to apply this change?";
      } else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay')) {
        reply = "I recommend checking out our premium stays. For example, Taj Lake Palace offers an incredible experience starting at ₹25,000/night.";
      } else if (lowerMsg.includes('food') || lowerMsg.includes('restaurant')) {
        reply = "Looking for food? Try 'Bukhara' for amazing North Indian cuisine, highly rated by our users.";
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-xl shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110 z-50",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={cn(
          "fixed bottom-6 right-6 w-80 sm:w-[350px] z-50 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <Card className="shadow-2xl border-primary/20 flex flex-col h-[500px] overflow-hidden glass">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-white py-3 px-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base font-medium">TripCraft AI Guide</CardTitle>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/20 p-1 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-card/80">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex max-w-[85%] animate-fade-in",
                  msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
                )}
              >
                <div 
                  className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-br-sm" 
                      : "bg-muted text-foreground rounded-bl-sm border"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex mr-auto justify-start max-w-[85%] animate-fade-in">
                <div className="p-3 rounded-2xl rounded-bl-sm bg-muted text-foreground border flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 bg-card border-t">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input 
                placeholder="Ask about your trip..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-background"
              />
              <Button type="submit" size="icon" variant="gradient" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
