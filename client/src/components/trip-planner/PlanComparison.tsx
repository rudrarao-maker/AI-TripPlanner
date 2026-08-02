import { motion } from "framer-motion";
import { Sparkles, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlanComparison({
  plans,
  formData,
  setSelectedPlanIndex,
  setItinerary,
  setPlans,
  setStep,
}: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> AI Generated Plans
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Choose Your Plan for {formData.destinations[0] || "Your Trip"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We crafted 3 unique itineraries tailored to your preferences.
            Compare prices, stays, and activities below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any, idx: number) => {
            const tier = plan._tier;
            const totalHotelCost =
              plan.days?.reduce((sum: number, d: any) => {
                const hotel =
                  typeof d.hotel === "string" ? JSON.parse(d.hotel) : d.hotel;
                return sum + (hotel?.pricePerNight || 0);
              }, 0) || 0;
            const totalActivityCost =
              plan.days?.reduce((sum: number, d: any) => {
                const m =
                  typeof d.morning === "string"
                    ? JSON.parse(d.morning)
                    : d.morning;
                const a =
                  typeof d.afternoon === "string"
                    ? JSON.parse(d.afternoon)
                    : d.afternoon;
                const e =
                  typeof d.evening === "string"
                    ? JSON.parse(d.evening)
                    : d.evening;
                return sum + (m?.cost || 0) + (a?.cost || 0) + (e?.cost || 0);
              }, 0) || 0;
            const isRecommended = idx === 1;
            const hotelName = plan.days?.[0]
              ? typeof plan.days[0].hotel === "string"
                ? JSON.parse(plan.days[0].hotel)?.name
                : plan.days[0].hotel?.name
              : "Hotel";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group ${
                    isRecommended
                      ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                  onClick={() => {
                    setSelectedPlanIndex(idx);
                    setItinerary(plan);
                  }}
                >
                  {isRecommended && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1.5 uppercase tracking-wider">
                      ⭐ Recommended
                    </div>
                  )}
                  <CardContent
                    className={`p-6 space-y-5 ${isRecommended ? "pt-10" : ""}`}
                  >
                    <div className="text-center">
                      <span className="text-4xl">
                        {tier.label.split(" ")[0]}
                      </span>
                      <h3 className="text-xl font-bold mt-2">
                        {tier.label.split(" ").slice(1).join(" ")}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full mt-2 inline-block ${
                          idx === 0
                            ? "bg-green-500/10 text-green-600"
                            : idx === 1
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-purple-500/10 text-purple-600"
                        }`}
                      >
                        {tier.tag}
                      </span>
                    </div>

                    <div className="text-center border-t border-b border-border/50 py-4">
                      <p className="text-3xl font-extrabold">
                        ₹{tier.budget.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Budget
                      </p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">🏨 Stay</span>
                        <span className="font-medium">{hotelName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          🛏️ Hotel Cost
                        </span>
                        <span className="font-medium">
                          ₹{totalHotelCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          🎯 Activities
                        </span>
                        <span className="font-medium">
                          ₹{totalActivityCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">📅 Days</span>
                        <span className="font-medium">
                          {plan.days?.length || 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={isRecommended ? "gradient" : "outline"}
                      className="w-full gap-2 group-hover:shadow-lg transition-shadow"
                    >
                      View Full Itinerary <Navigation className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setPlans([]);
              setStep(3);
            }}
            className="text-muted-foreground"
          >
            ← Back to form
          </Button>
        </div>
      </div>
    </div>
  );
}
