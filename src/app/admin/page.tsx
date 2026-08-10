"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import {
  Users,
  Map,
  CreditCard,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Building2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminDashboardOverview() {
  const [overviewData, setOverviewData] = useState<{
    stats: {
      totalUsers: number;
      totalTrips: number;
      totalRevenue: number;
      serverLoad: number;
    };
    recentSignups: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get("/admin/overview");
      setOverviewData(res.data.data);
      setLoading(false);
      
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load overview data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Overview</h1>
        <p className="text-muted-foreground">Real-time metrics and system health monitoring.</p>
      </div>
      
      {loading && !overviewData ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
          <Button size="sm" variant="outline" className="ml-auto" onClick={fetchOverview}>Retry</Button>
        </div>
      ) : overviewData && (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Users className="w-24 h-24" />
              </div>
              <div className="flex flex-col h-full relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Total Users</h3>
                <div className="text-4xl font-bold mb-2">{overviewData.stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                  <ArrowUpRight className="h-4 w-4" /> Live
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
                <div className="text-4xl font-bold mb-2">{overviewData.stats.totalTrips.toLocaleString()}</div>
                <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                  <ArrowUpRight className="h-4 w-4" /> Live
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
                <div className="text-4xl font-bold mb-2">{formatCurrency(overviewData.stats.totalRevenue)}</div>
                <div className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-auto">
                  <ArrowUpRight className="h-4 w-4" /> Live
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
                <div className="text-4xl font-bold mb-2 text-primary">{overviewData.stats.serverLoad}%</div>
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
                {overviewData.recentSignups.length > 0 ? overviewData.recentSignups.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold shadow-inner overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt="avatar" /> : user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No recent signups</div>
                )}
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
        </>
      )}
    </motion.div>
  );
}
