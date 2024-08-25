import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  name: text("name"),
  clerkId: text("clerk_id").unique(),
  pictureUrl: text("picture_url"),
});

export const userRelations = relations(users, ({ many }) => ({
  tripsToUsers: many(tripsToUsers),
}));

export type DbUser = typeof users.$inferSelect;
export type DbUserInsert = typeof users.$inferInsert;

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

export const tripRelations = relations(trips, ({ many }) => ({
  tripsToUsers: many(tripsToUsers),
  messages: many(messages),
}));

export type DbTrip = typeof trips.$inferSelect;
export type DbTripInsert = typeof trips.$inferInsert;

export const tripsToUsers = pgTable("trip_to_user", {
  tripId: uuid("trip_id")
    .references(() => trips.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  isAdmin: boolean("is_admin"),
});

export const tripsToUsersRelations = relations(tripsToUsers, ({ one }) => ({
  user: one(users, { fields: [tripsToUsers.userId], references: [users.id] }),
  trip: one(trips, { fields: [tripsToUsers.tripId], references: [trips.id] }),
}));

export type DbTripToUser = typeof tripsToUsers.$inferSelect;
export type DbTripToUserInsert = typeof tripsToUsers.$inferInsert;

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id"),
  userId: uuid("user_id"),
  type: integer("type"),
  content: text("content"),
  createdAt: timestamp("created_at"),
});

export const messageRelations = relations(messages, ({ one }) => ({
  user: one(users, { fields: [messages.userId], references: [users.id] }),
  trip: one(trips, { fields: [messages.tripId], references: [trips.id] }),
}));

export type DbMessage = typeof messages.$inferSelect;
export type DbMessageInsert = typeof messages.$inferInsert;
