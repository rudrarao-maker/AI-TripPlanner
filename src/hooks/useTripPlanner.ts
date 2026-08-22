import { useOptimistic, useState, useRef } from "react";
import toast from "react-hot-toast";
import posthog from "posthog-js";
import { findDestinationInfo, formatBudgetRange } from "@/lib/destinationData";

export type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  message?: string;
};

export const useTripPlanner = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [finalItinerary, setFinalItinerary] = useState<any>(null);
  const [activeTripId, setActiveTripId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: "validator", label: "Understanding your trip", status: "pending" },
    { id: "destination", label: "Analyzing destination", status: "pending" },
    { id: "discovery", label: "Finding relevant places", status: "pending" },
    { id: "ranking", label: "Analyzing preferences", status: "pending" },
    { id: "generator", label: "Building initial itinerary", status: "pending" },
    { id: "optimizer", label: "Optimizing schedules", status: "pending" },
    { id: "budget", label: "Planning budget", status: "pending" },
    { id: "refiner", label: "Finalizing details", status: "pending" },
  ]);

  const itinerary = finalItinerary;

  const [optimisticItinerary, setOptimisticItinerary] = useOptimistic(
    itinerary,
    (state, newItinerary: any) => ({
      ...state,
      ...newItinerary,
    })
  );

  const generateBudgetPlans = (dataToUse: any) => {
    // 1. Calculate trip days
    let tripDays = 7;
    if (dataToUse.days && parseInt(dataToUse.days) > 0) {
      tripDays = parseInt(dataToUse.days);
    } else if (dataToUse.dates && dataToUse.dates.includes("to")) {
      const parts = dataToUse.dates.split("to");
      const startD = new Date(parts[0].trim());
      const endD = new Date(parts[1].trim());
      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime())) {
        tripDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }
    }

    // 2. Lookup destination
    const destination = dataToUse.tripMode === "multi" && dataToUse.destinationEntries?.length > 0
      ? dataToUse.destinationEntries[0].name
      : dataToUse.destinations[0] || "Bali";
    
    const info = findDestinationInfo(destination);
    
    // 3. Get generic ranges
    const budgetRange = info ? formatBudgetRange(info, tripDays) : {
      budgetTotal: 20000,
      moderateTotal: 50000,
      luxuryTotal: 120000,
    };

    const mockDays = Array.from({ length: tripDays }).map((_, i) => ({
      dayNumber: i + 1,
      date: `Day ${i + 1}`,
      activities: []
    }));

    // 4. Create 3 skeleton plans
    const cheapPlan = {
      _tier: { label: "Budget Plan", tag: "CHEAP", budget: budgetRange.budgetTotal, hotelPref: "budget", name: "Budget Stay" },
      days: mockDays.map(d => ({ ...d, activities: [{ category: 'hotel', estimatedCost: Math.floor(budgetRange.budgetTotal * 0.4 / tripDays), name: 'Budget Hotel / Hostel' }, { category: 'sightseeing', estimatedCost: Math.floor(budgetRange.budgetTotal * 0.6 / tripDays), name: 'Local Attractions' }] }))
    };
    
    const moderatePlan = {
      _tier: { label: "Standard Plan", tag: "MODERATE", budget: budgetRange.moderateTotal, hotelPref: "4-star", name: "4-Star Hotel" },
      days: mockDays.map(d => ({ ...d, activities: [{ category: 'hotel', estimatedCost: Math.floor(budgetRange.moderateTotal * 0.4 / tripDays), name: 'Premium 4-Star Hotel' }, { category: 'sightseeing', estimatedCost: Math.floor(budgetRange.moderateTotal * 0.6 / tripDays), name: 'Guided Tours & Dining' }] }))
    };
    
    const luxuryPlan = {
      _tier: { label: "Luxury Plan", tag: "PREMIUM", budget: budgetRange.luxuryTotal, hotelPref: "luxury", name: "5-Star Resort" },
      days: mockDays.map(d => ({ ...d, activities: [{ category: 'hotel', estimatedCost: Math.floor(budgetRange.luxuryTotal * 0.5 / tripDays), name: '5-Star Luxury Resort' }, { category: 'sightseeing', estimatedCost: Math.floor(budgetRange.luxuryTotal * 0.5 / tripDays), name: 'Private Tours & Fine Dining' }] }))
    };

    setPlans([cheapPlan, moderatePlan, luxuryPlan]);
  };

  const generateWithData = async (dataToUse: any) => {
    setIsGenerating(true);
    setFinalItinerary(null);
    setActiveTripId(undefined);
    
    const isMulti = dataToUse.tripMode === "multi";
    setPipelineSteps(isMulti ? [
      { id: "validator", label: "Validating destinations", status: "pending" },
      { id: "route_optimizer", label: "Optimizing route", status: "pending" },
      { id: "transport", label: "Planning inter-city transport", status: "pending" },
      { id: "discovery", label: "Finding relevant places", status: "pending" },
      { id: "ranking", label: "Analyzing preferences", status: "pending" },
      { id: "generator", label: "Building multi-city itinerary", status: "pending" },
      { id: "budget", label: "Calculating total budget", status: "pending" },
      { id: "refiner", label: "Finalizing journey", status: "pending" },
    ] : [
      { id: "validator", label: "Understanding your trip", status: "pending" },
      { id: "destination", label: "Analyzing destination", status: "pending" },
      { id: "discovery", label: "Finding relevant places", status: "pending" },
      { id: "ranking", label: "Analyzing preferences", status: "pending" },
      { id: "generator", label: "Building initial itinerary", status: "pending" },
      { id: "optimizer", label: "Optimizing schedules", status: "pending" },
      { id: "budget", label: "Planning budget", status: "pending" },
      { id: "refiner", label: "Finalizing details", status: "pending" },
    ]);

    let startD = new Date();
    let endD = new Date(new Date().setDate(new Date().getDate() + 7));
    if (dataToUse.dates && dataToUse.dates.includes("to")) {
      const parts = dataToUse.dates.split("to");
      if (parts[0].trim()) startD = new Date(parts[0].trim());
      if (parts[1]?.trim()) endD = new Date(parts[1].trim());
    }

    const tripData = {
      isMultiDestination: dataToUse.tripMode === "multi",
      destinationEntries: dataToUse.destinationEntries,
      origin: dataToUse.departureCity || "Home",
      destination: dataToUse.tripMode === "multi" && dataToUse.destinationEntries?.length > 0
        ? dataToUse.destinationEntries[0].name
        : dataToUse.destinations[0] || "Bali",
      startDate: startD.toISOString(),
      endDate: endD.toISOString(),
      travelers: dataToUse.adults + dataToUse.children + dataToUse.seniors,
      budget: dataToUse.budget || "100000",
      budgetTier: dataToUse.budgetTier, 
      tripType: dataToUse.tripType,
      interests: dataToUse.interests,
      dietary: dataToUse.dietary,
      accessibility: dataToUse.accessibility,
      pace: dataToUse.pace || "balanced",
      transportPreference: dataToUse.transport || "mixed",
      hotelCategory: dataToUse.hotel || "4-star",
      foodPreference: dataToUse.food || "Any",
    };

    try {
      const response = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) throw new Error("No response body");

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const dataStr = trimmedLine.replace("data: ", "").trim();
              if (!dataStr) continue;
              
              try {
                const data = JSON.parse(dataStr);
                
                if (data.step === "complete") {
                  try {
                    const payload = JSON.parse(data.message);
                    setFinalItinerary(payload.itinerary);

                    // ADVANCED DATA PERSISTENCE: Save to DB
                    const savePayload = {
                      tripData: {
                        title: `Trip to ${tripData.destination}`,
                        origin: tripData.origin,
                        destination: tripData.destination,
                        startDate: tripData.startDate,
                        endDate: tripData.endDate,
                        budget: Number(tripData.budget),
                        currency: "INR",
                        days: payload.itinerary.days.map((day: any) => ({
                          dayNumber: day.dayNumber,
                          date: day.date || tripData.startDate,
                          activities: day.activities.map((act: any) => ({
                            time: act.startTime || "",
                            name: act.title || "Activity",
                            location: act.address || act.location || "",
                            description: act.description || "",
                            category: act.category || "sightseeing",
                            estimatedCost: act.estimatedCost || 0,
                            currency: "INR"
                          }))
                        }))
                      },
                      preferences: {
                        origin: tripData.origin,
                        destination: tripData.destination,
                        travelStyle: (tripData as any).travelStyle || "Balanced",
                        transportPreference: (tripData as any).transportPreference || "Mixed",
                        hotelCategory: (tripData as any).hotelCategory || "3-star",
                        foodPreference: (tripData as any).foodPreference || "Any"
                      }
                    };

                    fetch("/api/trips/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(savePayload)
                    })
                    .then(r => r.json())
                    .then(res => {
                      if (res.success && res.data?.id) {
                         setActiveTripId(res.data.id);
                      }
                    })
                    .catch(e => console.error("Failed to persist trip to DB:", e));

                  } catch (err) {
                    console.error("Failed to parse complete payload", err);
                    setFinalItinerary(data.itinerary);
                  }
                  posthog.capture('trip_generated_success');
                  setIsGenerating(false);
                } else if (data.step === "error") {
                  toast.error(data.message);
                  setIsGenerating(false);
                } else {
                  setPipelineSteps(prev => prev.map(s => {
                    if (s.id === data.step) {
                      return { ...s, status: data.status, message: data.message || s.message };
                    }
                    return s;
                  }));
                }
              } catch (e) {
                console.error("Error parsing stream chunk:", dataStr);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.log("Plan generation failed:", err.message);
      toast.error(err.message || "Failed to generate plans. Please try again.");
      setIsGenerating(false);
    }
  };

  const updateOptimisticItinerary = (newData: any) => {
    setOptimisticItinerary(newData);
  };

  return {
    isGenerating,
    setIsGenerating,
    pipelineSteps,
    plans,
    setPlans,
    itinerary,
    setItinerary: setFinalItinerary,
    optimisticItinerary,
    updateOptimisticItinerary,
    generateWithData,
    generateBudgetPlans,
    activeTripId
  };
};
