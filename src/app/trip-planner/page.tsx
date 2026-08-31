"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Wallet,
  Loader2,
  Sparkles,
  Navigation,
  Hotel,
  Map as MapLucide,
  Plane,
  Sun,
  Download,
  Mic,
  Backpack,
  Share2,
  BookmarkPlus,
  CalendarDays,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap").then((mod) => mod.InteractiveMap), { ssr: false, loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-3xl" /> });
import dynamic from "next/dynamic";
const GlobeMap = dynamic(() => import("@/components/trip/GlobeMap").then((mod) => mod.GlobeMap), { ssr: false });
import { HotelCard } from "@/components/recommendations/HotelCard";
import { RestaurantCard } from "@/components/recommendations/RestaurantCard";
import { AttractionCard } from "@/components/recommendations/AttractionCard";
import { TransportCard } from "@/components/recommendations/TransportCard";
import { DraggableItinerary } from "@/components/itinerary/DraggableItinerary";
import { PackingList } from "@/components/itinerary/PackingList";
import { BudgetOptimizer } from "@/components/itinerary/BudgetOptimizer";
import { TravelTools } from "@/components/itinerary/TravelTools";
import { AIChatSidebar } from "@/components/itinerary/AIChatSidebar";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { NearbyPlaces } from "@/components/map/NearbyPlaces";
import { ExpenseTracker } from "@/components/itinerary/ExpenseTracker";
import { ItinerarySkeleton } from "@/components/ui/Skeletons";
import { Bot } from "lucide-react";
import { TripPlannerForm } from "@/components/trip-planner/TripPlannerForm";
const PlanComparison = dynamic(() => import("@/components/trip-planner/PlanComparison").then((mod) => mod.PlanComparison), { ssr: false });
const TripPlannerView = dynamic(() => import("@/components/trip-planner/TripPlannerView").then((mod) => mod.TripPlannerView), { ssr: false });
import { AILoadingScreen } from "@/components/trip-planner/AILoadingScreen";
import { downloadTripAsPDF, generateICS } from "@/lib/export";
import { TRAVEL_STYLES } from "@/lib/constants";
import { exportTripToPdf } from "@/lib/pdfExport";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "regenerator-runtime/runtime";
import { useGenerateTrip, useParsePrompt } from "@/hooks/useTrips";
import { useHotels, useRestaurants, useAttractions, useTransport } from "@/hooks/useRecommendations";
import { useSocket } from "@/hooks/useSocket";
import { useTripPlanner } from "@/hooks/useTripPlanner";

// Destination coordinate lookup for weather/map integration
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  bali: { lat: -8.409518, lng: 115.188919 },
  goa: { lat: 15.2993, lng: 74.124 },
  manali: { lat: 32.2396, lng: 77.1887 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  ladakh: { lat: 34.1526, lng: 77.5771 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  paris: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  london: { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.006 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  agra: { lat: 27.1767, lng: 78.0081 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  ooty: { lat: 11.4064, lng: 76.6932 },
  mysore: { lat: 12.2958, lng: 76.6394 },
};

function getCoordinates(destination: string): { lat: number; lng: number } {
  const key = destination.toLowerCase().trim();
  for (const [name, coords] of Object.entries(DESTINATION_COORDS)) {
    if (key.includes(name) || name.includes(key)) {
      return coords;
    }
  }
  // Default: center of India
  return { lat: 20.5937, lng: 78.9629 };
}

function TripPlannerContent() {
  const navigate = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchParams = useSearchParams();
  const parsePromptMutation = useParsePrompt();

  const {
    isGenerating,
    setIsGenerating,
    pipelineSteps,
    plans,
    setPlans,
    itinerary,
    partialItinerary,
    setItinerary,
    optimisticItinerary,
    updateOptimisticItinerary,
    generateWithData,
    generateBudgetPlans
  } = useTripPlanner();

  // Real-time socket
  const { collaborators, emit, subscribe, socketId } = useSocket(itinerary?.id);

  // Wanderlog style map sync state
  const [activeItemHover, setActiveItemHover] = useState<string>("");

  // Google Travel style tab state
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "logistics" | "packing" | "expenses"
  >("itinerary");
  const [recTab, setRecTab] = useState<
    "hotels" | "restaurants" | "attractions" | "transport"
  >("hotels");

  // Speech Recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Form State
  const [formData, setFormData] = useState({
    tripMode: "single", // 'single' or 'multi'
    destinations: [""],
    destinationEntries: [] as any[], // for multi-dest
    departureCity: "",
    dates: "",
    days: "",
    adults: 2,
    children: 0,
    seniors: 0,
    tripType: [] as string[],
    interests: [] as string[],
    dietary: [] as string[],
    accessibility: [] as string[],
    budgetTier: "compare", // 'cheap', 'moderate', 'luxury', 'compare'
    budget: "",
    style: "",
    transport: "flight",
    hotel: "4-star",
  });

  const AVAILABLE_INTERESTS = [
    "Nature", "Mountains", "Beaches", "Museums", "Food", "Shopping", 
    "Hiking", "Nightlife", "Wildlife", "Historical Places", 
    "Photography", "Festivals", "Wellness", "Religious Places", "Water Sports"
  ];
  
  const TRIP_TYPES = [
    "Solo", "Couple", "Family", "Friends", "Business", 
    "Honeymoon", "Adventure", "Road Trip", "Luxury", "Backpacking"
  ];

  // AI Prompt Parsing Logic
  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    const hasImage = searchParams.get("hasImage");
    
    if ((initialPrompt || hasImage) && step === 1 && !isGenerating) {
      const processPrompt = async () => {
        setIsGenerating(true);
        try {
          const imageBase64 = hasImage ? sessionStorage.getItem("pendingTripImage") || undefined : undefined;
          const parsed = await parsePromptMutation.mutateAsync({ 
            prompt: initialPrompt || undefined, 
            imageBase64 
          });

          // Apply parsed data to form
          const newFormData = { ...formData };
          if (parsed.destinations?.length > 0)
            newFormData.destinations = parsed.destinations;
          if (parsed.budget) newFormData.budget = parsed.budget.toString();
          if (parsed.travelers) {
            newFormData.adults = Math.min(10, Math.max(1, parsed.travelers));
            newFormData.children = 0;
          }
          if (parsed.travelStyle)
            newFormData.style = parsed.travelStyle.toLowerCase();
          if (parsed.hotelCategory) {
            const h = parsed.hotelCategory.toLowerCase();
            if (h.includes("lux")) newFormData.hotel = "luxury";
            else if (h.includes("budg") || h.includes("hostel"))
              newFormData.hotel = "budget";
            else newFormData.hotel = "4-star";
          }
          
          const daysCount = parsed.daysCount || 7;
          const startD = new Date();
          const endD = new Date(new Date().setDate(new Date().getDate() + daysCount - 1));
          const yyyyStart = startD.toISOString().split("T")[0];
          const yyyyEnd = endD.toISOString().split("T")[0];
          newFormData.dates = `${yyyyStart} to ${yyyyEnd}`;

          setFormData(newFormData);

          // Auto-advance to generation using the extracted data
          // We must wait for state to update, or just pass the data directly
          await generateWithData(newFormData);
        } catch (e) {
          console.error("Failed to parse prompt", e);
          setIsGenerating(false);
        }
      };
      processPrompt();
    }
  }, [searchParams]);

  // Generate logic is now handled by useTripPlanner hook

  // Recommendation Hooks
  const destination = formData.destinations[0] || "Bali";
  const { data: hotels = [] } = useHotels({
    location: destination,
    maxPrice: parseInt(formData.budget) || undefined,
  });
  const { data: restaurants = [] } = useRestaurants({ location: destination });
  const { data: attractions = [] } = useAttractions({ location: destination });
  const { data: transportOptions = [] } = useTransport({
    destination,
    type: formData.transport,
  });

  // Get coordinates for the destination
  const destCoords = getCoordinates(formData.destinations[0] || "Bali");

  const handleGenerate = async () => {
    // setIsGenerating(true); // Don't set this yet!
    generateBudgetPlans(formData);
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Sync speech transcript to destination
  if (
    listening &&
    transcript &&
    formData.destinations[formData.destinations.length - 1] !== transcript
  ) {
    const newDests = [...formData.destinations];
    newDests[newDests.length - 1] = transcript;
    setFormData((prev) => ({ ...prev, destinations: newDests }));
  }

  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleDownloadPdf = async () => {
    toast.loading("Generating PDF...", { id: "pdf-export" });
    try {
      await downloadTripAsPDF("trip-planner-view", `Trip-${formData.destinations.join("-") || "Itinerary"}`);
      toast.success("PDF downloaded!", { id: "pdf-export" });
    } catch (error) {
      toast.error("Failed to export PDF", { id: "pdf-export" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Trip link copied to clipboard!");
  };

  const handleSave = async () => {
    if (!itinerary) {
      toast.error("No itinerary selected to save.");
      return;
    }
    const loadingToast = toast.loading("Saving your trip...");
    try {
      const res = await api.post("/trips/save", {
        tripData: itinerary,
        preferences: formData
      });
      if (res.data.success) {
        toast.success("Trip saved to your profile!", { id: loadingToast });
        setItinerary({ ...itinerary, id: res.data.data.id });
        return res.data.data.id;
      } else {
        toast.error("Failed to save trip.", { id: loadingToast });
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.", { id: loadingToast });
    }
  };

  const handleCalendarSync = () => {
    if (!itinerary) {
      toast.error("No itinerary to sync.");
      return;
    }
    try {
      generateICS(itinerary, `Trip-${formData.destinations.join("-") || "Itinerary"}`);
      toast.success("Itinerary synced to calendar!");
    } catch (e) {
      toast.error("Failed to generate calendar file.");
    }
  };

  // ------------------
  // RENDER HELPERS
  // ------------------

  if (isGenerating && !partialItinerary) {
    const hasImage = searchParams.get("hasImage") === "true";
    const imagePreview = hasImage ? sessionStorage.getItem("pendingTripImage") || undefined : undefined;
    return <AILoadingScreen formData={formData} pipelineSteps={pipelineSteps} hasImage={hasImage} imagePreview={imagePreview} />;
  }

  const selectedPlan = selectedPlanIndex !== null ? plans[selectedPlanIndex] : null;
  const activeItinerary = partialItinerary || selectedPlan || optimisticItinerary;

  if (plans.length > 0 && selectedPlanIndex === null) {
    return (
      <PlanComparison
        plans={plans}
        formData={formData}
        setSelectedPlanIndex={setSelectedPlanIndex}
        setItinerary={setItinerary}
        setPlans={setPlans}
        setStep={setStep}
        generateWithData={generateWithData}
      />
    );
  }

  if (activeItinerary) {
    return (
      <TripPlannerView
        activeItinerary={activeItinerary}
        formData={formData}
        itinerary={optimisticItinerary}
        plans={plans}
        setSelectedPlanIndex={setSelectedPlanIndex}
        collaborators={collaborators}
        emit={emit}
        subscribe={subscribe}
        socketId={socketId}
        destCoords={destCoords}
        hotels={hotels}
        restaurants={restaurants}
        attractions={attractions}
        transportOptions={transportOptions}
        handleCalendarSync={handleCalendarSync}
        handleSave={handleSave}
        handleShare={handleShare}
        handleDownloadPdf={handleDownloadPdf}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        setActiveItemHover={setActiveItemHover}
        searchParams={searchParams}
        updateOptimisticItinerary={updateOptimisticItinerary}
      />
    );
  }

  return (
    <TripPlannerForm
      step={step}
      setStep={setStep}
      formData={formData}
      setFormData={setFormData}
      updateForm={updateForm}
      handleGenerate={handleGenerate}
      isGenerating={isGenerating}
      AVAILABLE_INTERESTS={AVAILABLE_INTERESTS}
      toggleInterest={toggleInterest}
      browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
      listening={listening}
      handleMicClick={handleMicClick}
    />
  );
}

export default function TripPlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading planner...</div>}>
      <TripPlannerContent />
    </Suspense>
  );
}
