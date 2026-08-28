export interface LivePriceResult {
  id: string;
  name: string;
  provider: "Amadeus" | "Skyscanner" | "Booking.com" | "GetYourGuide";
  livePrice: number;
  currency: string;
  availability: "high" | "low" | "sold_out";
  bookingUrl: string;
  timestamp: string;
}

/**
 * Mocks fetching real-time pricing from a GDS (Global Distribution System)
 * like Amadeus, Sabre, or direct providers like Booking.com/Skyscanner.
 * 
 * In a real application, you would replace this with actual HTTP calls 
 * to the Amadeus API or Duffel API.
 */
export async function fetchLivePrice(
  itemName: string,
  category: string,
  location: string,
  date?: string
): Promise<LivePriceResult | null> {
  // Simulate network latency (0.5s - 1.5s)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Determine provider based on category
  let provider: LivePriceResult["provider"] = "GetYourGuide";
  if (category === "hotel") provider = "Booking.com";
  if (category === "flight" || category === "transport") provider = "Skyscanner";

  // Generate a realistic but somewhat random "live" price
  const seed = itemName.length + location.length;
  
  let basePrice = 50;
  if (category === "hotel") basePrice = 4000 + (seed * 150); // INR 4000+
  if (category === "flight" || category === "transport") basePrice = 12000 + (seed * 300); // INR 12000+
  if (category === "food") basePrice = 1500 + (seed * 50); // INR 1500+
  if (category === "sightseeing") basePrice = 800 + (seed * 20); // INR 800+
  
  // Add some realistic fluctuation (-5% to +15%)
  const fluctuation = 1 + ((Math.random() * 0.20) - 0.05);
  const finalPrice = Math.floor(basePrice * fluctuation);

  // Availability logic
  const availabilityRand = Math.random();
  let availability: LivePriceResult["availability"] = "high";
  if (availabilityRand > 0.8) availability = "low";
  if (availabilityRand > 0.95) availability = "sold_out";

  return {
    id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: itemName,
    provider,
    livePrice: finalPrice,
    currency: "INR", 
    availability,
    bookingUrl: "#", 
    timestamp: new Date().toISOString()
  };
}
