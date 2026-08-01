import { Request, Response } from "express";
import { flightService, FlightSearchQuery } from "../services/flight.service";
import { sendSuccess, sendError } from "../utils/response";

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      travelClass,
    } = req.query;

    if (!origin || !destination || !departureDate) {
      return sendError(
        res,
        400,
        "origin, destination, and departureDate are required",
      );
    }

    const query: FlightSearchQuery = {
      origin: origin as string,
      destination: destination as string,
      departureDate: departureDate as string,
      returnDate: returnDate as string,
      adults: adults ? parseInt(adults as string, 10) : 1,
      travelClass: (travelClass as any) || "ECONOMY",
    };

    const flights = await flightService.searchFlights(query);

    sendSuccess(res, 200, flights, "Flights retrieved successfully");
  } catch (error: any) {
    console.error("Flight search error:", error);
    sendError(res, 500, "Failed to search flights");
  }
};
