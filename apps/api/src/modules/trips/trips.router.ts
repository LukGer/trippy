import { tripSchema } from "@trippy/contracts/trips";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "../../trpc/trpc";
import { createTripsRepo } from "./trips.repo";
import { createTripInputSchema } from "./trips.schemas";
import { createTripsService } from "./trips.service";

function toTripDto(row: {
  id: string;
  name: string;
  createdAt: Date;
  startsOn: Date | null;
  endsOn: Date | null;
  description: string | null;
}) {
  return tripSchema.parse({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    startsOn: row.startsOn?.toISOString() ?? null,
    endsOn: row.endsOn?.toISOString() ?? null,
    description: row.description ?? null,
  });
}

export const tripsRouter = router({
  // TODO: restore protectedProcedure when client auth is wired
  list: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) return [];

    const service = createTripsService({
      tripsRepo: createTripsRepo(ctx.db),
    });

    const rows = await service.listForUser(userId);
    return rows.map(toTripDto);
  }),

  create: protectedProcedure
    .input(createTripInputSchema)
    .mutation(({ ctx, input }) => {
      const service = createTripsService({
        tripsRepo: createTripsRepo(ctx.db),
      });

      return service.createForOwner({
        name: input.name,
        ownerId: ctx.user.id,
      });
    }),
});
