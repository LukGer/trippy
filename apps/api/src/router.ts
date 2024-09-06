import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { and, eq, like, notInArray, or } from "drizzle-orm";
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
    getBySearchString: procedure
      .input(
        z.object({
          searchString: z.string(),
          excludedIds: z.array(z.string()),
        })
      )
      .query(async (opts) => {
        const found = await db.query.users.findMany({
          where: and(
            or(
              like(users.name, `%${opts.input.searchString}%`),
              like(users.email, `%${opts.input.searchString}%`)
            ),
            notInArray(users.id, opts.input.excludedIds)
          ),
        });

        return {
          users: found,
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
        const existing = await db.query.users.findFirst({
          where: eq(users.clerkId, opts.input.clerkId),
        });

        if (existing) {
          return;
        }

        await db.insert(users).values({
          email: opts.input.email,
          name: opts.input.name,
          clerkId: opts.input.clerkId,
          pictureUrl: opts.input.pictureUrl,
        });
      }),
  },
  trips: {
    create: procedure
      .input(
        z.object({
          name: z.string(),
          imageUrl: z.optional(z.string()),
          startDate: z.date(),
          endDate: z.date(),
          memberIds: z.array(z.string()),
        })
      )
      .mutation(async (opts) => {
        const trip = await db
          .insert(trips)
          .values({
            name: opts.input.name,
            imageUrl: opts.input.imageUrl,
            startDate: opts.input.startDate,
            endDate: opts.input.endDate,
          })
          .returning()
          .execute();

        opts.input.memberIds.forEach((memberId) => {
          db.insert(tripsToUsers)
            .values({
              tripId: trip[0].id,
              userId: memberId,
            })
            .onConflictDoNothing()
            .execute();
        });
      }),
    update: procedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          imageUrl: z.optional(z.string()),
          startDate: z.date(),
          endDate: z.date(),
          memberIds: z.array(z.string()),
        })
      )
      .mutation(async (opts) => {
        await db
          .update(trips)
          .set({
            name: opts.input.name,
            imageUrl: opts.input.imageUrl,
            startDate: opts.input.startDate,
            endDate: opts.input.endDate,
          })
          .where(eq(trips.id, opts.input.id))
          .execute();

        await db
          .delete(tripsToUsers)
          .where(eq(tripsToUsers.tripId, opts.input.id))
          .execute();

        opts.input.memberIds.forEach((memberId) => {
          db.insert(tripsToUsers)
            .values({
              tripId: opts.input.id,
              userId: memberId,
            })
            .onConflictDoNothing()
            .execute();
        });
      }),
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
