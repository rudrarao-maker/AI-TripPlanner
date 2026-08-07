import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TripPlannerView } from "@/components/trip-planner/TripPlannerView";
import { notFound } from "next/navigation";

export default async function SharedTripPage(
  props: {
    params: Promise<{ shareId: string }>;
  }
) {
  const params = await props.params;
  const { shareId } = params;

  // Ideally, Trip table has a `shareId` column. 
  // Let's assume shareId matches id for now, or you lookup by shareId.
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, shareId),
    with: {
      tripDays: {
        with: {
          activities: true
        }
      }
    }
  });

  if (!trip) {
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
      activeItinerary={trip as any}
      formData={formData}
      itinerary={trip.tripDays as any}
      plans={[]}
      isShared={true} // new prop indicating this is a public view
    />
  );
}
