"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    destinationId: "",
    name: "",
    address: "",
    rating: 5,
    pricePerNight: 0,
    status: "active"
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/hotels?search=${searchQuery}`);
      setHotels(res.data.data.hotels);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchHotels();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("submit");
    try {
      if (formData.id) {
        await api.put(`/admin/hotels/${formData.id}`, formData);
        toast.success("Hotel updated");
      } else {
        await api.post("/admin/hotels", formData);
        toast.success("Hotel created");
      }
      setIsModalOpen(false);
      fetchHotels();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hotel?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/hotels/${id}`);
      setHotels(hotels.filter(h => h.id !== id));
      toast.success("Hotel deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (h: any) => {
    setFormData(h);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setFormData({ id: "", destinationId: "", name: "", address: "", rating: 5, pricePerNight: 0, status: "active" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Hotels
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage hotel partners and inventory.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Hotel
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hotels..."
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
          ) : hotels.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No hotels found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Hotel Name</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Price/Night</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {hotels.map((hotel) => (
                    <tr key={hotel.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{hotel.name}</td>
                      <td className="px-4 py-3 text-emerald-500 font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                        {hotel.rating}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">${hotel.pricePerNight}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${hotel.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {hotel.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(hotel)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(hotel.id)}>
                            {actionLoading === hotel.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl shadow-xl border overflow-hidden"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">{formData.id ? "Edit Hotel" : "Add Hotel"}</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination ID</label>
                    <Input required value={formData.destinationId || ""} onChange={e => setFormData({...formData, destinationId: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hotel Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating (1-5)</label>
                      <Input type="number" min="1" max="5" step="0.1" required value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Per Night</label>
                      <Input type="number" required value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full h-10 px-3 rounded-md border bg-background"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 border-t bg-muted/20 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={actionLoading === "submit"}>
                    {actionLoading === "submit" ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
