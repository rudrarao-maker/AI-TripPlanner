import { NextResponse } from "next/server";

// In a real application, this would call Duffel, Amadeus, Skyscanner, or Google Flights APIs.
// For now, we mock realistic flight data based on the request.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, date, passengers } = body;

    // Simulate network delay for API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response data
    const mockFlights = [
      {
        id: "fl-101",
        airline: "SkyJet Airways",
        flightNumber: "SJ-405",
        departure: {
          airport: origin || "JFK",
          time: "08:30 AM",
        },
        arrival: {
          airport: destination || "LHR",
          time: "08:45 PM",
        },
        duration: "7h 15m",
        stops: "Non-stop",
        price: 450,
        currency: "USD",
        bookingUrl: "https://example.com/book/fl-101",
      },
      {
        id: "fl-202",
        airline: "Global Connect",
        flightNumber: "GC-882",
        departure: {
          airport: origin || "JFK",
          time: "02:15 PM",
        },
        arrival: {
          airport: destination || "LHR",
          time: "05:00 AM", // Next day
        },
        duration: "9h 45m",
        stops: "1 Stop (CDG)",
        price: 320,
        currency: "USD",
        bookingUrl: "https://example.com/book/fl-202",
      },
      {
        id: "fl-303",
        airline: "Premium Air",
        flightNumber: "PA-111",
        departure: {
          airport: origin || "JFK",
          time: "10:00 PM",
        },
        arrival: {
          airport: destination || "LHR",
          time: "10:30 AM",
        },
        duration: "7h 30m",
        stops: "Non-stop",
        price: 680,
        currency: "USD",
        bookingUrl: "https://example.com/book/fl-303",
      }
    ];

    return NextResponse.json({
      success: true,
      flights: mockFlights,
    });
  } catch (error) {
    console.error("Flight Search Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch flights" }, { status: 500 });
  }
}
