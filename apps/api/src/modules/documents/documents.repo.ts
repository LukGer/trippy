import { and, eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { documents, trips } from "../../db/schema";

export class DocumentsRepo {
	constructor(private readonly db: Db) {}

	public listForOwnedTrip(input: { tripId: string; ownerId: string }) {
		return this.db
			.select({
				id: documents.id,
				tripId: documents.tripId,
				title: documents.title,
				kind: documents.kind,
				fileKey: documents.fileKey,
				mimeType: documents.mimeType,
				textContent: documents.textContent,
				structuredData: documents.structuredData,
				sensitive: documents.sensitive,
				createdBy: documents.createdBy,
				createdAt: documents.createdAt,
				updatedAt: documents.updatedAt,
			})
			.from(documents)
			.innerJoin(trips, eq(documents.tripId, trips.id))
			.where(
				and(
					eq(documents.tripId, input.tripId),
					eq(trips.ownerId, input.ownerId),
				),
			)
			.orderBy(documents.createdAt);
	}

	public async createForOwnedTrip(input: {
		id: string;
		tripId: string;
		ownerId: string;
		title: string;
		kind: string;
		fileKey?: string;
		mimeType?: string;
		textContent?: string;
		structuredData?: Record<string, unknown>;
		sensitive: boolean;
	}) {
		const [trip] = await this.db
			.select({ id: trips.id })
			.from(trips)
			.where(and(eq(trips.id, input.tripId), eq(trips.ownerId, input.ownerId)))
			.limit(1);

		if (!trip) {
			return null;
		}

		const now = new Date();

		await this.db.insert(documents).values({
			id: input.id,
			tripId: input.tripId,
			title: input.title,
			kind: input.kind,
			fileKey: input.fileKey,
			mimeType: input.mimeType,
			textContent: input.textContent,
			structuredData: input.structuredData,
			sensitive: input.sensitive,
			createdBy: input.ownerId,
			createdAt: now,
			updatedAt: now,
		});

		return {
			id: input.id,
			tripId: input.tripId,
			title: input.title,
			kind: input.kind,
			fileKey: input.fileKey ?? null,
			mimeType: input.mimeType ?? null,
			textContent: input.textContent ?? null,
			structuredData: input.structuredData ?? null,
			sensitive: input.sensitive,
			createdBy: input.ownerId,
			createdAt: now,
			updatedAt: now,
		};
	}
}
