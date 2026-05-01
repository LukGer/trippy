import { z } from "zod";

export const tripSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  startsOn: z.iso.datetime().nullable(),
  endsOn: z.iso.datetime().nullable(),
  description: z.string().nullable(),
});

export const createTripInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripInputSchema>;
