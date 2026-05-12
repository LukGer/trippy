import { tripSchema } from "@trippy/contracts/trips";
import { protectedProcedure, router } from "../../trpc/trpc";
import { TripsRepo } from "./trips.repo";
import { createTripInputSchema, deleteTripInputSchema } from "./trips.schemas";
import { TripsService } from "./trips.service";

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
		const service = new TripsService(new TripsRepo(ctx.db));

		const userId = ctx.session.user.id;
		if (!userId) return [];

		const rows = await service.listForUser(userId);
		return rows.map(toTripDto);
	}),

	create: protectedProcedure
		.input(createTripInputSchema)
		.mutation(({ ctx, input }) => {
			const service = new TripsService(new TripsRepo(ctx.db));

			return service.createForOwner({
				name: input.name,
				ownerId: ctx.user.id,
				coverImageUrl: input.coverImageUrl?.trim() || null,
				coverPhotographerName: input.coverPhotographerName?.trim() || null,
				coverPhotographerPageUrl: input.coverPhotographerPageUrl?.trim() || null,
			});
		}),

	delete: protectedProcedure
		.input(deleteTripInputSchema)
		.mutation(async ({ ctx, input }) => {
			const service = new TripsService(new TripsRepo(ctx.db));
			return service.deleteForOwner(input.tripId, ctx.user.id);
		}),
});
