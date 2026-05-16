import type { ItineraryPlan } from "@trippy/core/itinerary";
import { itineraryItemTypeSchema } from "@trippy/core/itinerary";
import { TRPCError } from "@trpc/server";
import type { ItineraryRepo } from "./itinerary.repo";

type TripItineraryDay = {
	dateLabel: string;
	dayIndexLabel: string;
	locationLabel: string;
	items: Array<{
		type: string;
		title: string;
		subtitle: string;
	}>;
};

export class ItineraryService {
	constructor(private readonly itineraryRepo: ItineraryRepo) {}

	/** Flattens AI day/item structure into ordered rows, then hands to the repo. */
	public async replaceForOwnedTrip(input: {
		tripId: string;
		ownerId: string;
		plan: ItineraryPlan;
	}) {
		const flat = input.plan.days.flatMap((day) =>
			day.items.map((it) => ({
				title: it.title,
				kind: it.type,
				subtitle: it.subtitle,
				sourceAttachmentId: it.sourceAttachmentId,
				dateLabel: day.dateLabel,
				dayIndexLabel: day.dayIndexLabel,
				locationLabel: day.locationLabel,
			})),
		);
		const ok = await this.itineraryRepo.replaceForOwnedTrip({
			tripId: input.tripId,
			ownerId: input.ownerId,
			items: flat,
		});
		if (!ok) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Trip not found or you do not have access.",
			});
		}
	}

	/** Reads stored rows and re-groups them by their stored dayIndexLabel. */
	public async listGroupedForOwnedTrip(input: {
		tripId: string;
		ownerId: string;
	}): Promise<TripItineraryDay[]> {
		const rows = await this.itineraryRepo.listForOwnedTrip({
			tripId: input.tripId,
			ownerId: input.ownerId,
		});
		const byDay = new Map<string, TripItineraryDay>();
		for (const row of rows) {
			const meta = (row.metadata ?? {}) as {
				dateLabel?: string;
				dayIndexLabel?: string;
				locationLabel?: string;
			};
			const key = meta.dayIndexLabel ?? meta.dateLabel ?? "";
			let day = byDay.get(key);
			if (!day) {
				day = {
					dateLabel: meta.dateLabel ?? "",
					dayIndexLabel: meta.dayIndexLabel ?? "",
					locationLabel: meta.locationLabel ?? "",
					items: [],
				};
				byDay.set(key, day);
			}
			const parsedType = itineraryItemTypeSchema.safeParse(row.kind);
			day.items.push({
				type: parsedType.success ? parsedType.data : "Other",
				title: row.title,
				subtitle: row.description ?? "",
			});
		}
		return Array.from(byDay.values());
	}
}
