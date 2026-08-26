"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Map,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  ChevronRight,
  Plus,
  Receipt,
  Ticket,
  Loader2,
  Shield,
  LogOut,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useGetTrips } from "@/hooks/useTrips";
import dynamic from "next/dynamic";

// New Components
import { TiltCard } from "@/components/ui/tilt-card";
import { SavedTrips } from "@/components/dashboard/SavedTrips";
import { RecentSearches } from "@/components/dashboard/RecentSearches";
import { AISuggestions } from "@/components/dashboard/AISuggestions";
import { LocalDiscoveries } from "@/components/dashboard/LocalDiscoveries";

const MonthlySpendingChart = dynamic(() => import("@/components/dashboard/MonthlySpendingChart").then((mod) => mod.MonthlySpendingChart), { ssr: false, loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" /> });

export default function DashboardHome() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: trips, isLoading } = useGetTrips();

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingTrip = trips && trips.length > 0 ? trips[0] : null;
  const pastTrips = trips && trips.length > 1 ? trips.slice(1) : [];

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user?.firstName || "Traveler"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready for your next adventure?
          </p>
        </div>
        <Button
          variant="gradient"
          size="lg"
          className="gap-2 shadow-xl shadow-primary/20"
          asChild
        >
          <Link href="/trip-planner">
            <Plus className="h-5 w-5" /> Create New Trip
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Upcoming Trip & Main Features */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" /> Upcoming Trip
              </h2>
              {upcomingTrip && (
                <Button variant="ghost" className="text-primary" asChild>
                  <Link href={`/itinerary-details/${upcomingTrip.id}`}>
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>

            {upcomingTrip ? (
              <TiltCard className="shadow-lg mb-8" maxTilt={3}>
                <div
                  className="relative h-64 w-full bg-gradient-to-br from-primary/20 to-accent/20"
                  style={{
                    backgroundImage: `url(${upcomingTrip.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/50 z-10" />
                  <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium text-sm flex items-center gap-1.5" style={{ transform: "translateZ(30px)" }}>
                    <Clock className="h-4 w-4" />{" "}
                    {Math.ceil(
                      (new Date(upcomingTrip.startDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 3600 * 24),
                    )}{" "}
                    days left
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20" style={{ transform: "translateZ(40px)" }}>
                    <div className="flex items-center gap-2 text-white/90 font-medium mb-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span>{upcomingTrip.destination}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                      {upcomingTrip.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(upcomingTrip.startDate)} -{" "}
                        {formatDate(upcomingTrip.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-card border-x border-b border-border rounded-b-2xl" style={{ transform: "translateZ(20px)" }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" /> Budget
                        Status
                      </p>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl font-bold text-foreground">
                          {formatCurrency(0)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of {formatCurrency(upcomingTrip.budget)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `0%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border flex flex-col justify-center items-center text-center cursor-pointer hover:bg-muted transition-colors">
                      <span className="text-xl mb-1">🏨</span>
                      <span className="text-sm font-medium">View Hotel</span>
                    </div>
                    <div className="p-4 rounded-xl border flex flex-col justify-center items-center text-center cursor-pointer hover:bg-muted transition-colors">
                      <span className="text-xl mb-1">✈️</span>
                      <span className="text-sm font-medium">View Flight</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ) : (
              <Card className="glass py-12 flex flex-col items-center justify-center text-center border-white/10">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">
                  🌍
                </div>
                <h3 className="text-xl font-bold mb-2">No trips planned yet</h3>
                <p className="text-muted-foreground mb-6">
                  Let our AI craft the perfect itinerary for your next vacation.
                </p>
                <Button variant="gradient" asChild>
                  <Link href="/trip-planner">Create New Trip</Link>
                </Button>
              </Card>
            )}

            <AISuggestions />
            
            <LocalDiscoveries />
            
            <div className="mt-8">
              <MonthlySpendingChart />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-white/10 hover:bg-white/5"
                asChild
              >
                <Link href="/expenses">
                  <Receipt className="h-5 w-5 text-primary" />
                  <span>Expenses</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-white/10 hover:bg-white/5"
                asChild
              >
                <Link href="/bookings">
                  <Ticket className="h-5 w-5 text-accent" />
                  <span>Bookings</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 lg:col-span-1 col-span-2 border-white/10 hover:bg-white/5"
                asChild
              >
                <Link href="/security">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Security</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 lg:col-span-3 col-span-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-white/10"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </CardContent>
          </Card>

          <RecentSearches />

          {/* Previous Trips */}
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Previous Trips</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {pastTrips.length === 0 ? (
                <div className="text-sm text-center text-muted-foreground py-4">
                  No previous trips found.
                </div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="space-y-2"
                >
                  {pastTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { ease: [0.16, 1, 0.3, 1] } }
                      }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          🌍
                        </div>
                        <div>
                          <p className="font-medium text-sm">{trip.destination}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(trip.startDate)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <SavedTrips />
        </div>
      </div>
    </div>
  );
}
