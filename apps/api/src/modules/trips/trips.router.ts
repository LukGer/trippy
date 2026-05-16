import { tripDetailSchema, tripSchema } from "@trippy/core/trips";
import { protectedProcedure, router } from "../../trpc/trpc";
import {
	createTripInputSchema,
	deleteTripInputSchema,
	getTripByIdInputSchema,
} from "./trips.schemas";

function toTripDto(row: {
	id: string;
	name: string;
	createdAt: Date;
	startsOn: Date | null;
	endsOn: Date | null;
	description: string | null;
	coverImageUrl: string | null;
	coverPhotographerName: string | null;
	coverPhotographerPageUrl: string | null;
}) {
	return tripSchema.parse({
		id: row.id,
		name: row.name,
		createdAt: row.createdAt.toISOString(),
		startsOn: row.startsOn?.toISOString() ?? null,
		endsOn: row.endsOn?.toISOString() ?? null,
		description: row.description ?? null,
		coverImageUrl: row.coverImageUrl ?? null,
		coverPhotographerName: row.coverPhotographerName ?? null,
		coverPhotographerPageUrl: row.coverPhotographerPageUrl ?? null,
	});
}

export const tripsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) return [];

		const rows = await ctx.services.trips.listForUser(userId);
		return rows.map(toTripDto);
	}),

	getById: protectedProcedure
		.input(getTripByIdInputSchema)
		.query(async ({ ctx, input }) => {
			const { trip, itinerary } = await ctx.services.trips.getByIdForOwner(
				input.tripId,
				ctx.user.id,
			);
			return tripDetailSchema.parse({
				...toTripDto(trip),
				itinerary,
			});
		}),

	create: protectedProcedure
		.input(createTripInputSchema)
		.mutation(({ ctx, input }) => {
			return ctx.services.trips.createForOwner({
				name: input.name,
				ownerId: ctx.user.id,
				startsOn: new Date(`${input.startsOnIso}T00:00:00.000Z`),
				endsOn: new Date(`${input.endsOnIso}T00:00:00.000Z`),
				coverImageUrl: input.coverImageUrl?.trim() || null,
				coverPhotographerName: input.coverPhotographerName?.trim() || null,
				coverPhotographerPageUrl:
					input.coverPhotographerPageUrl?.trim() || null,
				itineraryPlan: input.itineraryPlan,
			});
		}),

	delete: protectedProcedure
		.input(deleteTripInputSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.services.trips.deleteForOwner(input.tripId, ctx.user.id);
		}),
});
