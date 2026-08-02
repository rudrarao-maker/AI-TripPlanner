import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    tripId: z.string().uuid("Invalid trip ID"),
    category: z.string().min(1, "Category is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    currency: z.string().length(3).optional().default("INR"),
    description: z.string().min(1, "Description is required"),
    splitType: z.enum(["equal", "exact", "percentage", "none"]).optional().default("none"),
    splits: z.array(z.object({
      userId: z.string(),
      amount: z.number().positive()
    })).optional()
  })
});
