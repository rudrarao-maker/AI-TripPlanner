import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Map, CreditCard, Activity, ArrowUpRight, TrendingUp, UtensilsCrossed, Compass, BookOpen, Star, Bot, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { UserManagement } from '@/components/admin/UserManagement';
import { BookingManagement } from '@/components/admin/BookingManagement';
import { AIUsageTracking } from '@/components/admin/AIUsageTracking';
import { CMSManagement } from '@/components/admin/CMSManagement';

type AdminTab = 'overview' | 'users' | 'bookings' | 'destinations' | 'hotels' | 'restaurants' | 'activities' | 'blogs' | 'reviews' | 'ai-usage' | 'cms';

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { id: 'bookings', label: 'Bookings', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'destinations', label: 'Destinations', icon: <Map className="h-4 w-4" /> },
  { id: 'hotels', label: 'Hotels', icon: <Building2 className="h-4 w-4" /> },
  { id: 'restaurants', label: 'Restaurants', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: 'activities', label: 'Activities', icon: <Compass className="h-4 w-4" /> },
  { id: 'blogs', label: 'Blogs', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
  { id: 'ai-usage', label: 'AI Usage', icon: <Bot className="h-4 w-4" /> },
  { id: 'cms', label: 'CMS', icon: <BarChart3 className="h-4 w-4" /> },
];

function AdminPlaceholder({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">{icon} {title} Management</h2>
        <Button variant="gradient" className="rounded-full shadow-lg">+ Add New</Button>
      </div>
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <input placeholder={`Search ${title.toLowerCase()}...`} className="px-4 py-2 rounded-xl bg-muted border border-border/50 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button variant="outline" size="sm" className="rounded-xl">Filter</Button>
            </div>
            <span className="text-sm text-muted-foreground">Showing 1-10 of 124</span>
          </div>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Created</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{title} Item {i}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">Active</span></td>
                    <td className="p-3 text-muted-foreground">Jul {10 + i}, 2026</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <div className="container mx-auto px-4 py-8 mt-20 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground">Manage users, content, analytics, and AI prompt templates.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto hide-scrollbar mb-8 bg-muted/50 p-1.5 rounded-2xl border border-border/30">
        {ADMIN_TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-background shadow-sm text-foreground border border-border/50' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
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
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">U{i}</div>
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

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'bookings' && <BookingManagement />}
      {activeTab === 'ai-usage' && <AIUsageTracking />}
      {activeTab === 'cms' && <CMSManagement />}
      
      {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'bookings' && activeTab !== 'ai-usage' && activeTab !== 'cms' && (
        <AdminPlaceholder title={ADMIN_TABS.find(t => t.id === activeTab)?.label || ''} icon={ADMIN_TABS.find(t => t.id === activeTab)?.icon} />
      )}
    </div>
  );
}
