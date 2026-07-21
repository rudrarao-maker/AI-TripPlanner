import axios from 'axios';

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
    console.log(`[MockHotel] Searching for hotels in ${params.destination}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        id: 'h1',
        name: `Grand Palace ${params.destination}`,
        provider: 'MockHotels.com',
        rating: 4.8,
        price: 15000,
        currency: 'INR',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        amenities: ['Pool', 'Spa', 'Free WiFi', 'Breakfast'],
        bookingUrl: `https://mockbooking.com/hotel/grand-palace`
      },
      {
        id: 'h2',
        name: `${params.destination} Sea View Resort`,
        provider: 'MockExpedia',
        rating: 4.5,
        price: 12000,
        currency: 'INR',
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        amenities: ['Beachfront', 'Bar', 'Gym'],
        bookingUrl: `https://mockbooking.com/hotel/sea-view`
      }
    ];
  }
}

export class BookingComRapidApiProvider implements HotelProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    if (!this.apiKey) {
      console.warn('[Booking.com] No API key provided, falling back to mock provider');
      return new MockHotelProvider().searchHotels(params);
    }

    try {
      // 1. Get destination ID (mocking this step for brevity in implementation)
      const destId = '12345'; // Ideally we'd call locations/v1/locations/search

      // 2. Search properties
      const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        params: {
          dest_id: destId,
          dest_type: 'city',
          checkin_date: params.checkIn,
          checkout_date: params.checkOut,
          adults_number: params.guests,
          room_number: params.rooms,
          currency: 'INR'
        }
      });

      const results = response.data.result || [];
      return results.slice(0, 10).map((hotel: any) => ({
        id: hotel.hotel_id.toString(),
        name: hotel.hotel_name,
        provider: 'Booking.com',
        rating: hotel.review_score,
        price: hotel.min_total_price,
        currency: hotel.currencycode,
        imageUrl: hotel.max_photo_url,
        amenities: [],
        bookingUrl: hotel.url
      }));

    } catch (error) {
      console.error('[Booking.com] API Error:', error);
      throw new Error('Failed to fetch hotels from Booking.com');
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
