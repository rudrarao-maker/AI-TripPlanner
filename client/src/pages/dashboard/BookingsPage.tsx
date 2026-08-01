import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Building, Ticket, ExternalLink, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import api from "@/lib/api";

export function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-6 w-6 text-blue-500" />;
      case "hotel":
        return <Building className="h-6 w-6 text-green-500" />;
      default:
        return <Ticket className="h-6 w-6 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs font-bold uppercase">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-xs font-bold uppercase">
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-xs font-bold uppercase">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your synced reservations across flights, hotels, and
            transport.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Sync
        </button>
      </div>

      <div className="grid gap-4 mt-8">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-background rounded-2xl shadow-sm border border-border/50">
                      {getIcon(booking.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold uppercase text-xs text-muted-foreground">
                          {booking.provider}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>

                      {booking.type === "flight" && booking.flightDetails && (
                        <h3 className="text-lg font-bold">
                          {booking.flightDetails.origin} →{" "}
                          {booking.flightDetails.destination}
                        </h3>
                      )}

                      {booking.type === "hotel" && booking.hotelDetails && (
                        <h3 className="text-lg font-bold">
                          {booking.hotelDetails.hotelName}
                        </h3>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          Ref:{" "}
                          <strong className="text-foreground">
                            {booking.bookingRef}
                          </strong>
                        </span>
                        {booking.flightDetails && (
                          <span>
                            Date:{" "}
                            {new Date(
                              booking.flightDetails.departureTime,
                            ).toLocaleDateString()}
                          </span>
                        )}
                        {booking.hotelDetails && (
                          <span>
                            Check In:{" "}
                            {new Date(
                              booking.hotelDetails.checkIn,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </p>
                    <button className="flex items-center justify-end gap-1 mt-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                      View Receipt <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {bookings.length === 0 && !loading && (
          <div className="text-center py-24 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No active bookings found.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-24 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 opacity-50 animate-spin" />
            <p>Loading your bookings...</p>
          </div>
        )}
      </div>
    </div>
  );
}
