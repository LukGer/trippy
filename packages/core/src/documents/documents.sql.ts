import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, ulid } from "../drizzle/types";
import { tripTable } from "../trip/trip.sql";
import { userTable } from "../user/user.sql";

export const documentsTable = pgTable("documents", {
  ...id,
  tripId: ulid("trip_id")
    .references(() => tripTable.id)
    .notNull(),
  userId: ulid("user_id")
    .references(() => userTable.id)
    .notNull(),
  passportNumber: text("passport_number"),
  passportExpiry: timestamp("passport_expiry"),
});
