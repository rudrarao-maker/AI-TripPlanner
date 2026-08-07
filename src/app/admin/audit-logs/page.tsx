"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  User,
  Activity
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/audit-logs?search=${searchQuery}`);
      setLogs(res.data.data.logs);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" /> Audit Logs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            System security and admin activity logs.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by action or details..."
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
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No audit logs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Admin User</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Target Type</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {log.admin?.name || log.adminId || "System"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">
                        {log.targetType}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate" title={log.details}>
                        {log.details || "-"}
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
