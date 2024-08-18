import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
  name: text("name"),
  googleId: text("google_id").unique(),
});

export const DbUser = users.$inferSelect;
export const DbUserInsert = users.$inferInsert;
