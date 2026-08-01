"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightService = exports.SkyScannerRapidApiProvider = exports.MockFlightProvider = void 0;
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
// ==========================================
// MOCK PROVIDER
// ==========================================
class MockFlightProvider {
    async searchFlights(query) {
        console.log(`[MockFlightProvider] Searching flights: ${query.origin} -> ${query.destination} on ${query.departureDate}`);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const airlines = [
            "AirAsia",
            "IndiGo",
            "Air India",
            "Vistara",
            "Emirates",
            "Qatar Airways",
        ];
        const aggregators = [
            "MakeMyTrip",
            "Cleartrip",
            "Skyscanner",
            "Yatra",
            "Goibibo",
        ];
        const mockFlights = [];
        const count = Math.floor(Math.random() * 5) + 3; // 3 to 7 flights
        const depDate = new Date(query.departureDate);
        for (let i = 0; i < count; i++) {
            const depHour = Math.floor(Math.random() * 24);
            const depMinute = Math.floor(Math.random() * 60);
            const durationHours = Math.floor(Math.random() * 12) + 1; // 1 to 13 hours
            const durationMinutes = Math.floor(Math.random() * 60);
            const flightDepDate = new Date(depDate);
            flightDepDate.setHours(depHour, depMinute);
            const flightArrDate = new Date(flightDepDate);
            flightArrDate.setHours(depHour + durationHours, depMinute + durationMinutes);
            const price = Math.floor(Math.random() * 30000) + 5000;
            const airline = airlines[Math.floor(Math.random() * airlines.length)];
            const aggregator = aggregators[Math.floor(Math.random() * aggregators.length)];
            mockFlights.push({
                id: (0, uuid_1.v4)(),
                provider: aggregator,
                airline: airline,
                flightNumber: `${airline.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`,
                origin: query.origin,
                destination: query.destination,
                departureTime: flightDepDate.toISOString(),
                arrivalTime: flightArrDate.toISOString(),
                duration: `${durationHours}h ${durationMinutes}m`,
                price: query.travelClass === "BUSINESS" ? price * 3 : price,
                currency: "INR",
                class: query.travelClass || "ECONOMY",
                stops: Math.floor(Math.random() * 3),
            });
        }
        return mockFlights.sort((a, b) => a.price - b.price);
    }
}
exports.MockFlightProvider = MockFlightProvider;
// ==========================================
// SKYSCANNER PROVIDER (RapidAPI)
// ==========================================
class SkyScannerRapidApiProvider {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async searchFlights(query) {
        if (!this.apiKey) {
            console.warn("[SkyScanner] API Key not found, falling back to mock");
            return new MockFlightProvider().searchFlights(query);
        }
        try {
            const response = await axios_1.default.get("https://skyscanner44.p.rapidapi.com/search", {
                headers: {
                    "X-RapidAPI-Key": this.apiKey,
                    "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com",
                },
                params: {
                    origin: query.origin,
                    destination: query.destination,
                    departureDate: query.departureDate,
                    adults: query.adults || 1,
                    cabinClass: (query.travelClass || "economy").toLowerCase(),
                },
            });
            // Map real Skyscanner response to our FlightOffer interface
            const itineraries = response.data?.itineraries?.buckets?.[0]?.items || [];
            if (itineraries.length === 0) {
                return new MockFlightProvider().searchFlights(query);
            }
            return itineraries.map((item) => {
                const leg = item.legs[0];
                return {
                    id: item.id || (0, uuid_1.v4)(),
                    provider: "Skyscanner",
                    airline: leg.carriers.marketing[0].name,
                    flightNumber: leg.segments[0].flightNumber,
                    origin: leg.origin.displayCode,
                    destination: leg.destination.displayCode,
                    departureTime: leg.departure,
                    arrivalTime: leg.arrival,
                    duration: `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m`,
                    price: item.price.raw,
                    currency: "INR",
                    class: query.travelClass || "ECONOMY",
                    stops: leg.stopCount,
                };
            });
        }
        catch (error) {
            console.error("[SkyScanner] API Error:", error);
            console.warn("Falling back to mock provider due to API error");
            return new MockFlightProvider().searchFlights(query);
        }
    }
}
exports.SkyScannerRapidApiProvider = SkyScannerRapidApiProvider;
// ==========================================
// EXPORTED SERVICE
// ==========================================
class FlightService {
    provider;
    constructor() {
        // Choose provider based on env
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        if (rapidApiKey) {
            this.provider = new SkyScannerRapidApiProvider(rapidApiKey);
        }
        else {
            this.provider = new MockFlightProvider();
        }
    }
    async searchFlights(query) {
        return this.provider.searchFlights(query);
    }
}
exports.flightService = new FlightService();
