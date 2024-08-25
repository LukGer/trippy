import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { trips, tripsToUsers, users } from "./db/schema";
import { procedure, router } from "./trpc";

export const appRouter = router({
  user: {
    getByClerkId: procedure
      .input(
        z.object({
          clerkId: z.string(),
        })
      )
      .query(async (opts) => {
        return {
          user: await db.query.users.findFirst({
            where: eq(users.clerkId, opts.input.clerkId),
          }),
        };
      }),
    addUser: procedure
      .input(
        z.object({
          email: z.string(),
          name: z.string(),
          clerkId: z.string(),
          pictureUrl: z.string(),
        })
      )
      .mutation(async (opts) => {
        await db.insert(users).values({
          email: opts.input.email,
          name: opts.input.name,
          clerkId: opts.input.clerkId,
          pictureUrl: opts.input.pictureUrl,
        });
      }),
  },
  trips: {
    getById: procedure.input(z.string()).query(async (opts) => {
      const trip = await db.query.trips.findFirst({
        where: eq(trips.id, opts.input),
        with: {
          tripsToUsers: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      return {
        trip,
      };
    }),

    getTripsByUserId: procedure
      .input(
        z.object({
          userId: z.string(),
        })
      )
      .query(async (opts) => {
        const userTripIds = await db.query.tripsToUsers.findMany({
          where: eq(tripsToUsers.userId, opts.input.userId),
          columns: {
            tripId: true,
          },
        });

        const tripIds = userTripIds.map((tripToUser) => tripToUser.tripId);

        const trips = await db.query.trips.findMany({
          where: (trips, { inArray }) => inArray(trips.id, tripIds),
          with: {
            tripsToUsers: {
              with: {
                user: true,
              },
            },
          },
        });

        return {
          trips,
        };
      }),
  },
});

// export type definition of API
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouter = typeof appRouter;
