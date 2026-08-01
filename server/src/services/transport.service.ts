import { v4 as uuidv4 } from "uuid";

export interface TransportSearchQuery {
  origin: string;
  destination: string;
  date: string;
  type: "train" | "bus" | "cab";
}

export interface TransportOffer {
  id: string;
  provider: string; // 'IRCTC', 'RedBus', 'Uber', etc.
  vehicleType: string; // 'Sleeper 3A', 'Volvo A/C', 'Uber Go'
  origin: string;
  destination: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  price: number;
  currency: string;
  bookingUrl: string;
}

export class TransportService {
  async search(query: TransportSearchQuery): Promise<TransportOffer[]> {
    console.log(
      `[TransportService] Searching ${query.type} from ${query.origin} to ${query.destination}`,
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const offers: TransportOffer[] = [];

    if (query.type === "train") {
      offers.push({
        id: uuidv4(),
        provider: "IRCTC",
        vehicleType: "3A AC Tier",
        origin: query.origin,
        destination: query.destination,
        departureTime: `${query.date}T18:30:00Z`,
        arrivalTime: `${query.date}T06:15:00Z`,
        duration: "11h 45m",
        price: 1850,
        currency: "INR",
        bookingUrl: "https://www.irctc.co.in/nget/train-search",
      });
      offers.push({
        id: uuidv4(),
        provider: "RailYatri",
        vehicleType: "Sleeper Class",
        origin: query.origin,
        destination: query.destination,
        departureTime: `${query.date}T22:00:00Z`,
        arrivalTime: `${query.date}T11:30:00Z`,
        duration: "13h 30m",
        price: 650,
        currency: "INR",
        bookingUrl: "https://www.railyatri.in/",
      });
    } else if (query.type === "bus") {
      offers.push({
        id: uuidv4(),
        provider: "RedBus",
        vehicleType: "Volvo Multi-Axle A/C Semi Sleeper",
        origin: query.origin,
        destination: query.destination,
        departureTime: `${query.date}T21:30:00Z`,
        arrivalTime: `${query.date}T07:00:00Z`,
        duration: "9h 30m",
        price: 1200,
        currency: "INR",
        bookingUrl: "https://www.redbus.in/",
      });
      offers.push({
        id: uuidv4(),
        provider: "AbhiBus",
        vehicleType: "Non A/C Seater",
        origin: query.origin,
        destination: query.destination,
        departureTime: `${query.date}T08:00:00Z`,
        arrivalTime: `${query.date}T19:00:00Z`,
        duration: "11h 00m",
        price: 500,
        currency: "INR",
        bookingUrl: "https://www.abhibus.com/",
      });
    } else if (query.type === "cab") {
      offers.push({
        id: uuidv4(),
        provider: "Uber",
        vehicleType: "UberGo",
        origin: query.origin,
        destination: query.destination,
        duration: "1h 15m (est)",
        price: 850,
        currency: "INR",
        bookingUrl: "https://m.uber.com/looking",
      });
      offers.push({
        id: uuidv4(),
        provider: "Ola",
        vehicleType: "Ola Mini",
        origin: query.origin,
        destination: query.destination,
        duration: "1h 20m (est)",
        price: 780,
        currency: "INR",
        bookingUrl: "https://book.olacabs.com/",
      });
    }

    return offers.sort((a, b) => a.price - b.price);
  }
}

export const transportService = new TransportService();
