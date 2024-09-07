import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { User } from "../user/user";
import { usersToTripsTable, userTable } from "../user/user.sql";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { tripTable } from "./trip.sql";

export namespace Trip {
  export const Info = z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    startDate: z.date(),
    endDate: z.date(),
    members: z.array(User.Info.partial({ clerkId: true })),
  });
  export type Info = z.infer<typeof Info>;

  export const create = fn(
    z.object({
      name: z.string(),
      imageUrl: z.string().nullable(),
      startDate: z.date(),
      endDate: z.date(),
      memberIds: z.array(z.string()),
    }),
    async (input) => {
      const id = createID("trip");

      await db
        .insert(tripTable)
        .values({
          id,
          name: input.name,
          imageUrl: input.imageUrl,
          startDate: input.startDate,
          endDate: input.endDate,
        })
        .execute();

      input.memberIds.forEach((userId) => {
        db.insert(usersToTripsTable)
          .values({
            tripId: id,
            userId,
          })
          .execute();
      });

      return id;
    }
  );

  export const update = fn(
    Info.partial({
      name: true,
      imageUrl: true,
      startDate: true,
      endDate: true,
    }),
    async (input) => {
      await db
        .update(tripTable)
        .set({
          name: input.name,
          imageUrl: input.imageUrl,
          startDate: input.startDate,
          endDate: input.endDate,
        })
        .where(eq(tripTable.id, input.id))
        .execute();
    }
  );

  export const fromId = fn(z.string(), async (id) =>
    db
      .select()
      .from(tripTable)
      .leftJoin(usersToTripsTable, eq(usersToTripsTable.tripId, tripTable.id))
      .innerJoin(userTable, eq(userTable.id, usersToTripsTable.userId))
      .where(eq(tripTable.id, id))
      .then((rows) => ({
        id: rows[0]!.trips.id,
        name: rows[0]!.trips.name,
        imageUrl: rows[0]!.trips.imageUrl,
        startDate: rows[0]!.trips.startDate,
        endDate: rows[0]!.trips.endDate,
        members: rows.map((row) => ({
          id: row.users.id,
          name: row.users.name,
          email: row.users.email,
          pictureUrl: row.users.pictureUrl,
        })),
      }))
  );

  export const fromMemberId = fn(z.string(), async (userId) => {
    const tripIds = await db
      .select()
      .from(usersToTripsTable)
      .innerJoin(tripTable, eq(tripTable.id, usersToTripsTable.tripId))
      .where(eq(usersToTripsTable.userId, userId))
      .then((rows) => rows.map((row) => row.trips.id));

    return db
      .select()
      .from(tripTable)
      .leftJoin(usersToTripsTable, eq(usersToTripsTable.tripId, tripTable.id))
      .innerJoin(userTable, eq(userTable.id, usersToTripsTable.userId))
      .where(inArray(tripTable.id, tripIds))
      .then((rows) => {
        const trips = new Map<string, Info>();

        rows.forEach((row) => {
          const tripId = row.trips.id;
          if (!trips.has(tripId)) {
            trips.set(tripId, {
              id: tripId,
              name: row.trips.name,
              imageUrl: row.trips.imageUrl,
              startDate: row.trips.startDate,
              endDate: row.trips.endDate,
              members: [],
            });
          }

          const trip = trips.get(tripId)!;
          if (row.users.id) {
            trip.members.push({
              id: row.users.id,
              name: row.users.name,
              email: row.users.email,
              pictureUrl: row.users.pictureUrl,
            });
          }
        });

        return Array.from(trips.values());
      });
  });

  export const addMember = fn(
    z.object({ tripId: z.string(), userId: z.string() }),
    async (input) => {
      if (
        await db
          .select()
          .from(usersToTripsTable)
          .where(
            and(
              eq(usersToTripsTable.tripId, input.tripId),
              eq(usersToTripsTable.userId, input.userId)
            )
          )
          .then((rows) => rows.length > 0)
      ) {
        return;
      }

      await db.insert(usersToTripsTable).values(input).execute();
    }
  );

  export const removeMember = fn(
    z.object({ tripId: z.string(), userId: z.string() }),
    async (input) => {
      await db
        .delete(usersToTripsTable)
        .where(
          and(
            eq(usersToTripsTable.tripId, input.tripId),
            eq(usersToTripsTable.userId, input.userId)
          )
        )
        .execute();
    }
  );
}
