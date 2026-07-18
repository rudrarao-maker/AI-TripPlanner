import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Map, MapPin, Calendar, Clock, CreditCard, ChevronRight, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock Data
const UPCOMING_TRIP = {
  id: 't1',
  destination: 'Bali, Indonesia',
  startDate: '2026-08-01T00:00:00Z',
  endDate: '2026-08-07T00:00:00Z',
  image: '/destinations/bali.jpg',
  budget: 120000,
  spent: 45000,
  daysLeft: 14
};

const PAST_TRIPS = [
  { id: 't2', destination: 'Goa, India', date: 'Dec 2025' },
  { id: 't3', destination: 'Dubai, UAE', date: 'Oct 2025' },
];

export function DashboardHome() {
  const { user } = useAuthStore();
  
  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Traveler'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Ready for your next adventure?</p>
        </div>
        <Button variant="gradient" size="lg" className="gap-2 shadow-xl shadow-primary/20" asChild>
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
              <Button variant="ghost" className="text-primary" asChild>
                <Link to={`/dashboard/trips/${UPCOMING_TRIP.id}`}>View Details <ChevronRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            
            <Card className="overflow-hidden border-none shadow-lg group">
              <div className="relative h-64 w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium text-sm flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {UPCOMING_TRIP.daysLeft} days left
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex items-center gap-2 text-white/90 font-medium mb-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>{UPCOMING_TRIP.destination}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Summer Getaway to Bali</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(UPCOMING_TRIP.startDate)} - {formatDate(UPCOMING_TRIP.endDate)}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 bg-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Budget Status
                    </p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-bold text-foreground">{formatCurrency(UPCOMING_TRIP.spent)}</span>
                      <span className="text-sm text-muted-foreground">of {formatCurrency(UPCOMING_TRIP.budget)}</span>
                    </div>
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(UPCOMING_TRIP.spent / UPCOMING_TRIP.budget) * 100}%` }} />
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
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link to="/expenses">
                  <Receipt className="h-5 w-5 text-primary" />
                  <span>Add Expense</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
                <Link to="/dashboard/bookings">
                  <Ticket className="h-5 w-5 text-accent" />
                  <span>Bookings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Past Trips */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Past Trips</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {PAST_TRIPS.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      🌍
                    </div>
                    <div>
                      <p className="font-medium">{trip.destination}</p>
                      <p className="text-xs text-muted-foreground">{trip.date}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Need to import these icons that weren't in the main import block
import { Receipt, Ticket } from 'lucide-react';
