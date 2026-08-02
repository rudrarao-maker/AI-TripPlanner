import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Map,
  CreditCard,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UtensilsCrossed,
  Compass,
  BookOpen,
  Star,
  Bot,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Bell
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { UserManagement } from "@/components/admin/UserManagement";
import { BookingManagement } from "@/components/admin/BookingManagement";
import { AIUsageTracking } from "@/components/admin/AIUsageTracking";
import { CMSManagement } from "@/components/admin/CMSManagement";
import { motion, AnimatePresence } from "framer-motion";

type AdminTab =
  | "overview"
  | "users"
  | "bookings"
  | "destinations"
  | "hotels"
  | "restaurants"
  | "activities"
  | "blogs"
  | "reviews"
  | "ai-usage"
  | "cms";

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "users", label: "Users", icon: <Users className="h-5 w-5" /> },
  { id: "bookings", label: "Bookings", icon: <CreditCard className="h-5 w-5" /> },
  { id: "destinations", label: "Destinations", icon: <Map className="h-5 w-5" /> },
  { id: "hotels", label: "Hotels", icon: <Building2 className="h-5 w-5" /> },
  { id: "restaurants", label: "Restaurants", icon: <UtensilsCrossed className="h-5 w-5" /> },
  { id: "activities", label: "Activities", icon: <Compass className="h-5 w-5" /> },
  { id: "blogs", label: "Blogs", icon: <BookOpen className="h-5 w-5" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="h-5 w-5" /> },
  { id: "ai-usage", label: "AI Tracking", icon: <Bot className="h-5 w-5" /> },
  { id: "cms", label: "Content DB", icon: <BarChart3 className="h-5 w-5" /> },
];

function AdminPlaceholder({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">{title}</h2>
          <p className="text-muted-foreground">Manage and monitor {title.toLowerCase()} across the platform.</p>
        </div>
        <Button variant="default" className="rounded-full shadow-lg h-10 px-6">
          + Add New
        </Button>
      </div>
      
      <Card className="glass border-white/5 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex gap-3">
              <input
                placeholder={`Search ${title.toLowerCase()}...`}
                className="px-4 py-2.5 rounded-full bg-background/50 border border-border/50 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              <Button variant="outline" className="rounded-full h-10">
                Filter
              </Button>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Showing 1-5 of 124
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Created</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr
                    key={i}
                    className="border-b border-border/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {icon}
                      </div>
                      {title} Item {i}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      Jul {10 + i}, 2026
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="rounded-full h-8 px-3">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 fixed inset-y-0 left-0 z-50 flex flex-col glass border-r border-white/5 backdrop-blur-2xl bg-background/60 pt-20">
        <div className="p-6 pt-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Admin Portal</h2>
              <p className="text-xs text-muted-foreground">v2.0.1 Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
            <LogOut className="h-5 w-5" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 pt-20 min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-20 z-40">
          <div className="text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 border-2 border-background shadow-md"></div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
                  <p className="text-muted-foreground">Real-time metrics and system health monitoring.</p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="glass border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Users className="w-24 h-24" />
                      </div>
                      <div className="flex flex-col h-full relative z-10">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Total Users</h3>
                        <div className="text-4xl font-bold mb-2">12,450</div>
                        <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                          <ArrowUpRight className="h-4 w-4" /> +12% this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Map className="w-24 h-24" />
                      </div>
                      <div className="flex flex-col h-full relative z-10">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Trips Planned</h3>
                        <div className="text-4xl font-bold mb-2">45,120</div>
                        <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                          <ArrowUpRight className="h-4 w-4" /> +8% this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <CreditCard className="w-24 h-24" />
                      </div>
                      <div className="flex flex-col h-full relative z-10">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Total Revenue</h3>
                        <div className="text-4xl font-bold mb-2">{formatCurrency(2450000)}</div>
                        <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                          <ArrowUpRight className="h-4 w-4" /> +24% this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Activity className="w-24 h-24" />
                      </div>
                      <div className="flex flex-col h-full relative z-10">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Server Load</h3>
                        <div className="text-4xl font-bold mb-2 text-primary">42%</div>
                        <div className="text-sm font-medium text-primary flex items-center gap-1 mt-auto">
                          <Activity className="h-4 w-4" /> Optimal Operation
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="glass border-white/5 shadow-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Recent Signups
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold shadow-inner">
                                U{i}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">User_{i}482</p>
                                <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                              {i * 2} mins ago
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-white/5 shadow-xl">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-accent" /> Pending Partners
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">Grand Resort {i}</p>
                                <p className="text-xs text-muted-foreground">Hotel Partner • Goa</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10">
                                Reject
                              </Button>
                              <Button variant="default" size="sm" className="h-8 text-xs font-medium rounded-full px-4 shadow-md">
                                Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "users" && <motion.div key="users" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><UserManagement /></motion.div>}
            {activeTab === "bookings" && <motion.div key="bookings" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><BookingManagement /></motion.div>}
            {activeTab === "ai-usage" && <motion.div key="ai" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><AIUsageTracking /></motion.div>}
            {activeTab === "cms" && <motion.div key="cms" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><CMSManagement /></motion.div>}

            {activeTab !== "overview" &&
             activeTab !== "users" &&
             activeTab !== "bookings" &&
             activeTab !== "ai-usage" &&
             activeTab !== "cms" && (
                <AdminPlaceholder
                  key={activeTab}
                  title={ADMIN_TABS.find((t) => t.id === activeTab)?.label || ""}
                  icon={ADMIN_TABS.find((t) => t.id === activeTab)?.icon}
                />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
