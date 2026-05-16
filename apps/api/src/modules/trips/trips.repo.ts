import { and, desc, eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { trips } from "../../db/schema";

export class TripsRepo {
	constructor(private readonly db: Db) {}

	public async listByOwner(ownerId: string) {
		return this.db
			.select()
			.from(trips)
			.where(eq(trips.ownerId, ownerId))
			.orderBy(desc(trips.createdAt));
	}

	public async getByIdForOwner(tripId: string, ownerId: string) {
		const [row] = await this.db
			.select()
			.from(trips)
			.where(and(eq(trips.id, tripId), eq(trips.ownerId, ownerId)))
			.limit(1);
		return row ?? null;
	}

	public async create(input: {
		id: string;
		name: string;
		ownerId: string;
		startsOn: Date;
		endsOn: Date;
		coverImageUrl?: string | null;
		coverPhotographerName?: string | null;
		coverPhotographerPageUrl?: string | null;
	}) {
		const now = new Date();

		await this.db.insert(trips).values({
			id: input.id,
			name: input.name,
			ownerId: input.ownerId,
			coverImageUrl: input.coverImageUrl ?? null,
			coverPhotographerName: input.coverPhotographerName ?? null,
			coverPhotographerPageUrl: input.coverPhotographerPageUrl ?? null,
			startsOn: input.startsOn,
			endsOn: input.endsOn,
			createdAt: now,
			updatedAt: now,
		});

		return {
			id: input.id,
			name: input.name,
			ownerId: input.ownerId,
			coverImageUrl: input.coverImageUrl ?? null,
			coverPhotographerName: input.coverPhotographerName ?? null,
			coverPhotographerPageUrl: input.coverPhotographerPageUrl ?? null,
			startsOn: input.startsOn,
			endsOn: input.endsOn,
			createdAt: now,
			updatedAt: now,
		};
	}

	/** Returns whether a row was deleted (trip existed and belonged to owner). */
	public async deleteByIdForOwner(tripId: string, ownerId: string) {
		const removed = await this.db
			.delete(trips)
			.where(and(eq(trips.id, tripId), eq(trips.ownerId, ownerId)))
			.returning({ id: trips.id });
		return removed.length > 0;
	}
}
