"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  Compass,
  Search,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/activities?search=${searchQuery}`);
      setActivities(res.data.data.activities);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchActivities();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity? This affects user itineraries.")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/activities/${id}`);
      setActivities(activities.filter(a => a.id !== id));
      toast.success("Activity deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" /> Activities
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Moderate all activities added to user itineraries.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/40 border-border/50 rounded-xl h-11"
        />
      </div>

      <Card className="glass border-primary/10 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No activities found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Activity Name</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Est. Cost</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{activity.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{activity.location}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">
                          {activity.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-500 font-medium">
                        {activity.currency} {activity.estimatedCost}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(activity.id)}>
                            {actionLoading === activity.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
