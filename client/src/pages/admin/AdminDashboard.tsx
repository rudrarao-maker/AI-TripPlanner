import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Map, CreditCard, Activity, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings'>('overview');

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">Manage users, view analytics, and track revenue.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            Bookings
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Users className="h-4 w-4" /></div>
                </div>
                <div className="text-3xl font-bold">12,450</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3" /> +12% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Trips Planned</h3>
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Map className="h-4 w-4" /></div>
                </div>
                <div className="text-3xl font-bold">45,120</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3" /> +8% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CreditCard className="h-4 w-4" /></div>
                </div>
                <div className="text-3xl font-bold">{formatCurrency(2450000)}</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3" /> +24% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Active Server Load</h3>
                  <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><Activity className="h-4 w-4" /></div>
                </div>
                <div className="text-3xl font-bold">42%</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                  Stable operation
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5" /> Recent User Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          U{i}
                        </div>
                        <div>
                          <p className="font-medium">User_{i}482</p>
                          <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">2 mins ago</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" /> Pending Partner Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Grand Resort {i}</p>
                          <p className="text-xs text-muted-foreground">Hotel Partner • Goa</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs font-bold text-destructive hover:underline">Reject</button>
                        <button className="text-xs font-bold text-emerald-500 hover:underline">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
          <p>Detailed {activeTab} management panel coming soon in v1.1.</p>
        </div>
      )}
    </div>
  );
}
