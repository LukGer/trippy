import { z } from "zod";

export const itineraryItemTypeSchema = z
	.enum(["Flight", "Transit", "Stay", "Activity", "Meal", "Other"])
	.describe(
		"Timeline row category shown as an uppercase caption in the UI (use Title Case in JSON).",
	);

export const itineraryItemSchema = z.object({
	type: itineraryItemTypeSchema,
	title: z
		.string()
		.describe(
			'Primary headline: e.g. flight route "FRA → HND", transit line, or "Check-in · Hotel Name".',
		),
	subtitle: z
		.string()
		.describe(
			"Supporting detail; separate segments with middot (·). No markdown or bold markers.",
		),
	sourceAttachmentId: z
		.string()
		.describe(
			"When this row is grounded in an uploaded file, set to that file's attachmentId from the prompt; otherwise empty string.",
		),
});

export const itineraryDaySchema = z.object({
	dateLabel: z
		.string()
		.describe('Calendar header text, e.g. "Mon, Apr 14".'),
	locationLabel: z
		.string()
		.describe(
			'Main place that day (city/region), e.g. "Tokyo"; use empty string if unknown.',
		),
	dayIndexLabel: z.string().describe('Sequential badge, e.g. "DAY 01".'),
	items: z
		.array(itineraryItemSchema)
		.describe("Ordered activities for this calendar day."),
});

export const itineraryPlanSchema = z.object({
	generatedTripTitle: z
		.string()
		.describe(
			"Polished trip title synthesized from the user's working title and notes (~≤80 chars).",
		),
	startsOnIso: z
		.string()
		.describe(
			'Trip start as an ISO calendar date in YYYY-MM-DD form, matching the first day in `days`. Required — never empty.',
		),
	endsOnIso: z
		.string()
		.describe(
			'Trip end as an ISO calendar date in YYYY-MM-DD form, matching the last day in `days`. Use the same value as startsOnIso for single-day trips. Required — never empty.',
		),
	days: z.array(itineraryDaySchema).describe("Chronological trip days."),
	tips: z
		.string()
		.describe(
			"Brief practical tips (packing, transit passes, etc.); use empty string if none. Required for structured output.",
		),
});

export type ItineraryItemType = z.infer<typeof itineraryItemTypeSchema>;
export type ItineraryItem = z.infer<typeof itineraryItemSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;

/** Set by the API after generation (Unsplash); not produced by the LLM schema. */
export type ItineraryPlanCoverMeta = {
	coverImageUrl?: string;
	coverPhotographerName?: string;
	coverPhotographerPageUrl?: string;
};

export type ItineraryPlanWithCover = ItineraryPlan & ItineraryPlanCoverMeta;
