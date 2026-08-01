import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

export function AIUsageTracking() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/ai-usage");
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch AI stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  const stats = data
    ? [
        {
          label: "Total API Calls",
          value: data.stats.totalCalls.toLocaleString(),
          change: "+Active",
          icon: <Zap className="h-4 w-4 text-amber-500" />,
        },
        {
          label: "Avg Latency",
          value: `${data.stats.avgLatency}ms`,
          change: "Current",
          icon: <Clock className="h-4 w-4 text-blue-500" />,
        },
        {
          label: "Tokens Used",
          value: data.stats.totalTokens.toLocaleString(),
          change: "+Tracking",
          icon: <Cpu className="h-4 w-4 text-purple-500" />,
        },
        {
          label: "Error Rate",
          value: `${data.stats.errorRate}%`,
          change: "Current",
          icon: <AlertTriangle className="h-4 w-4 text-emerald-500" />,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" /> AI Usage & Performance
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm font-medium">
                    {stat.label}
                  </span>
                  <div className="p-2 bg-background rounded-full shadow-sm">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div
                  className={`text-xs mt-2 flex items-center gap-1 ${stat.label !== "Error Rate" ? "text-amber-500" : "text-emerald-500"}`}
                >
                  <TrendingUp className="h-3 w-3" /> {stat.change}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Recent AI Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentPrompts?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No AI usage recorded yet.
                </p>
              )}
              {data?.recentPrompts?.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/50"
                >
                  <div className="truncate pr-4 flex-1">
                    <p className="text-sm font-medium truncate" title={p.query}>
                      {p.query}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.time).toLocaleString()} • {p.ms}ms response
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${p.status === "Success" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Model Analytics (Gemini 2.5 Flash)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="w-full h-48 flex items-end gap-2 px-4">
              {data?.chartData?.map((h: number, i: number) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-primary/80 to-primary rounded-t-sm"
                  title={`Hour ${i + 1}: ${h} calls`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
