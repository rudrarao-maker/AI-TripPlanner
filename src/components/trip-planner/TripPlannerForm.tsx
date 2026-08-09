"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Users, Sparkles, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, Hotel, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TripPlannerForm({
  step,
  setStep,
  formData,
  setFormData,
  updateForm,
  handleGenerate,
  isGenerating,
  AVAILABLE_INTERESTS,
  toggleInterest,
  browserSupportsSpeechRecognition,
  listening,
  handleMicClick,
}: any) {
  const [mounted, setMounted] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState("");
  const router = useRouter();
  
  useEffect(() => setMounted(true), []);

  const handleMagicSubmit = () => {
    if (!magicPrompt.trim()) return;
    router.push(`/trip-planner?prompt=${encodeURIComponent(magicPrompt)}`);
  };

  const TRIP_TYPES = [
    "Solo", "Couple", "Family", "Friends", "Business", 
    "Honeymoon", "Adventure", "Road Trip", "Luxury", "Backpacking"
  ];

  const toggleTripType = (type: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tripType: prev.tripType.includes(type)
        ? prev.tripType.filter((t: string) => t !== type)
        : [...prev.tripType, type],
    }));
  };

  const renderFormStep = () => {
    switch (step) {
      case 1:
        // Step 1: Trip Details (Destination, Departure City, Start Date, End Date, Number of Days, Number of Travelers)
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Trip Details</h2>
            <div className="space-y-6 max-w-xl mx-auto">
              {/* Destination */}
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                  <Input
                    className="pl-14 py-6 text-lg rounded-xl glass shadow-sm border-primary/20"
                    placeholder="Where to? (Destination)"
                    value={formData.destinations[0]}
                    onChange={(e) => {
                      const newDests = [...formData.destinations];
                      newDests[0] = e.target.value;
                      updateForm("destinations", newDests);
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Departure City */}
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-6 w-6" />
                  <Input
                    className="pl-14 py-6 text-lg rounded-xl glass shadow-sm border-primary/20"
                    placeholder="Departure City"
                    value={formData.departureCity}
                    onChange={(e) => updateForm("departureCity", e.target.value)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20"
                      value={formData.dates.split("to")[0]?.trim() || ""}
                      onChange={(e) => {
                        const endDate = formData.dates.split("to")[1]?.trim() || "";
                        updateForm("dates", `${e.target.value} to ${endDate}`);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-4 text-muted-foreground h-4 w-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="pl-9 py-6 text-sm rounded-xl glass border-primary/20"
                      value={formData.dates.split("to")[1]?.trim() || ""}
                      onChange={(e) => {
                        const startDate = formData.dates.split("to")[0]?.trim() || "";
                        updateForm("dates", `${startDate} to ${e.target.value}`);
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Number of Days</label>
                  <Input 
                    type="number" 
                    className="py-6 text-sm rounded-xl glass border-primary/20" 
                    placeholder="e.g. 7" 
                    value={formData.days}
                    onChange={(e) => updateForm("days", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" /> Total Travelers
                  </label>
                  <Input 
                    disabled 
                    className="py-6 text-sm rounded-xl glass border-primary/20 bg-muted/50" 
                    value={formData.adults + formData.children + formData.seniors} 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        // Step 2: Traveler Information (Adults, Children, Senior Citizens)
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Traveler Information</h2>
            <div className="space-y-8 max-w-lg mx-auto">
              {[
                { key: "adults", label: "Adults", desc: "12-59 yrs" },
                { key: "children", label: "Children", desc: "0-11 yrs" },
                { key: "seniors", label: "Senior Citizens", desc: "60+ yrs" }
              ].map((group) => (
                <div key={group.key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-foreground">{group.label}</span>
                      <span className="text-xs">{group.desc}</span>
                    </div>
                    <span className="text-xl font-bold">{formData[group.key]}</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline" size="icon" className="rounded-full h-10 w-10"
                      onClick={() => updateForm(group.key, Math.max(group.key === 'adults' ? 1 : 0, formData[group.key] - 1))}
                    >
                      -
                    </Button>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(formData[group.key] / 10) * 100}%` }} />
                    </div>
                    <Button
                      variant="outline" size="icon" className="rounded-full h-10 w-10"
                      onClick={() => updateForm(group.key, Math.min(10, formData[group.key] + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        // Step 3: Trip Type
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Trip Type</h2>
            <p className="text-center text-muted-foreground mb-8">Select one or multiple styles for your trip.</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {TRIP_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTripType(type)}
                  className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                    formData.tripType.includes(type)
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "glass border border-white/10 hover:border-primary/50 text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        // Step 4: Interests
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Interests</h2>
            <p className="text-center text-muted-foreground mb-8">Select your main interests to personalize your itinerary.</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {AVAILABLE_INTERESTS.map((interest: string) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-5 py-3 rounded-full text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-accent text-accent-foreground shadow-lg scale-105"
                      : "glass border border-white/10 hover:border-accent/50 text-foreground"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        // Step 5: Budget Selection
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Budget Selection</h2>
            <p className="text-center text-muted-foreground mb-8">Select a premium budget tier or compare all plans.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
              {/* Cheap */}
              <div 
                onClick={() => updateForm("budgetTier", "cheap")}
                className={`cursor-pointer rounded-3xl p-6 glass border-2 transition-all duration-300 ${formData.budgetTier === 'cheap' ? 'border-green-500 shadow-green-500/20 shadow-xl scale-105' : 'border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><span className="text-2xl">💚</span> Cheap</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Budget Hotels</li>
                  <li>• Hostels</li>
                  <li>• Public Transport</li>
                  <li>• Local Food</li>
                  <li>• Free Attractions</li>
                </ul>
              </div>

              {/* Moderate */}
              <div 
                onClick={() => updateForm("budgetTier", "moderate")}
                className={`cursor-pointer rounded-3xl p-6 glass border-2 transition-all duration-300 ${formData.budgetTier === 'moderate' ? 'border-blue-500 shadow-blue-500/20 shadow-xl scale-105' : 'border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><span className="text-2xl">💙</span> Moderate</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 3-4 Star Hotels</li>
                  <li>• Mixed Transport</li>
                  <li>• Popular Restaurants</li>
                  <li>• Balanced Activities</li>
                </ul>
              </div>

              {/* Luxury */}
              <div 
                onClick={() => updateForm("budgetTier", "luxury")}
                className={`cursor-pointer rounded-3xl p-6 glass border-2 transition-all duration-300 ${formData.budgetTier === 'luxury' ? 'border-purple-500 shadow-purple-500/20 shadow-xl scale-105' : 'border-white/10 hover:border-white/30'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><span className="text-2xl">💎</span> Luxury</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 5-Star Hotels</li>
                  <li>• Resorts</li>
                  <li>• Chauffeur Service</li>
                  <li>• Premium Restaurants</li>
                  <li>• VIP Experiences</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                variant={formData.budgetTier === 'compare' ? 'default' : 'outline'} 
                size="lg" 
                className={`rounded-full px-8 py-6 text-lg ${formData.budgetTier === 'compare' ? 'shadow-xl scale-105' : ''}`}
                onClick={() => updateForm("budgetTier", "compare")}
              >
                Compare All Plans
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-28 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Magic Prompt Section */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-16 text-center"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" /> Magic Prompt
            </h3>
            <div className="relative shadow-2xl shadow-primary/10 rounded-full">
              <Input 
                value={magicPrompt}
                onChange={(e) => setMagicPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMagicSubmit()}
                placeholder="e.g. Plan a 3-day cheap trip to Paris for 2 foodies..."
                className="py-7 pl-6 pr-32 text-lg rounded-full glass border-primary/30 bg-background/50"
              />
              <Button 
                onClick={handleMagicSubmit}
                className="absolute right-2 top-2 bottom-2 rounded-full px-6"
                variant="gradient"
                disabled={isGenerating}
              >
                Generate
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px bg-border/50 flex-1" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Or build it manually</span>
              <div className="h-px bg-border/50 flex-1" />
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-2 mb-12 max-w-lg mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 flex items-center">
              <div
                className={`h-2 rounded-full w-full transition-colors duration-500 ${i <= step ? "bg-primary shadow-sm shadow-primary/50" : "bg-primary/20"}`}
              />
            </div>
          ))}
        </div>

        <Card className="glass border-primary/20 shadow-2xl p-8 md:p-12 rounded-3xl min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">{renderFormStep()}</AnimatePresence>

          <div className="flex justify-between mt-12 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button
                variant="gradient"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && formData.destinations[0].trim().length < 2)
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleGenerate}
                className="gap-2"
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4" /> Build My Trip
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
