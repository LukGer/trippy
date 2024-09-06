import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, ulid } from "../drizzle/types";
import { tripTable } from "../trip/trip.sql";
import { userTable } from "../user/user.sql";

export const messageTable = pgTable("messages", {
  ...id,
  tripId: ulid("trip_id")
    .references(() => tripTable.id)
    .notNull(),
  userId: ulid("user_id")
    .references(() => userTable.id)
    .notNull(),
  content: text("content"),
  createdAt: timestamp("created_at"),
});
