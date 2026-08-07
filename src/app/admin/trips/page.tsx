"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  Map,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/trips?search=${searchQuery}`);
      setTrips(res.data.data.trips);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTrips();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      setActionLoading(id);
      await api.delete(`/admin/trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
      toast.success("Trip deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete trip");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" /> Trip Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage user trips and itineraries.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by destination or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/40 border-border/50 rounded-xl h-11"
          />
        </div>
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
          ) : trips.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No trips found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{trip.destination}</td>
                      <td className="px-4 py-3 text-muted-foreground">{trip.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-500">
                        {trip.currency} {Number(trip.budget).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/itinerary-details/${trip.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(trip.id)}
                            disabled={actionLoading === trip.id}
                          >
                            {actionLoading === trip.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
