import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    avatar: z.string().url().optional()
  })
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(["user", "admin"]).optional(),
    status: z.enum(["active", "restricted"]).optional(),
    clerkId: z.string().optional(),
    password: z.string().optional()
  })
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID")
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    role: z.enum(["user", "admin"]).optional(),
    status: z.enum(["active", "restricted"]).optional(),
  })
});
