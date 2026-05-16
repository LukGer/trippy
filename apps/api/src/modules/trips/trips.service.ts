import { canManageTrip } from "@trippy/core";
import type { ItineraryPlan } from "@trippy/core/itinerary";
import { TRPCError } from "@trpc/server";
import type { ItineraryService } from "../itinerary/itinerary.service";
import type { TripsRepo } from "./trips.repo";

export class TripsService {
	constructor(
		private readonly tripsRepo: TripsRepo,
		private readonly itineraryService: ItineraryService,
	) {}

	public async listForUser(userId: string) {
		return this.tripsRepo.listByOwner(userId);
	}

	public async getByIdForOwner(tripId: string, ownerId: string) {
		const trip = await this.tripsRepo.getByIdForOwner(tripId, ownerId);
		if (!trip) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Trip not found or you do not have access.",
			});
		}
		const itinerary = await this.itineraryService.listGroupedForOwnedTrip({
			tripId,
			ownerId,
		});
		return { trip, itinerary };
	}

	public async createForOwner(input: {
		name: string;
		ownerId: string;
		startsOn: Date;
		endsOn: Date;
		coverImageUrl?: string | null;
		coverPhotographerName?: string | null;
		coverPhotographerPageUrl?: string | null;
		itineraryPlan?: ItineraryPlan;
	}) {
		if (!canManageTrip("owner")) {
			throw new Error("Owner role must be allowed to manage trips.");
		}

		const trip = await this.tripsRepo.create({
			id: crypto.randomUUID(),
			name: input.name,
			ownerId: input.ownerId,
			coverImageUrl: input.coverImageUrl ?? null,
			coverPhotographerName: input.coverPhotographerName ?? null,
			coverPhotographerPageUrl: input.coverPhotographerPageUrl ?? null,
			startsOn: input.startsOn,
			endsOn: input.endsOn,
		});

		if (input.itineraryPlan && input.itineraryPlan.days.length > 0) {
			await this.itineraryService.replaceForOwnedTrip({
				tripId: trip.id,
				ownerId: input.ownerId,
				plan: input.itineraryPlan,
			});
		}

		return trip;
	}

	public async deleteForOwner(tripId: string, ownerId: string) {
		if (!canManageTrip("owner")) {
			throw new Error("Owner role must be allowed to manage trips.");
		}

		const deleted = await this.tripsRepo.deleteByIdForOwner(tripId, ownerId);
		if (!deleted) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Trip not found or you do not have access.",
			});
		}
		return { ok: true as const };
	}
}
