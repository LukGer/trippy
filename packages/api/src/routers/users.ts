import { User } from "@trippy/core/user/user";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const usersRouter = router({
  getByClerkId: procedure
    .input(
      z.object({
        clerkId: z.string(),
      })
    )
    .query(async (opts) => await User.fromClerkId(opts.input.clerkId)),
  getBySearchString: procedure
    .input(
      z.object({
        search: z.string(),
        tripId: z.string(),
      })
    )
    .query(async (opts) => await User.fromSearchString(opts.input)),
  create: procedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        clerkId: z.string(),
        pictureUrl: z.string().nullable(),
      })
    )
    .mutation(async (opts) => await User.create(opts.input)),
});
