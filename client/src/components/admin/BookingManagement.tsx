import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "@/lib/api";

interface Booking {
  id: string;
  type: string;
  status: string;
  totalAmount: number;
  currency: string;
  bookingRef: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  trip?: {
    title: string;
    destination: string;
  };
}

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/admin/all");
      setBookings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-4 h-4 text-blue-500" />;
      case "hotel":
        return <Building className="w-4 h-4 text-emerald-500" />;
      default:
        return <Calendar className="w-4 h-4 text-orange-500" />;
    }
  };

  if (loading)
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading bookings...
      </div>
    );
  if (error)
    return <div className="text-center p-8 text-destructive">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Booking Management
          </h2>
          <p className="text-muted-foreground text-sm">
            View all platform bookings and transactions.
          </p>
        </div>
      </div>

      <Card className="glass border-primary/20">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium tracking-wider text-xs">
                      {booking.bookingRef}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {booking.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {booking.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getIcon(booking.type)}
                        <span className="capitalize">{booking.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {booking.currency} {booking.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-500 flex items-center w-fit gap-1.5"
                            : "bg-orange-500/20 text-orange-500 flex items-center w-fit gap-1.5"
                        }`}
                      >
                        {booking.status === "confirmed" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                No bookings found on the platform.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
