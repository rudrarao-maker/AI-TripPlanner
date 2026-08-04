import { createClient } from "@/utils/supabase/server";
import { TripPlannerView } from "@/components/trip-planner/TripPlannerView";
import { notFound } from "next/navigation";

export default async function SharedTripPage({
  params,
}: {
  params: { shareId: string };
}) {
  const supabase = createClient();
  const { shareId } = params;

  // Ideally, Trip table has a `shareId` column. 
  // Let's assume shareId matches id for now, or you lookup by shareId.
  const { data: trip, error } = await supabase
    .from("Trip")
    .select(`
      *,
      TripDay (
        *,
        Activity (*)
      )
    `)
    .eq("id", shareId)
    .single();

  if (error || !trip) {
    return notFound();
  }

  // Convert for TripPlannerView
  // In a real scenario, strip out private info like email.
  const formData = {
    destinations: [trip.destination],
    dates: trip.startDate + " to " + trip.endDate,
    budget: trip.budget,
    adults: 2,
    children: 0,
    style: trip.travelStyle
  };

  return (
    <TripPlannerView
      activeItinerary={trip}
      formData={formData}
      itinerary={trip.TripDay}
      plans={[]}
      isShared={true} // new prop indicating this is a public view
    />
  );
}
