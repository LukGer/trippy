import { protectedProcedure, router } from "../../trpc/trpc";
import { createTripsRepo } from "./trips.repo";
import { createTripInputSchema } from "./trips.schemas";
import { createTripsService } from "./trips.service";

export const tripsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    const service = createTripsService({
      tripsRepo: createTripsRepo(ctx.db),
    });

    return service.listForUser(ctx.user.id);
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
