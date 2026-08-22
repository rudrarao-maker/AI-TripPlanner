"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Users, Sparkles, Navigation, AlertTriangle, Globe, Zap, Shield, CreditCard as CreditCardIcon, Train, Car, Bus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plane, Hotel, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { findDestinationInfo, formatBudgetRange, areCitiesInSameState, type DestinationInfo } from "@/lib/destinationData";
import { DestinationBuilder } from "./DestinationBuilder";

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

  // Auto-calculate number of days when dates change
  useEffect(() => {
    const [startStr, endStr] = formData.dates.split("to");
    if (startStr && endStr) {
      const start = new Date(startStr.trim());
      const end = new Date(endStr.trim());
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          updateForm("days", diffDays.toString());
        }
      }
    }
  }, [formData.dates]);

  // Auto-detect destination info for budget + passport advisory
  const destinationInfo: DestinationInfo | null = useMemo(
    () => findDestinationInfo(formData.destinations[0]),
    [formData.destinations[0]]
  );

  // Compute trip days from dates
  const tripDays = useMemo(() => {
    const d = parseInt(formData.days);
    if (d > 0) return d;
    const parts = formData.dates.split("to");
    if (parts.length === 2) {
      const start = new Date(parts[0].trim());
      const end = new Date(parts[1].trim());
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }
    }
    return 7; // default
  }, [formData.days, formData.dates]);

  const budgetRange = useMemo(
    () => (destinationInfo ? formatBudgetRange(destinationInfo, tripDays) : null),
    [destinationInfo, tripDays]
  );

  // Auto-fill budget when destination changes (only if budget is empty)
  useEffect(() => {
    if (budgetRange && !formData.budget) {
      updateForm("budget", budgetRange.moderateTotal.toString());
    }
  }, [destinationInfo?.name]);

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
              {/* Trip Mode Selector */}
              <div className="flex bg-accent/30 p-1 rounded-xl mb-4 border border-border/50">
                <button
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                    formData.tripMode === "single" 
                      ? "bg-background shadow-sm text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => updateForm("tripMode", "single")}
                >
                  Single Destination
                </button>
                <button
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                    formData.tripMode === "multi" 
                      ? "bg-background shadow-sm text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => updateForm("tripMode", "multi")}
                >
                  Multiple Destinations
                </button>
              </div>

              {/* Destination Input / Builder */}
              {formData.tripMode === "multi" ? (
                <DestinationBuilder 
                  entries={formData.destinationEntries}
                  onChange={(newEntries) => updateForm("destinationEntries", newEntries)}
                />
              ) : (
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
              )}

              {/* Budget Suggestion Pill */}
              <AnimatePresence mode="wait">
                {formData.tripMode === "single" && destinationInfo && budgetRange && (
                  <motion.div
                    key={destinationInfo.name}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/20 p-2 rounded-xl flex-shrink-0">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-foreground flex items-center gap-2">
                            💡 {destinationInfo.name}, {destinationInfo.country}
                            {destinationInfo.isInternational && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase">
                                <Globe className="h-2.5 w-2.5" /> International
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ~{budgetRange.perDay} per day · Suggested for {tripDays} days: <span className="font-bold text-foreground">{budgetRange.total}</span>
                          </p>
                          {destinationInfo.currency !== "INR" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              💱 Local currency: {destinationInfo.currency} ({destinationInfo.currencySymbol})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Passport / Visa Advisory — only for international trips */}
              <AnimatePresence mode="wait">
                {formData.tripMode === "single" && destinationInfo?.isInternational && (
                  <motion.div
                    key={`passport-${destinationInfo.name}`}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/5 rounded-2xl p-4 border border-amber-500/20">
                      <div className="flex items-start gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-xl flex-shrink-0">
                          <span className="text-xl">🛂</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-foreground">
                            International Trip — Passport Required
                          </p>
                          <div className="mt-3 space-y-2">
                            {destinationInfo.visaRequired ? (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-base">📋</span>
                                <span className="text-muted-foreground">
                                  <span className="font-semibold text-foreground">
                                    Visa: {destinationInfo.visaType === "embassy" ? "Embassy Visa" : destinationInfo.visaType === "e-visa" ? "E-Visa Available" : "Visa on Arrival"}
                                  </span>
                                  {destinationInfo.visaNote && ` — ${destinationInfo.visaNote}`}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-base">✅</span>
                                <span className="text-muted-foreground">
                                  <span className="font-semibold text-green-600 dark:text-green-400">No visa required</span>
                                  {destinationInfo.visaNote && ` — ${destinationInfo.visaNote}`}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-base">💱</span>
                              <span className="text-muted-foreground">
                                Currency: <span className="font-semibold text-foreground">{destinationInfo.currency} ({destinationInfo.currencySymbol})</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-base">🔌</span>
                              <span className="text-muted-foreground">
                                Power adapter: <span className="font-semibold text-foreground">{destinationInfo.adapterType}</span>
                              </span>
                            </div>
                            {destinationInfo.insuranceRecommended && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-base">🏥</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">Travel insurance recommended</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            Ensure passport validity ≥ 6 months from travel date
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* Intra-State Transport Selector */}
              <AnimatePresence mode="wait">
                {formData.departureCity && formData.destinations[0] && areCitiesInSameState(formData.departureCity, formData.destinations[0]) && (
                  <motion.div
                    key="transport-selector"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                      <label className="text-sm font-semibold text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Traveling within the same state? Choose transport:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "flight", label: "Flight", icon: Plane },
                          { id: "train", label: "Train", icon: Train },
                          { id: "car", label: "Car", icon: Car },
                          { id: "bus", label: "Bus", icon: Bus },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => updateForm("transportMode", mode.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                              (formData.transportMode || "flight") === mode.id
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <mode.icon className="h-5 w-5 mb-1.5" />
                            <span className="text-xs font-medium">{mode.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`space-y-2 ${formData.tripMode === "multi" ? "col-span-2" : ""}`}>
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
                {formData.tripMode === "single" && (
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
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {formData.tripMode === "single" ? (
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
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Total Destinations</label>
                    <Input 
                      disabled 
                      className="py-6 text-sm rounded-xl glass border-primary/20 bg-muted/50" 
                      value={formData.destinationEntries.length}
                    />
                  </div>
                )}
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

            <div className="mt-12 space-y-8">
              {/* Pace Preference */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Trip Pace</h3>
                <div className="flex justify-center gap-3 max-w-md mx-auto bg-primary/5 p-1 rounded-2xl border border-primary/20">
                  {["Relaxed", "Balanced", "Fast-Paced"].map((pace) => (
                    <button
                      key={pace}
                      onClick={() => updateForm("pace", pace)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                        formData.pace === pace
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dietary Preferences */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Dietary Requirements</h3>
                <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                  {["Vegan", "Vegetarian", "Halal", "Gluten-Free", "Kosher"].map((diet) => (
                    <button
                      key={diet}
                      onClick={() => {
                        const newDietary = formData.dietary?.includes(diet)
                          ? formData.dietary.filter((d: string) => d !== diet)
                          : [...(formData.dietary || []), diet];
                        updateForm("dietary", newDietary);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.dietary?.includes(diet)
                          ? "bg-green-500 text-white shadow-lg scale-105"
                          : "glass border border-white/10 hover:border-green-500/50 text-foreground"
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">Accessibility Needs</h3>
                <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                  {["Wheelchair Accessible", "Low Walking", "Stroller Friendly", "Visual Aid", "Hearing Aid"].map((acc) => (
                    <button
                      key={acc}
                      onClick={() => {
                        const newAcc = formData.accessibility?.includes(acc)
                          ? formData.accessibility.filter((a: string) => a !== acc)
                          : [...(formData.accessibility || []), acc];
                        updateForm("accessibility", newAcc);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.accessibility?.includes(acc)
                          ? "bg-blue-500 text-white shadow-lg scale-105"
                          : "glass border border-white/10 hover:border-blue-500/50 text-foreground"
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>
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
                onClick={() => {
                  updateForm("budgetTier", "compare");
                  handleGenerate();
                }}
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
