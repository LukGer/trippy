import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { and, eq, inArray } from "drizzle-orm";
import sharp from "sharp";
import { Resource } from "sst";
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
    imageUrl: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    members: z.array(
      User.Info.partial({ clerkId: true }).merge(
        z.object({ isAdmin: z.boolean().nullable() })
      )
    ),
  });
  export type Info = z.infer<typeof Info>;

  export const create = fn(
    z.object({
      name: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      memberIds: z.array(z.string()),
    }),
    async (input) => {
      const id = createID("trip");

      const bucketName = Resource.TrippyBucket.name;

      const imageUrl = `https://${bucketName}.s3.eu-central-1.amazonaws.com/images/trip/new.avif`;

      await db
        .insert(tripTable)
        .values({
          id,
          name: input.name,
          imageUrl,
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
          isAdmin: row.trip_to_user?.isAdmin ?? null,
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
              isAdmin: row.trip_to_user?.isAdmin ?? null,
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

  export const leaveTrip = fn(
    z.object({ tripId: z.string(), userId: z.string() }),
    async (input) => {
      const tripMembers = await db
        .select()
        .from(usersToTripsTable)
        .where(eq(usersToTripsTable.tripId, input.tripId));

      const leavingUser = tripMembers.find(
        (member) => member.userId === input.userId
      );

      if (!leavingUser) {
        throw new Error("User is not a member of this trip");
      }

      if (leavingUser.isAdmin) {
        // If the user is an admin, find another member to be the admin
        const newAdmin = tripMembers.find(
          (member) => member.userId !== input.userId
        );

        if (!newAdmin) {
          // If there are no other members, delete the trip
          await db
            .delete(tripTable)
            .where(eq(tripTable.id, input.tripId))
            .execute();

          return;
        }

        // Update the new admin
        await db
          .update(usersToTripsTable)
          .set({ isAdmin: true })
          .where(
            and(
              eq(usersToTripsTable.tripId, input.tripId),
              eq(usersToTripsTable.userId, newAdmin.userId)
            )
          );
      }

      // Remove the user from the trip
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

  export const uploadImage = fn(
    z.object({
      tripId: z.string(),
      imageData: z.string(),
      mimeType: z.string(),
      extension: z.string(),
    }),
    async (input) => {
      const key = `images/trip/${input.tripId}`;

      const buffer = Buffer.from(input.imageData, "base64");

      const resizedBuffer = await sharp(buffer).resize(600, 300).toBuffer();

      const client = new S3Client({ region: "eu-central-1" });

      const command = new PutObjectCommand({
        Key: key,
        Body: resizedBuffer,
        ContentType: input.mimeType,
        Bucket: Resource.TrippyBucket.name,
      });

      const response = await client.send(command);

      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error("Failed to upload image");
      }

      const imageUrl = `https://${Resource.TrippyBucket.name}.s3.eu-central-1.amazonaws.com/${key}`;

      await db
        .update(tripTable)
        .set({ imageUrl })
        .where(eq(tripTable.id, input.tripId))
        .execute();
    }
  );
}
