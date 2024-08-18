import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique(),
  name: text("name"),
  googleId: text("google_id").unique(),
});

export const DbUser = usersTable.$inferSelect;
export const DbUserInsert = usersTable.$inferInsert;
