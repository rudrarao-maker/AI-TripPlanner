import axios from "axios";

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  provider: string;
  rating: number;
  price: number;
  currency: string;
  imageUrl?: string;
  amenities: string[];
  bookingUrl: string;
}

export interface HotelProvider {
  searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]>;
}

export class MockHotelProvider implements HotelProvider {
  async searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    console.log(
      `[MockHotel] Searching for 200+ hotels in ${params.destination}`,
    );
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const providers = [
      "Agoda",
      "MakeMyTrip",
      "Booking.com",
      "Airbnb",
      "Expedia",
      "Hotels.com",
      "Trip.com",
    ];
    const prefixes = [
      "Grand",
      "Royal",
      "Sunset",
      "Oasis",
      "Crystal",
      "Golden",
      "Emerald",
      "Sapphire",
      "Pearl",
      "Coral",
      "Azure",
      "Paradise",
      "Majestic",
      "Imperial",
      "Regal",
      "Boutique",
    ];
    const suffixes = [
      "Resort & Spa",
      "Palace",
      "Inn",
      "Suites",
      "Hotel",
      "Lodge",
      "Retreat",
      "Hideaway",
      "Villas",
      "Residences",
      "Gardens",
      "Plaza",
      "Towers",
    ];
    const propertyTypes = [
      "Resort",
      "Hotel",
      "Homestay",
      "Hostel",
      "Villa",
      "Apartment",
    ];

    const possibleAmenities = [
      "Pool",
      "Spa",
      "Free WiFi",
      "Breakfast",
      "Gym",
      "Beachfront",
      "Bar",
      "Restaurant",
      "Room Service",
      "Airport Shuttle",
      "Parking",
      "Pet Friendly",
      "AC",
    ];
    const images = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ];

    const results: HotelSearchResult[] = [];
    const count = 200 + Math.floor(Math.random() * 50); // 200 to 250 hotels

    for (let i = 0; i < count; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const propertyType =
        propertyTypes[Math.floor(Math.random() * propertyTypes.length)];

      let name = "";
      if (Math.random() > 0.5) {
        name = `${prefix} ${params.destination || "City"} ${suffix}`;
      } else {
        name = `${params.destination || "City"} ${prefix} ${propertyType}`;
      }

      const rating = 3.0 + Math.random() * 2.0; // 3.0 to 5.0

      // Price logic based on rating and random factor
      let basePrice = 2000 + Math.floor(Math.random() * 5000);
      if (rating > 4.5) basePrice += 10000 + Math.floor(Math.random() * 20000);
      else if (rating > 4.0)
        basePrice += 5000 + Math.floor(Math.random() * 10000);

      const price = basePrice;
      const imageUrl = images[Math.floor(Math.random() * images.length)];

      // Random amenities (3 to 6)
      const shuffledAmenities = [...possibleAmenities].sort(
        () => 0.5 - Math.random(),
      );
      const amenities = shuffledAmenities.slice(
        0,
        3 + Math.floor(Math.random() * 4),
      );

      results.push({
        id: `h${i + 1}-${Date.now()}`,
        name,
        provider,
        rating: Number(rating.toFixed(1)),
        price,
        currency: "INR",
        imageUrl,
        amenities,
        bookingUrl: `https://mockbooking.com/hotel/${i + 1}`,
      });
    }

    // Sort by rating descending
    return results.sort((a, b) => b.rating - a.rating);
  }
}

export class BookingComRapidApiProvider implements HotelProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    if (!this.apiKey) {
      console.warn(
        "[Booking.com] No API key provided, falling back to mock provider",
      );
      return new MockHotelProvider().searchHotels(params);
    }

    try {
      // 1. Get destination ID (mocking this step for brevity in implementation)
      const destId = "12345"; // Ideally we'd call locations/v1/locations/search

      // 2. Search properties
      const response = await axios.get(
        "https://booking-com.p.rapidapi.com/v1/hotels/search",
        {
          headers: {
            "X-RapidAPI-Key": this.apiKey,
            "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
          },
          params: {
            dest_id: destId,
            dest_type: "city",
            checkin_date: params.checkIn,
            checkout_date: params.checkOut,
            adults_number: params.guests,
            room_number: params.rooms,
            currency: "INR",
          },
        },
      );

      const results = response.data.result || [];
      return results.slice(0, 10).map((hotel: any) => ({
        id: hotel.hotel_id.toString(),
        name: hotel.hotel_name,
        provider: "Booking.com",
        rating: hotel.review_score,
        price: hotel.min_total_price,
        currency: hotel.currencycode,
        imageUrl: hotel.max_photo_url,
        amenities: [],
        bookingUrl: hotel.url,
      }));
    } catch (error) {
      console.error("[Booking.com] API Error:", error);
      throw new Error("Failed to fetch hotels from Booking.com");
    }
  }
}

// Factory to get the active provider
export class HotelService {
  private provider: HotelProvider;

  constructor() {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    // For development, if no key, we gracefully degrade to mock
    if (rapidApiKey) {
      this.provider = new BookingComRapidApiProvider(rapidApiKey);
    } else {
      this.provider = new MockHotelProvider();
    }
  }

  async search(params: HotelSearchParams) {
    return this.provider.searchHotels(params);
  }
}

export const hotelService = new HotelService();
