"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

  return (
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
                {itinerary?.id && (
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => window.location.href = `/checkout/${itinerary.id}`}
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
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            </div>

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
                        </div>
                        <div className="p-0">
                          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider font-bold text-muted-foreground">
                            <div className="col-span-3">Time</div>
                            <div className="col-span-6">Activity</div>
                            <div className="col-span-3 text-right">Cost</div>
                          </div>
                          <div className="divide-y divide-border/50">
                            {day.activities?.length > 0 ? (
                              day.activities.map((act: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 px-8 py-5 items-start hover:bg-muted/10 transition-colors group">
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
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                        <Bot className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
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
                {/* Transport Comparison */}
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plane className="h-5 w-5 text-primary" /> Transport
                      Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center bg-primary/5 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/20 p-2 rounded-lg text-primary">
                            <Plane className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2">
                              AirAsia{" "}
                              <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Fastest
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              2h 30m • Direct
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹12,500</p>
                          <span className="text-xs text-primary font-medium hover:underline">
                            Select
                          </span>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="bg-accent/10 p-2 rounded-lg text-accent">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="4"
                                y="3"
                                width="16"
                                height="16"
                                rx="2"
                              />
                              <path d="M4 11h16" />
                              <path d="M12 3v8" />
                              <path d="m8 19-2 3" />
                              <path d="m16 19 2 3" />
                              <path d="M2 9h2" />
                              <path d="M20 9h2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold">Express Railway</p>
                            <p className="text-sm text-muted-foreground">
                              8h 45m • Scenic Route
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹4,200</p>
                          <span className="text-xs text-muted-foreground font-medium hover:underline">
                            View
                          </span>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                              <circle cx="7" cy="17" r="2" />
                              <path d="M9 17h6" />
                              <circle cx="17" cy="17" r="2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2">
                              Sleeper Coach{" "}
                              <span className="text-[10px] bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Cheapest
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              14h 00m • Overnight
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹2,800</p>
                          <span className="text-xs text-muted-foreground font-medium hover:underline">
                            View
                          </span>
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
                <PackingList />
              </div>
            )}
          </div>

          {/* Right Column: Map & Recommendations */}
          <div className="space-y-8">
            <div className="sticky top-24 space-y-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <MapLucide className="h-5 w-5 text-primary" /> Interactive 3D Globe
                </h2>
                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-border/50 shadow-sm relative">
                  <GlobeMap destination={{ ...destCoords, name: itinerary?.destination || searchParams.get("dest") || "Destination" }} />
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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> AI Picks
                  </h2>
                  <div className="flex bg-muted p-1 rounded-lg">
                    <button
                      onClick={() => setRecTab("transport")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === "transport" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      Transport
                    </button>
                    <button
                      onClick={() => setRecTab("hotels")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === "hotels" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      Hotels
                    </button>
                    <button
                      onClick={() => setRecTab("restaurants")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === "restaurants" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      Food
                    </button>
                    <button
                      onClick={() => setRecTab("attractions")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${recTab === "attractions" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                    >
                      Places
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {recTab === "transport" &&
                    transportOptions.map((transport: any) => (
                      <TransportCard
                        key={transport.id}
                        transport={transport}
                      />
                    ))}
                  {recTab === "hotels" &&
                    hotels.map((hotel: any) => (
                      <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                  {recTab === "restaurants" &&
                    restaurants.map((restaurant: any) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                      />
                    ))}
                  {recTab === "attractions" &&
                    attractions.map((attraction: any) => (
                      <AttractionCard
                        key={attraction.id}
                        activity={attraction}
                      />
                    ))}
                </div>
              </div>
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
  );
}
