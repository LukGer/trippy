import { and, asc, eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { itineraryItems, trips } from "../../db/schema";

export type ItineraryItemInput = {
	title: string;
	kind: string;
	dateLabel: string;
	dayIndexLabel: string;
	locationLabel: string;
	subtitle: string;
	sourceAttachmentId: string;
};

type ItineraryRow = {
	id: string;
	title: string;
	kind: string;
	description: string | null;
	metadata: Record<string, unknown> | null;
	orderIndex: number;
};

export class ItineraryRepo {
	constructor(private readonly db: Db) {}

	/**
	 * Replaces all itinerary items for a trip. Only writes if the trip belongs
	 * to the caller. No-op (and returns false) when the trip is not theirs.
	 */
	public async replaceForOwnedTrip(input: {
		tripId: string;
		ownerId: string;
		items: ItineraryItemInput[];
	}): Promise<boolean> {
		const [trip] = await this.db
			.select({ id: trips.id })
			.from(trips)
			.where(and(eq(trips.id, input.tripId), eq(trips.ownerId, input.ownerId)))
			.limit(1);
		if (!trip) return false;

		await this.db
			.delete(itineraryItems)
			.where(eq(itineraryItems.tripId, input.tripId));

		if (input.items.length === 0) return true;

		const now = new Date();
		await this.db.insert(itineraryItems).values(
			input.items.map((it, i) => ({
				id: crypto.randomUUID(),
				tripId: input.tripId,
				title: it.title,
				kind: it.kind,
				allDay: true,
				status: "planned",
				orderIndex: i,
				description: it.subtitle.length > 0 ? it.subtitle : null,
				metadata: {
					dateLabel: it.dateLabel,
					dayIndexLabel: it.dayIndexLabel,
					locationLabel: it.locationLabel,
					sourceAttachmentId: it.sourceAttachmentId,
				},
				createdAt: now,
				updatedAt: now,
			})),
		);
		return true;
	}

	public async listForOwnedTrip(input: {
		tripId: string;
		ownerId: string;
	}): Promise<ItineraryRow[]> {
		return this.db
			.select({
				id: itineraryItems.id,
				title: itineraryItems.title,
				kind: itineraryItems.kind,
				description: itineraryItems.description,
				metadata: itineraryItems.metadata,
				orderIndex: itineraryItems.orderIndex,
			})
			.from(itineraryItems)
			.innerJoin(trips, eq(itineraryItems.tripId, trips.id))
			.where(
				and(
					eq(itineraryItems.tripId, input.tripId),
					eq(trips.ownerId, input.ownerId),
				),
			)
			.orderBy(asc(itineraryItems.orderIndex));
	}
}
