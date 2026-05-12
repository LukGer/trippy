import { z } from "zod";

export const tripSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  startsOn: z.iso.datetime().nullable(),
  endsOn: z.iso.datetime().nullable(),
  description: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  coverPhotographerName: z.string().nullable(),
  coverPhotographerPageUrl: z.string().nullable(),
});

const optionalCoverUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined));

export const createTripInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  coverImageUrl: optionalCoverUrl,
  coverPhotographerName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  coverPhotographerPageUrl: optionalCoverUrl,
});

export const deleteTripInputSchema = z.object({
	tripId: z.string().min(1),
});

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripInputSchema>;
export type DeleteTripInput = z.infer<typeof deleteTripInputSchema>;
