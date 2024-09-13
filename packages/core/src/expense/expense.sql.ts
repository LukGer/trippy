import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { id, ulid } from "../drizzle/types";
import { tripTable } from "../trip/trip.sql";
import { userTable } from "../user/user.sql";

export const expenseTable = pgTable("expenses", {
  ...id,
  tripId: ulid("trip_id")
    .references(() => tripTable.id)
    .notNull(),
  payerId: ulid("payer_id")
    .references(() => userTable.id)
    .notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
});

export const expenseRecipientTable = pgTable(
  "expense_recipients",
  {
    expenseId: ulid("expense_id")
      .references(() => expenseTable.id)
      .notNull(),
    userId: ulid("user_id")
      .references(() => userTable.id)
      .notNull(),
    amount: integer("amount").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.expenseId, table.userId] }),
  })
);
