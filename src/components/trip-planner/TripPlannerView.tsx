"use client";
import { useState, useMemo } from "react";
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
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { NearbyPlaces } from "@/components/map/NearbyPlaces";
import { ExpenseTracker } from "@/components/itinerary/ExpenseTracker";
import { LiveCursors } from "@/components/itinerary/LiveCursors";
import { ActivityPreviewCard } from "@/components/trip-planner/ActivityPreviewCard";
import { findDestinationInfo } from "@/lib/destinationData";
import { useRegenerateDay } from "@/hooks/useTrips";
import { toast } from "react-hot-toast";

export function TripPlannerView({
  activeItinerary,
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
  handleShare,
  handleDownloadPdf,
  isChatOpen,
  setIsChatOpen,
  setActiveItemHover,
  searchParams
}: any) {
  const [activeTab, setActiveTab] = useState<"itinerary" | "logistics" | "packing" | "expenses">("itinerary");
  const [recTab, setRecTab] = useState<"hotels" | "restaurants" | "attractions" | "transport">("hotels");
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(activeItinerary.isPublic || false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
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

  // Extract map markers from the itinerary
  const mapMarkers = activeItinerary?.days?.flatMap((day: any) => 
    day.activities?.filter((act: any) => act.coordinates?.lat && act.coordinates?.lng).map((act: any) => ({
      id: `${day.dayNumber}-${act.name}`,
      position: { lat: act.coordinates.lat, lng: act.coordinates.lng },
      title: act.name,
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
        className="container mx-auto px-4 -mt-10 relative z-30"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Itinerary & Logistics */}
          <div className="lg:col-span-2 space-y-6">
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
                  onClick={handleShare}
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
                                  <div className="col-span-3 font-semibold text-sm text-primary/80 mt-1">{act.time}</div>
                                  <div className="col-span-6">
                                    <div className="font-bold text-base text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                      <span className="text-lg bg-background shadow-sm h-8 w-8 rounded-lg flex items-center justify-center border border-border/50">
                                        {act.category === "hotel" ? "🏨" : act.category === "food" ? "🍽️" : act.category === "transport" ? "🚕" : act.category === "shopping" ? "🛍️" : act.category === "other" ? "✨" : "📍"}
                                      </span>
                                      {act.name}
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground/80 mt-2 flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5 text-primary/60" /> {act.location}
                                    </div>
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
                  
                  {/* Budget Summary Card */}
                  {activeItinerary?.days?.length > 0 && (
                    <div className="mt-12 bg-gradient-to-br from-card to-muted/20 rounded-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 max-w-xl mx-auto relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      <h3 className="text-2xl font-extrabold mb-8 text-center flex items-center justify-center gap-3">
                        <span className="bg-background shadow-sm p-2 rounded-xl border border-border/50">💰</span> Trip Budget Summary
                      </h3>
                      <div className="space-y-4 mb-4 relative z-10">
                        {(() => {
                          const totals = { flights: Number(activeItinerary.flightsCost) || 0, hotel: 0, food: 0, transport: 0, sightseeing: 0, shopping: 0, other: 0, total: 0 };
                          totals.total += totals.flights;
                          
                          activeItinerary.days.forEach((d: any) => {
                            d.activities?.forEach((act: any) => {
                              const cost = Number(act.estimatedCost) || 0;
                              totals.total += cost;
                              if (act.category === "hotel") totals.hotel += cost;
                              else if (act.category === "food") totals.food += cost;
                              else if (act.category === "transport") totals.transport += cost;
                              else if (act.category === "shopping") totals.shopping += cost;
                              else if (act.category === "other") totals.other += cost;
                              else totals.sightseeing += cost;
                            });
                          });
                          
                          return (
                            <>
                              {totals.flights > 0 && (
                                <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                  <span className="flex items-center gap-2 font-medium"><span className="text-xl">✈️</span> Flights</span> 
                                  <span className="font-bold text-foreground">₹{totals.flights.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">🏨</span> Hotel</span> 
                                <span className="font-bold text-foreground">₹{totals.hotel.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">🍽️</span> Food</span> 
                                <span className="font-bold text-foreground">₹{totals.food.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">🚕</span> Transportation</span> 
                                <span className="font-bold text-foreground">₹{totals.transport.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">📍</span> Activities</span> 
                                <span className="font-bold text-foreground">₹{totals.sightseeing.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">🛍️</span> Shopping</span> 
                                <span className="font-bold text-foreground">₹{totals.shopping.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border/30">
                                <span className="flex items-center gap-2 font-medium"><span className="text-xl">✨</span> Miscellaneous</span> 
                                <span className="font-bold text-foreground">₹{totals.other.toLocaleString()}</span>
                              </div>
                              
                              <div className="pt-6 border-t border-border mt-6 flex justify-between items-end">
                                <div>
                                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Estimated Total</div>
                                </div>
                                <span className="font-black text-4xl text-primary drop-shadow-sm">₹{totals.total.toLocaleString()}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
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
                {/* Transport Booking Widget */}
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="h-5 w-5 text-primary" /> Book Flights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      <div 
                        className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer group"
                        onClick={() => {
                          const origin = formData.departureCity || "Any";
                          const dest = activeItinerary.destination || formData.destinations[0];
                          
                          // Skyscanner uses YYMMDD format
                          let dateParams = "";
                          if (activeItinerary.days && activeItinerary.days.length > 0) {
                            const startDate = new Date(activeItinerary.days[0].date);
                            const endDate = new Date(activeItinerary.days[activeItinerary.days.length - 1].date);
                            
                            const formatSSDate = (d: Date) => {
                              const yy = String(d.getFullYear()).slice(2);
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              const dd = String(d.getDate()).padStart(2, '0');
                              return `${yy}${mm}${dd}`;
                            };
                            
                            dateParams = `/${formatSSDate(startDate)}/${formatSSDate(endDate)}`;
                          }
                          
                          window.open(`https://www.skyscanner.com/transport/flights/${origin}/${dest}${dateParams}`, "_blank");
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/20 p-3 rounded-xl text-primary group-hover:scale-110 transition-transform">
                            <Plane className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2 text-lg">
                              Search Flights to {formData.destinations[0]}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Find the cheapest flights on Skyscanner
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="gradient" className="rounded-full shadow-lg">Search Flights →</Button>
                        </div>
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
          <div className="space-y-8">
            <div className="sticky top-24 space-y-8">
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
                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm relative bg-muted/20" style={{ perspective: "1200px" }}>
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
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Budget Optimizer & Travel Tools */}
              <BudgetOptimizer
                budget={
                  activeItinerary?._tier?.budget ||
                  parseInt(formData.budget) ||
                  120000
                }
                itineraryDays={activeItinerary?.days || []}
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
