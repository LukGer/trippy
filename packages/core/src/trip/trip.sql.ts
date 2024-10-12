import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id } from "../drizzle/types";

export const tripTable = pgTable("trips", {
  ...id,
  name: text("name").notNull(),
  placeId: text("place_id").notNull(),
  imageUrl: text("image_url").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});
