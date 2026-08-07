"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    country: "",
    state: "",
    city: "",
    description: "",
    status: "active"
  });

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/destinations?search=${searchQuery}`);
      setDestinations(res.data.data.destinations);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDestinations();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("submit");
    try {
      if (formData.id) {
        await api.put(`/admin/destinations/${formData.id}`, formData);
        toast.success("Destination updated");
      } else {
        await api.post("/admin/destinations", formData);
        toast.success("Destination created");
      }
      setIsModalOpen(false);
      fetchDestinations();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/destinations/${id}`);
      setDestinations(destinations.filter(d => d.id !== id));
      toast.success("Destination deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (d: any) => {
    setFormData(d);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setFormData({ id: "", name: "", country: "", state: "", city: "", description: "", status: "active" });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Destinations
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage travel destinations and locations.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Destination
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destinations..."
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
          ) : destinations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No destinations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {destinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {dest.heroImage ? (
                          <img src={dest.heroImage} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        {dest.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{dest.country}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${dest.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                          {dest.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(dest)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(dest.id)}>
                            {actionLoading === dest.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                  <h3 className="text-xl font-bold">{formData.id ? "Edit Destination" : "Add Destination"}</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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
