import { z } from "zod";
import { itineraryItemTypeSchema, itineraryPlanSchema } from "./itinerary";

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

export const tripItineraryItemSchema = z.object({
  type: itineraryItemTypeSchema,
  title: z.string(),
  subtitle: z.string(),
});

export const tripItineraryDaySchema = z.object({
  dateLabel: z.string(),
  dayIndexLabel: z.string(),
  locationLabel: z.string(),
  items: z.array(tripItineraryItemSchema),
});

export const tripDetailSchema = tripSchema.extend({
  itinerary: z.array(tripItineraryDaySchema),
});

const optionalCoverUrl = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .transform((s) => (s && s.length > 0 ? s : undefined));

const isoCalendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a YYYY-MM-DD calendar date.");

export const createTripInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  startsOnIso: isoCalendarDate,
  endsOnIso: isoCalendarDate,
  coverImageUrl: optionalCoverUrl,
  coverPhotographerName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((s) => (s && s.length > 0 ? s : undefined)),
  coverPhotographerPageUrl: optionalCoverUrl,
  itineraryPlan: itineraryPlanSchema.optional(),
});

export const deleteTripInputSchema = z.object({
	tripId: z.string().min(1),
});

export const getTripByIdInputSchema = z.object({
  tripId: z.string().min(1),
});

export type Trip = z.infer<typeof tripSchema>;
export type TripItineraryItem = z.infer<typeof tripItineraryItemSchema>;
export type TripItineraryDay = z.infer<typeof tripItineraryDaySchema>;
export type TripDetail = z.infer<typeof tripDetailSchema>;
export type CreateTripInput = z.infer<typeof createTripInputSchema>;
export type DeleteTripInput = z.infer<typeof deleteTripInputSchema>;
export type GetTripByIdInput = z.infer<typeof getTripByIdInputSchema>;
