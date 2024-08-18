import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { users } from "./db/schema";
import { procedure, router } from "./trpc";

export const appRouter = router({
  user: {
    getCurrentUser: procedure
      .input(
        z.object({
          googleId: z.string(),
        })
      )
      .query(async (opts) => {
        return {
          user: await db.query.users.findFirst({
            where: eq(users.googleId, opts.input.googleId),
          }),
        };
      }),
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;
