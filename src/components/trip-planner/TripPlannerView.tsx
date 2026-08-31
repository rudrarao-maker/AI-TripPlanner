"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Users,
  Wallet,
  Sparkles,
  Map as MapLucide,
  Backpack,
  Receipt,
  Share2,
  BookmarkPlus,
  CalendarDays,
  Download,
  Plane,
  Bot,
  MapPin,
  CreditCard,
  Hotel,
  Utensils,
  Globe,
  Wand2,
  Info,
  Lock,
  Camera,
  Calendar,
  Clock,
  RefreshCw,
  Save,
  CheckCircle,
  FileText,
  Layout,
  Plus,
  CalendarSync
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadTripAsPDF, generateICS, syncWithGoogleCalendar } from "@/lib/export";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });
import { HotelCard } from "@/components/recommendations/HotelCard";
import { RestaurantCard } from "@/components/recommendations/RestaurantCard";
import { AttractionCard } from "@/components/recommendations/AttractionCard";
import { TransportCard } from "@/components/recommendations/TransportCard";
import { DraggableItinerary } from "@/components/itinerary/DraggableItinerary";
import { PackingList } from "@/components/itinerary/PackingList";
import { BudgetOptimizer } from "@/components/itinerary/BudgetOptimizer";
import { TravelTools } from "@/components/itinerary/TravelTools";
import { AIChatSidebar } from "@/components/itinerary/AIChatSidebar";
import { WeatherWidget } from "@/components/itinerary/WeatherWidget";
import { NearbyPlaces } from "@/components/map/NearbyPlaces";
import { ExpenseTracker } from "@/components/itinerary/ExpenseTracker";
import { LiveCursors } from "@/components/itinerary/LiveCursors";
import { ActivityPreviewCard } from "@/components/trip-planner/ActivityPreviewCard";
import { ReceiptImporter } from "@/components/itinerary/ReceiptImporter";
import { SocialImporter } from "@/components/itinerary/SocialImporter";
import { TripPlannerMobileNav } from "@/components/trip-planner/TripPlannerMobileNav";
import { findDestinationInfo } from "@/lib/destinationData";
import { LiveFlightsWidget } from "@/components/itinerary/LiveFlightsWidget";
import { useRegenerateDay } from "@/hooks/useTrips";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import localforage from "localforage";

export function TripPlannerView({
  activeItinerary: initialItinerary,
  formData,
  itinerary,
  plans,
  setSelectedPlanIndex,
  collaborators,
  emit,
  subscribe,
  socketId,
  destCoords,
  hotels,
  restaurants,
  attractions,
  transportOptions,
  handleCalendarSync,
  handleSave,
  handleDownloadPdf,
  isChatOpen,
  setIsChatOpen,
  setActiveItemHover,
  searchParams
}: any) {
  const router = useRouter();

  // Load from localforage on mount if available
  const [activeItinerary, setActiveItinerary] = useState(initialItinerary);

  useEffect(() => {
    async function loadCached() {
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = initialItinerary?.id ? `trip_${initialItinerary.id}` : "cachedItinerary";
          const cached: string | null = await localforage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.days && parsed.days.length > 0) {
              setActiveItinerary(parsed);
            }
          }
        } catch (e) {
          console.error("Failed to load itinerary from localforage", e);
        }
      }
    }
    loadCached();
  }, [initialItinerary?.id]);

  useEffect(() => {
    if (activeItinerary) {
      const cacheKey = activeItinerary.id ? `trip_${activeItinerary.id}` : "cachedItinerary";
      localforage.setItem(cacheKey, JSON.stringify(activeItinerary)).catch(console.error);
    }
  }, [activeItinerary]);

  const [activeTab, setActiveTab] = useState<"itinerary" | "logistics" | "packing" | "expenses">("itinerary");
  const [mobileViewMode, setMobileViewMode] = useState<"list" | "map">("list");
  const [recTab, setRecTab] = useState<"hotels" | "restaurants" | "attractions" | "transport">("hotels");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(activeItinerary.isPublic || false);

  const handleMobileNav = (view: "list" | "map" | "chat") => {
    if (view === "chat") {
      setIsChatOpen(true);
    } else {
      setMobileViewMode(view);
    }
  };
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isCompanionMode, setIsCompanionMode] = useState(false);
  const [isSimulatingDelay, setIsSimulatingDelay] = useState(false);
  const regenerateDayMutation = useRegenerateDay();

  const handleRegenerateDay = async (dayNumber: number) => {
    try {
      toast.loading(`Regenerating Day ${dayNumber}...`, { id: "regen-day" });
      const newDay = await regenerateDayMutation.mutateAsync({
        dayNumber,
        existingPlan: activeItinerary,
        preferences: formData,
      });
      
      // Update local state by replacing the day
      if (newDay && newDay.activities) {
        const updatedDays = [...activeItinerary.days];
        const dayIndex = updatedDays.findIndex((d: any) => d.dayNumber === dayNumber);
        if (dayIndex >= 0) {
          updatedDays[dayIndex] = newDay;
          // Emit socket event if collaborative trip
          if (emit) {
            // Need a more complex emit for full itinerary update, but for now we'll update local state
            // and trigger an optimistic save if possible, or just replace the day array
          }
        }
      }
      toast.success(`Day ${dayNumber} regenerated!`, { id: "regen-day" });
    } catch (err) {
      toast.error("Failed to regenerate day", { id: "regen-day" });
    }
  };

  const handleFlightDelaySimulation = async (dayNumber: number, flightNumber: string = "DL104", delayMinutes: number = 120) => {
    try {
      setIsSimulatingDelay(true);
      toast.loading(`Simulating flight delay for ${flightNumber}...`, { id: "flight-delay" });
      
      const dayIndex = activeItinerary.days.findIndex((d: any) => d.dayNumber === dayNumber);
      if (dayIndex < 0) throw new Error("Day not found");
      
      const currentActivities = activeItinerary.days[dayIndex].activities;

      const res = await fetch("/api/webhooks/flight-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber, delayMinutes, currentActivities })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        // Update the local state
        activeItinerary.days[dayIndex].activities = data.data.activities;
        
        // Show AI alerts
        if (data.data.alerts && data.data.alerts.length > 0) {
          data.data.alerts.forEach((alert: string) => {
             toast.error(`⚠️ AI Rebook: ${alert}`, { duration: 8000 });
          });
        }
        toast.success(`Day ${dayNumber} automatically rescheduled!`, { id: "flight-delay" });
        posthog.capture('flight_delay_simulated', { flightNumber, delayMinutes });
      } else {
        toast.error("Webhook simulation failed.", { id: "flight-delay" });
      }
    } catch (err) {
      toast.error("Failed to simulate flight delay", { id: "flight-delay" });
    } finally {
      setIsSimulatingDelay(false);
    }
  };

  // Detect if this is an international trip
  const destinationInfo = useMemo(
    () => findDestinationInfo(formData.destinations?.[0] || ""),
    [formData.destinations?.[0]]
  );

  const handleTogglePublic = async () => {
    if (!itinerary?.id || itinerary.id.startsWith("temp-")) {
      toast.error("Please save the trip first before making it public.");
      return;
    }

    try {
      setIsTogglingPublic(true);
      const res = await fetch(`/api/trips/${itinerary.id}/public`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPublic(!isPublic);
        toast.success(!isPublic ? "Trip is now visible to the community!" : "Trip is now private.");
      } else {
        toast.error("Failed to update visibility");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleReceiptImport = (parsedData: any) => {
    if (activeItinerary?.days && activeItinerary.days.length > 0) {
      // Add to first day as a starting point
      const day = activeItinerary.days[0];
      if (!day.activities) day.activities = [];
      day.activities.push({
        title: `${parsedData.provider} ${parsedData.type === 'flight' ? 'Flight' : parsedData.type === 'hotel' ? 'Stay' : 'Booking'}`,
        name: `${parsedData.provider} ${parsedData.type}`,
        category: parsedData.type,
        location: parsedData.location,
        description: `Ref: ${parsedData.bookingReference || 'N/A'} - ${parsedData.description}`,
        estimatedCost: parsedData.totalCost || 0,
        startTime: parsedData.startTime?.substring(11, 16) || '12:00',
      });
      toast.success(`Successfully added ${parsedData.provider} to Day 1!`);
      posthog.capture('magic_receipt_imported', { provider: parsedData.provider, type: parsedData.type });
    }
  };

  const handleSocialImport = (parsedData: any) => {
    if (activeItinerary?.days && activeItinerary.days.length > 0) {
      // Add to first day as a starting point, perhaps in the afternoon
      const day = activeItinerary.days[0];
      if (!day.activities) day.activities = [];
      day.activities.push({
        title: parsedData.name,
        name: parsedData.name,
        category: parsedData.category,
        location: parsedData.location,
        description: parsedData.description,
        estimatedCost: parsedData.estimatedCost || 0,
        startTime: '15:00', // Default to afternoon for social spots
      });
      toast.success(`Successfully added ${parsedData.name} to Day 1!`);
      posthog.capture('social_place_extracted', { category: parsedData.category });
    }
  };

  // Extract map markers from the itinerary
  const mapMarkers = activeItinerary?.days?.flatMap((day: any) => 
    day.activities?.filter((act: any) => act.coordinates?.lat && act.coordinates?.lng).map((act: any) => ({
      id: `${day.dayNumber}-${act.title || act.name}`,
      position: { lat: act.coordinates.lat, lng: act.coordinates.lng },
      title: act.title || act.name,
      type: act.category,
      description: act.description
    })) || []
  ) || [];

  // Add destination as main marker if no activities yet
  if (mapMarkers.length === 0) {
    mapMarkers.push({
      id: 'dest',
      position: destCoords,
      title: formData.destinations[0] || "Destination",
      type: "destination",
      description: "Trip Destination"
    });
  }

  return (
    <>
      {socketId && collaborators && (
        <LiveCursors
          collaborators={collaborators}
          subscribe={subscribe}
          emit={emit}
          socketId={socketId}
        />
      )}
      
      <div className="min-h-screen bg-background pb-20">
      <div className="relative h-[40vh] min-h-[300px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop"
          alt="Destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />{" "}
            {activeItinerary._tier?.label || "AI Generated"} Plan
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
            {formData.destinations.join(" • ") || activeItinerary.destination}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm md:text-base font-medium drop-shadow-md">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />{" "}
              {formData.dates || activeItinerary.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" /> ₹
              {(
                activeItinerary._tier?.budget ||
                parseInt(formData.budget) ||
                120000
              ).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />{" "}
              {formData.adults + formData.children} travelers
            </span>
          </div>
          {/* International trip badge */}
          {destinationInfo?.isInternational && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-100 text-xs font-bold"
            >
              <Globe className="h-3.5 w-3.5" />
              🛂 International Trip • Passport Required • {destinationInfo.currency} ({destinationInfo.currencySymbol})
              {destinationInfo.visaRequired && ` • ${destinationInfo.visaType === "embassy" ? "Embassy Visa" : destinationInfo.visaType === "e-visa" ? "E-Visa" : "Visa on Arrival"}`}
            </motion.div>
          )}
          {plans.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setSelectedPlanIndex(null)}
            >
              ← Compare All Plans
            </Button>
          )}
        </div>
      </div>

      <div
        id="itinerary-content"
        className="container mx-auto px-4 -mt-10 relative z-30 pb-24 lg:pb-0"
      >
        <TripPlannerMobileNav activeView={mobileViewMode} onViewChange={handleMobileNav} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Itinerary & Logistics */}
          <div className={cn("lg:col-span-2 space-y-6", mobileViewMode !== "list" && "hidden lg:block")}>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("itinerary")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "itinerary" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  Itinerary
                </button>
                <button
                  onClick={() => setActiveTab("logistics")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "logistics" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  Logistics
                </button>
                <button
                  onClick={() => setActiveTab("packing")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${activeTab === "packing" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Backpack className="h-4 w-4" /> Packing
                </button>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${activeTab === "expenses" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Receipt className="h-4 w-4" /> Expenses
                </button>
              </div>
              <div className="flex items-center gap-2">
                {itinerary?.id && !itinerary.id.startsWith("temp-") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/trips/${itinerary.id}/journal`)}
                    className="hidden sm:flex border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
                  >
                    <Camera className="h-4 w-4 mr-2" /> Photo Journal
                  </Button>
                )}
                <Button 
                  variant={isCompanionMode ? "default" : "outline"} 
                  className={`hidden sm:flex ${isCompanionMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => setIsCompanionMode(!isCompanionMode)}
                >
                  <MapPin className="h-4 w-4 mr-2" /> 
                  {isCompanionMode ? "Companion ON" : "Live Companion"}
                </Button>
                <SocialImporter onImportSuccess={handleSocialImport} />
                <ReceiptImporter onImportSuccess={handleReceiptImport} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCalendarSync}
                  className="hidden lg:flex border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                >
                  <CalendarDays className="h-4 w-4 mr-2" /> Sync Calendar
                </Button>
                <Button 
                      variant="outline" 
                      onClick={() => generateICS(itinerary, `Trip-${formData.destinations.join("-") || "Itinerary"}`)}
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Download Calendar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => syncWithGoogleCalendar(itinerary)}
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                    >
                      <CalendarSync className="mr-2 h-4 w-4" /> Add to Google Calendar
                    </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="hidden sm:flex"
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" /> Save Trip
                </Button>
                {itinerary?.id && !itinerary.id.startsWith("temp-") && (
                  <Button
                    variant={isPublic ? "default" : "outline"}
                    size="sm"
                    onClick={handleTogglePublic}
                    disabled={isTogglingPublic}
                    className="hidden sm:flex transition-all"
                  >
                    {isPublic ? (
                      <><Globe className="h-4 w-4 mr-2" /> Public</>
                    ) : (
                      <><Lock className="h-4 w-4 mr-2 text-muted-foreground" /> Private</>
                    )}
                  </Button>
                )}
                {itinerary?.id && (
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={async () => {
                      if (itinerary.id.startsWith("temp-")) {
                        const newId = await handleSave();
                        if (newId) window.location.href = `/checkout/${newId}`;
                      } else {
                        window.location.href = `/checkout/${itinerary.id}`;
                      }
                    }}
                    className="hidden sm:flex shadow-md shadow-primary/20"
                  >
                    <CreditCard className="h-4 w-4 mr-2" /> Book Trip
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const shareData = {
                      title: "My AI Trip Itinerary",
                      text: `Check out my trip to ${formData.destinations[0]}!`,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        console.log("Error sharing", err);
                      }
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="hidden sm:flex"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = `${window.location.origin}/trip-planner?id=${itinerary.id}&invite=true`;
                    navigator.clipboard.writeText(link);
                    toast.success("Invite link copied to clipboard!");
                  }}
                  className="hidden sm:flex text-primary border-primary/20 hover:bg-primary/10"
                >
                  <Users className="h-4 w-4 mr-2" /> Invite
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            </div>

            {/* AI Travel Tips (e.g. Passport/Visa, Transport) */}
            {activeItinerary?.travelTips && activeItinerary.travelTips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <h3 className="flex items-center text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  <Info className="h-4 w-4 mr-1.5" /> AI Travel Agent Tips
                </h3>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  {activeItinerary.travelTips.map((tip: string, idx: number) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "itinerary" && (
              <div className="space-y-6">
                {collaborators.length > 0 && (
                  <div className="flex -space-x-2 mb-2 items-center">
                    {collaborators.map((c: any) => (
                      <div
                        key={c.socketId}
                        className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold z-10 text-white overflow-hidden drop-shadow-sm"
                        title={`${c.name}`}
                        style={{ backgroundColor: c.color }}
                      >
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          c.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    <span className="ml-4 text-xs font-medium bg-muted px-2 py-1 rounded-full text-muted-foreground flex items-center">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      {collaborators.length} viewing live
                    </span>
                  </div>
                )}
                {hotels && hotels.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-extrabold flex items-center gap-2 mb-4">
                      <Hotel className="h-6 w-6 text-primary" />
                      Suggested Accommodations
                    </h3>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                      {hotels.map((hotel: any) => (
                        <div key={hotel.id} className="min-w-[300px] snap-center">
                          <HotelCard hotel={hotel} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {restaurants && restaurants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-extrabold flex items-center gap-2 mb-4">
                      <Utensils className="h-6 w-6 text-primary" />
                      AI Picks: Local Dining & Cafes
                    </h3>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                      {restaurants.map((restaurant: any) => (
                        <div key={restaurant.id} className="min-w-[300px] snap-center">
                          <RestaurantCard restaurant={restaurant} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attractions && attractions.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-extrabold flex items-center gap-2 mb-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      Must-See Places & Clubs
                    </h3>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                      {attractions.map((attraction: any) => (
                        <div key={attraction.id} className="min-w-[300px] snap-center">
                          <AttractionCard activity={attraction} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {activeItinerary?.days?.map((day: any) => {
                    const dayCost = day.activities?.reduce((sum: number, act: any) => sum + (Number(act.estimatedCost) || 0), 0) || 0;
                    return (
                      <div key={day.dayNumber} className="bg-card/40 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-5 border-b border-border/50 flex justify-between items-center">
                          <h3 className="text-xl font-extrabold flex items-center gap-3">
                            <span className="bg-primary text-primary-foreground h-9 w-9 rounded-full flex items-center justify-center text-sm shadow-lg ring-4 ring-primary/20">
                              {day.dayNumber}
                            </span>
                            <span className="tracking-tight">{day.date || "Detailed Itinerary"}</span>
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-background/50 hover:bg-background"
                            onClick={() => handleRegenerateDay(day.dayNumber)}
                            disabled={regenerateDayMutation.isPending}
                          >
                            {regenerateDayMutation.isPending ? (
                              <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                            ) : (
                              <Wand2 className="h-3 w-3 mr-2 text-primary" />
                            )}
                            Regenerate Day
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border-red-200 ml-2"
                            onClick={() => handleFlightDelaySimulation(day.dayNumber)}
                            disabled={isSimulatingDelay}
                          >
                            {isSimulatingDelay ? (
                              <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-red-600 border-r-transparent" />
                            ) : (
                              <Plane className="h-3 w-3 mr-2 text-red-600" />
                            )}
                            Simulate Flight Delay Webhook
                          </Button>
                        </div>
                        <div className="p-0">
                          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                            <div className="col-span-3">Time</div>
                            <div className="col-span-6">Activity</div>
                            <div className="col-span-3 text-right">Cost</div>
                          </div>
                          <div className="divide-y divide-border/50">
                            {day.activities?.length > 0 ? (
                              day.activities.map((act: any, idx: number) => {
                                const activityId = `${day.dayNumber}-${idx}`;
                                const isSelected = selectedActivity && selectedActivity._id === activityId;
                                return (
                                <div
                                  key={idx}
                                  className={`grid grid-cols-12 gap-4 px-8 py-5 items-start hover:bg-muted/10 transition-all group cursor-pointer ${isSelected ? 'ring-2 ring-primary/50 bg-primary/5 rounded-xl' : ''}`}
                                  onClick={() => setSelectedActivity({ ...act, _id: activityId })}
                                  >
                                    <div className="col-span-3 font-semibold text-sm text-primary/80 mt-1">{act.startTime || act.time || "Flexible"}</div>
                                    <div className="col-span-6">
                                      <div className="font-bold text-base text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                      <span className="text-lg bg-background shadow-sm h-8 w-8 rounded-lg flex items-center justify-center border border-border/50">
                                        {act.category === "hotel" ? "🏨" : act.category === "food" ? "🍽️" : act.category === "transport" ? "🚕" : act.category === "shopping" ? "🛍️" : act.category === "other" ? "✨" : "📍"}
                                      </span>
                                        {act.title || act.name}
                                      </div>
                                    {(act.location || act.address) && (
                                      <div className="text-sm font-medium text-muted-foreground/80 mt-2 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary/60" /> {act.location || act.address}
                                      </div>
                                    )}
                                    {act.description && (
                                      <div className="text-sm text-muted-foreground mt-2 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/30">{act.description}</div>
                                    )}
                                  </div>
                                  <div className="col-span-3 flex flex-col items-end gap-2 mt-1">
                                    <div className="font-bold text-base">
                                      {act.estimatedCost > 0 ? `₹${Number(act.estimatedCost).toLocaleString()}` : <span className="text-muted-foreground/50 text-sm font-medium uppercase tracking-widest">Included</span>}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                                        <Bot className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );})
                            ) : (
                               <div className="px-8 py-12 text-center text-muted-foreground font-medium bg-muted/5">No activities planned for this day yet.</div>
                            )}
                          </div>
                          <div className="px-8 py-5 bg-gradient-to-r from-transparent to-primary/5 border-t border-border/50 flex justify-end items-center gap-4">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Day {day.dayNumber} Total</span>
                            <span className="font-extrabold text-2xl text-primary">₹{dayCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  

                </div>
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="space-y-6">
                {itinerary?.id ? (
                  <ExpenseTracker
                    tripId={itinerary.id}
                    collaborators={collaborators}
                  />
                ) : (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                    Save this trip first to track shared expenses.
                  </div>
                )}
              </div>
            )}

            {activeTab === "logistics" && (
              <div className="space-y-6">
                <WeatherWidget destination={activeItinerary?.tripSummary?.destination || formData.destinations?.[0] || activeItinerary.destination} />
                
                {/* Transport Booking Widget */}
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="h-5 w-5 text-primary" /> Book Flights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      <div className="p-4 border-b border-border/50">
                        <LiveFlightsWidget 
                          origin={formData.departureCity || "Any"} 
                          destination={activeItinerary.destination || formData.destinations[0]} 
                          date={activeItinerary?.days?.[0]?.date} 
                          passengers={Number(formData.adults || 1) + Number(formData.children || 0)}
                        />
                      </div>
                      
                      <div 
                        className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer group"
                        onClick={() => {
                          const dest = activeItinerary.destination || formData.destinations[0];
                          let queryParams = `ss=${dest}`;
                          
                          if (activeItinerary.days && activeItinerary.days.length > 0) {
                            const startDate = activeItinerary.days[0].date;
                            const endDate = activeItinerary.days[activeItinerary.days.length - 1].date;
                            queryParams += `&checkin=${startDate}&checkout=${endDate}`;
                          }
                          
                          queryParams += `&group_adults=${formData.adults}&group_children=${formData.children}`;
                          
                          window.open(`https://www.booking.com/searchresults.html?${queryParams}`, "_blank");
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-500/20 p-3 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                            <Hotel className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2 text-lg">
                              Book Hotels in {formData.destinations[0]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Find top-rated stays on Booking.com
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" className="rounded-full bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">Search Hotels →</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Widget — Real data */}
                <WeatherWidget
                  lat={destCoords.lat}
                  lng={destCoords.lng}
                  location={formData.destinations[0] || "Destination"}
                />
              </div>
            )}

            {activeTab === "packing" && (
              <div className="space-y-6">
                <PackingList aiPackingItems={activeItinerary.packingList} />
              </div>
            )}
          </div>

          {/* Right Column: Map & Recommendations */}
          <div className={cn("space-y-8", mobileViewMode !== "map" && "hidden lg:block")}>
            <div className="lg:sticky lg:top-24 space-y-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <MapLucide className="h-5 w-5 text-primary" />
                  {selectedActivity ? "Place Preview" : "Live Itinerary Map"}
                  {selectedActivity && (
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="ml-auto text-xs font-medium text-primary hover:underline"
                    >
                      ← Back to Map
                    </button>
                  )}
                </h2>
                <div className="h-[calc(100dvh-200px)] lg:h-[400px] w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm relative bg-muted/20" style={{ perspective: "1200px" }}>
                  <AnimatePresence mode="wait">
                    {selectedActivity ? (
                      <ActivityPreviewCard
                        key={`preview-${selectedActivity._id}`}
                        activity={selectedActivity}
                        onClose={() => setSelectedActivity(null)}
                      />
                    ) : (
                      <motion.div
                        key="map"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full w-full"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <LeafletMap
                          center={mapMarkers.length > 0 ? mapMarkers[0].position : destCoords}
                          markers={mapMarkers}
                          activeMarkerId={selectedActivity?._id}
                          showUserLocation={isCompanionMode}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {isCompanionMode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 shadow-sm"
                  >
                    <h3 className="font-bold text-sm text-green-800 dark:text-green-300 flex items-center mb-1">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live Tracking Active
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Your location is now being tracked on the map to help you navigate your itinerary.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Budget Optimizer & Travel Tools */}
              <BudgetOptimizer
                budget={
                  activeItinerary?._tier?.budget ||
                  parseInt(formData.budget) ||
                  120000
                }
                itineraryDays={activeItinerary?.days || []}
                tripSummary={activeItinerary?.tripSummary}
              />

              <TravelTools
                destination={formData.destinations[0] || "Destination"}
              />

              {/* Compact Weather in sidebar */}
              <WeatherWidget
                lat={destCoords.lat}
                lng={destCoords.lng}
                location={formData.destinations[0]}
                compact
              />

              <NearbyPlaces
                center={destCoords}
                locationName={formData.destinations[0] || "Destination"}
              />


            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Sidebar — now with trip context */}
      <AIChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tripContext={{
          destination: formData.destinations[0],
          budget:
            activeItinerary?._tier?.budget ||
            parseInt(formData.budget) ||
            120000,
          currency: "INR",
          days: activeItinerary?.days,
          travelStyle: formData.style,
          transportPreference: formData.transport,
          hotelCategory: formData.hotel,
          foodPreference: "any",
        }}
      />

      {/* Floating AI Chat Button */}
      {!isChatOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Button
            onClick={() => setIsChatOpen(true)}
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-40 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
        </motion.div>
      )}
    </div>
    </>
  );
}
