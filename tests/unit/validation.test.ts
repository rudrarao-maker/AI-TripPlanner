import { validateInput, TripSaveSchema, TripGenerateSchema, AIChatSchema, BookingSchema, NewsletterSchema, AdminUserUpdateSchema } from "@/lib/validation";

describe("Validation Schemas", () => {
  // ─── AIChatSchema ─────────────────────────────────────────────────
  describe("AIChatSchema", () => {
    it("accepts a valid prompt", () => {
      const result = validateInput(AIChatSchema, { prompt: "What are the best places to visit in Paris?" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.prompt).toBe("What are the best places to visit in Paris?");
    });

    it("rejects an empty prompt", () => {
      const result = validateInput(AIChatSchema, { prompt: "" });
      expect(result.success).toBe(false);
    });

    it("rejects a prompt over 5000 chars", () => {
      const result = validateInput(AIChatSchema, { prompt: "x".repeat(5001) });
      expect(result.success).toBe(false);
    });

    it("rejects missing prompt field", () => {
      const result = validateInput(AIChatSchema, {});
      expect(result.success).toBe(false);
    });
  });

  // ─── TripGenerateSchema ────────────────────────────────────────────
  describe("TripGenerateSchema", () => {
    const validPayload = {
      origin: "New York",
      destination: "Paris",
      startDate: "2026-12-01",
      endDate: "2026-12-10",
      budget: 5000,
    };

    it("accepts a valid generation request", () => {
      const result = validateInput(TripGenerateSchema, validPayload);
      expect(result.success).toBe(true);
    });

    it("accepts budget as a string (coerced to number)", () => {
      const result = validateInput(TripGenerateSchema, { ...validPayload, budget: "3000" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.budget).toBe(3000);
    });

    it("rejects missing origin", () => {
      const { origin, ...noOrigin } = validPayload;
      const result = validateInput(TripGenerateSchema, noOrigin);
      expect(result.success).toBe(false);
    });

    it("rejects missing destination", () => {
      const { destination, ...noDest } = validPayload;
      const result = validateInput(TripGenerateSchema, noDest);
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = validateInput(TripGenerateSchema, { ...validPayload, startDate: "not-a-date" });
      expect(result.success).toBe(false);
    });

    it("accepts optional budgetTier enum values", () => {
      const result = validateInput(TripGenerateSchema, { ...validPayload, budgetTier: "luxury" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid budgetTier", () => {
      const result = validateInput(TripGenerateSchema, { ...validPayload, budgetTier: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  // ─── TripSaveSchema ────────────────────────────────────────────────
  describe("TripSaveSchema", () => {
    const validSavePayload = {
      tripData: {
        title: "Summer in Paris",
        startDate: "2026-07-01",
        endDate: "2026-07-10",
        budget: 5000,
        days: [
          {
            dayNumber: 1,
            activities: [
              { name: "Visit Eiffel Tower", location: "Champ de Mars", category: "sightseeing" },
            ],
          },
        ],
      },
    };

    it("accepts a valid save payload", () => {
      const result = validateInput(TripSaveSchema, validSavePayload);
      expect(result.success).toBe(true);
    });

    it("rejects missing title", () => {
      const payload = { ...validSavePayload, tripData: { ...validSavePayload.tripData, title: "" } };
      const result = validateInput(TripSaveSchema, payload);
      expect(result.success).toBe(false);
    });

    it("rejects empty days array", () => {
      const payload = { ...validSavePayload, tripData: { ...validSavePayload.tripData, days: [] } };
      const result = validateInput(TripSaveSchema, payload);
      expect(result.success).toBe(false);
    });

    it("rejects more than 60 days", () => {
      const days = Array.from({ length: 61 }, (_, i) => ({ dayNumber: i + 1 }));
      const payload = { ...validSavePayload, tripData: { ...validSavePayload.tripData, days } };
      const result = validateInput(TripSaveSchema, payload);
      expect(result.success).toBe(false);
    });

    it("rejects negative budget", () => {
      const payload = { ...validSavePayload, tripData: { ...validSavePayload.tripData, budget: -100 } };
      const result = validateInput(TripSaveSchema, payload);
      expect(result.success).toBe(false);
    });
  });

  // ─── BookingSchema ─────────────────────────────────────────────────
  describe("BookingSchema", () => {
    const validBooking = {
      tripId: "123e4567-e89b-12d3-a456-426614174000",
      type: "flight" as const,
      amount: 450.50,
    };

    it("accepts a valid booking", () => {
      const result = validateInput(BookingSchema, validBooking);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID for tripId", () => {
      const result = validateInput(BookingSchema, { ...validBooking, tripId: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid booking type", () => {
      const result = validateInput(BookingSchema, { ...validBooking, type: "spaceship" });
      expect(result.success).toBe(false);
    });

    it("rejects zero or negative amount", () => {
      const result = validateInput(BookingSchema, { ...validBooking, amount: 0 });
      expect(result.success).toBe(false);
    });

    it("defaults currency to INR", () => {
      const result = validateInput(BookingSchema, validBooking);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.currency).toBe("INR");
    });
  });

  // ─── NewsletterSchema ──────────────────────────────────────────────
  describe("NewsletterSchema", () => {
    it("accepts a valid email", () => {
      const result = validateInput(NewsletterSchema, { email: "user@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = validateInput(NewsletterSchema, { email: "not-an-email" });
      expect(result.success).toBe(false);
    });

    it("rejects empty email", () => {
      const result = validateInput(NewsletterSchema, { email: "" });
      expect(result.success).toBe(false);
    });
  });

  // ─── AdminUserUpdateSchema ─────────────────────────────────────────
  describe("AdminUserUpdateSchema", () => {
    it("accepts valid partial updates", () => {
      const result = validateInput(AdminUserUpdateSchema, { name: "John Doe" });
      expect(result.success).toBe(true);
    });

    it("accepts valid role enum", () => {
      const result = validateInput(AdminUserUpdateSchema, { role: "admin" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid role", () => {
      const result = validateInput(AdminUserUpdateSchema, { role: "superuser" });
      expect(result.success).toBe(false);
    });

    it("accepts empty object (all fields optional)", () => {
      const result = validateInput(AdminUserUpdateSchema, {});
      expect(result.success).toBe(true);
    });
  });
});
