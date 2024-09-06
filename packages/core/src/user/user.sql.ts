import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { id, ulid } from "../drizzle/types";
import { tripTable } from "../trip/trip.sql";

export const userTable = pgTable("users", {
  ...id,
  email: text("email").notNull(),
  name: text("name").notNull(),
  clerkId: text("clerk_id").notNull(),
  pictureUrl: text("picture_url"),
});

export const usersToTripsTable = pgTable("trip_to_user", {
  tripId: ulid("trip_id")
    .references(() => tripTable.id)
    .notNull(),
  userId: ulid("user_id")
    .references(() => userTable.id)
    .notNull(),
  isAdmin: boolean("is_admin"),
});
