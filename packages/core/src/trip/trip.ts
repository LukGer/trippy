import { and, eq, notInArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle";
import { usersToTripsTable, userTable } from "../user/user.sql";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { tripTable } from "./trip.sql";

export module Trip {
  export const Info = z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().nullable(),
    startDate: z.date(),
    endDate: z.date(),
  });
  export type Info = z.infer<typeof Info>;

  export const create = fn(
    z.object({
      name: z.string(),
      imageUrl: z.string().nullable(),
      startDate: z.date(),
      endDate: z.date(),
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

      return id;
    }
  );

  export const update = fn(
    Info.merge(
      z.object({
        memberIds: z.array(z.string()),
      })
    ).partial({
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

      await db
        .delete(usersToTripsTable)
        .where(
          and(
            eq(usersToTripsTable.tripId, input.id),
            notInArray(usersToTripsTable.userId, input.memberIds)
          )
        )
        .execute();

      input.memberIds.forEach((userId) => {
        db.insert(usersToTripsTable)
          .values({
            tripId: input.id,
            userId,
          })
          .onConflictDoNothing()
          .execute();
      });
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

  export const fromMemberId = fn(z.string(), async (userId) =>
    db
      .select()
      .from(tripTable)
      .leftJoin(usersToTripsTable, eq(usersToTripsTable.tripId, tripTable.id))
      .innerJoin(userTable, eq(userTable.id, usersToTripsTable.userId))
      .where(eq(usersToTripsTable.userId, userId))
      .then((rows) =>
        rows.map((row) => ({
          id: row.trips.id,
          name: row.trips.name,
          imageUrl: row.trips.imageUrl,
          startDate: row.trips.startDate,
          endDate: row.trips.endDate,
          members: rows.map((row) => ({
            id: row.users.id,
            name: row.users.name,
            email: row.users.email,
            pictureUrl: row.users.pictureUrl,
          })),
        }))
      )
  );

  function serialize(
    input: typeof tripTable.$inferSelect
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      name: input.name,
      imageUrl: input.imageUrl,
      startDate: input.startDate,
      endDate: input.endDate,
    };
  }
}
