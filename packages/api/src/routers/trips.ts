import { Trip } from "@trippy/core/trip/trip";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const tripsRouter = router({
  create: procedure
    .input(
      z.object({
        name: z.string(),
        imageUrl: z.string().nullable(),
        startDate: z.date(),
        endDate: z.date(),
        memberIds: z.array(z.string()),
      })
    )
    .mutation(async (opts) => await Trip.create(opts.input)),
  update: procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        imageUrl: z.optional(z.string()),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async (opts) => await Trip.update(opts.input)),
  getById: procedure.input(z.string()).query(async (opts) => {
    const trip = await Trip.fromId(opts.input);

    if (!trip) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Trip not found" });
    }

    return trip;
  }),
  getTripsByUserId: procedure
    .input(z.string())
    .query(async (opts) => await Trip.fromMemberId(opts.input)),

  addMember: procedure
    .input(
      z.object({
        tripId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async (opts) => await Trip.addMember(opts.input)),

  removeMember: procedure
    .input(
      z.object({
        tripId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async (opts) => await Trip.removeMember(opts.input)),
});
