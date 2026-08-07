"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/payments?search=${searchQuery}`);
      setPayments(res.data.data.payments);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" /> Payments
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor transactions and payment statuses.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by transaction ID..."
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
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No payments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {payment.stripeTransactionId || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{payment.user?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{payment.user?.email || ""}</div>
                      </td>
                      <td className="px-4 py-3 text-emerald-500 font-medium flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        ${payment.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${payment.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {payment.status === 'succeeded' && <CheckCircle className="h-3 w-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.receiptUrl ? (
                          <Link href={payment.receiptUrl} target="_blank">
                            <Button variant="ghost" size="sm" className="h-8">
                              <ExternalLink className="h-4 w-4 mr-2" /> View
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
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
