import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, ulid } from "../drizzle/types";
import { tripTable } from "../trip/trip.sql";
import { userTable } from "../user/user.sql";

export const messageTypeEnum = pgEnum("message_type", [
  "chat",
  "expense",
  "system",
]);

export const messageTable = pgTable("messages", {
  ...id,
  tripId: ulid("trip_id")
    .references(() => tripTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: ulid("user_id")
    .references(() => userTable.id)
    .notNull(),
  type: messageTypeEnum("type").notNull(),
  content: text("content"),
  deeplink: text("deeplink"),
  createdAt: timestamp("created_at").notNull(),
});
