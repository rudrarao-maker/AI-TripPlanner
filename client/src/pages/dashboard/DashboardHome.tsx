import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useClerk } from "@clerk/clerk-react";
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
import { MonthlySpendingChart } from "@/components/dashboard/MonthlySpendingChart";
import { TrendingDestinations } from "@/components/dashboard/TrendingDestinations";

export function DashboardHome() {
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
          <Link to="/plan">
            <Plus className="h-5 w-5" /> Plan New Trip
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Upcoming Trip */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" /> Upcoming Trip
              </h2>
              {upcomingTrip && (
                <Button variant="ghost" className="text-primary" asChild>
                  <Link to={`/dashboard/trips/${upcomingTrip.id}`}>
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>

            {upcomingTrip ? (
              <Card className="overflow-hidden border-none shadow-lg group">
                <div
                  className="relative h-64 w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                  style={{
                    backgroundImage: `url(${upcomingTrip.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 z-10" />
                  <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />{" "}
                    {Math.ceil(
                      (new Date(upcomingTrip.startDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 3600 * 24),
                    )}{" "}
                    days left
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-2 text-white/90 font-medium mb-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span>{upcomingTrip.destination}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">
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

                <CardContent className="p-6 bg-card">
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
                </CardContent>
              </Card>
            ) : (
              <Card className="glass py-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl mb-4">
                  🌍
                </div>
                <h3 className="text-xl font-bold mb-2">No trips planned yet</h3>
                <p className="text-muted-foreground mb-6">
                  Let our AI craft the perfect itinerary for your next vacation.
                </p>
                <Button variant="gradient" asChild>
                  <Link to="/plan">Start Planning</Link>
                </Button>
              </Card>
            )}

            {/* Added Monthly Spending Chart */}
            <MonthlySpendingChart />

            {/* Added Trending Destinations */}
            <TrendingDestinations />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                asChild
              >
                <Link to="/expenses">
                  <Receipt className="h-5 w-5 text-primary" />
                  <span>Expenses</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                asChild
              >
                <Link to="/bookings">
                  <Ticket className="h-5 w-5 text-accent" />
                  <span>Bookings</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 lg:col-span-1 col-span-2"
                asChild
              >
                <Link to="/security">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Security</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 lg:col-span-3 col-span-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </CardContent>
          </Card>

          {/* Past Trips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Past Trips</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {pastTrips.length === 0 ? (
                <div className="text-sm text-center text-muted-foreground py-4">
                  No past trips found.
                </div>
              ) : (
                pastTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        🌍
                      </div>
                      <div>
                        <p className="font-medium">{trip.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(trip.startDate)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
