import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "../auth/schema";

export const trips = sqliteTable(
  "trips",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startsOn: integer("starts_on", { mode: "timestamp" }),
    endsOn: integer("ends_on", { mode: "timestamp" }),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("trips_owner_id_idx").on(table.ownerId)],
);

export const tripMembers = sqliteTable(
  "trip_members",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_members_trip_id_idx").on(table.tripId),
    index("trip_members_user_id_idx").on(table.userId),
    uniqueIndex("trip_members_trip_user_unique").on(table.tripId, table.userId),
  ],
);

export const places = sqliteTable(
  "places",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    lat: real("lat"),
    lng: real("lng"),
    googlePlaceId: text("google_place_id"),
    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown> | null
    >(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("places_trip_id_idx").on(table.tripId),
    index("places_google_place_id_idx").on(table.googlePlaceId),
  ],
);

export const tripSegments = sqliteTable(
  "trip_segments",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    fromPlaceId: text("from_place_id").references(() => places.id, {
      onDelete: "set null",
    }),
    toPlaceId: text("to_place_id").references(() => places.id, {
      onDelete: "set null",
    }),
    startsOn: integer("starts_on", { mode: "timestamp" }),
    endsOn: integer("ends_on", { mode: "timestamp" }),
    orderIndex: integer("order_index").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_segments_trip_id_idx").on(table.tripId),
    index("trip_segments_order_idx").on(table.tripId, table.orderIndex),
  ],
);

export const itineraryItems = sqliteTable(
  "itinerary_items",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    kind: text("kind").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp" }),
    endsAt: integer("ends_at", { mode: "timestamp" }),
    allDay: integer("all_day", { mode: "boolean" })
      .$defaultFn(() => false)
      .notNull(),
    placeId: text("place_id").references(() => places.id, {
      onDelete: "set null",
    }),
    rawLocation: text("raw_location"),
    description: text("description"),
    status: text("status").notNull(),
    orderIndex: integer("order_index").notNull(),
    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown> | null
    >(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("itinerary_items_trip_id_idx").on(table.tripId),
    index("itinerary_items_timeline_idx").on(table.tripId, table.startsAt),
    index("itinerary_items_order_idx").on(table.tripId, table.orderIndex),
    index("itinerary_items_place_id_idx").on(table.placeId),
  ],
);

export const documents = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    kind: text("kind").notNull(),
    fileKey: text("file_key"),
    mimeType: text("mime_type"),
    textContent: text("text_content"),
    structuredData: text("structured_data", { mode: "json" }).$type<
      Record<string, unknown> | null
    >(),
    sensitive: integer("sensitive", { mode: "boolean" })
      .$defaultFn(() => false)
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("documents_trip_id_idx").on(table.tripId),
    index("documents_created_by_idx").on(table.createdBy),
  ],
);

export const documentLinks = sqliteTable(
  "document_links",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("document_links_document_id_idx").on(table.documentId),
    index("document_links_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const tripRelations = relations(trips, ({ one, many }) => ({
  owner: one(user, {
    fields: [trips.ownerId],
    references: [user.id],
  }),
  members: many(tripMembers),
  places: many(places),
  segments: many(tripSegments),
  itineraryItems: many(itineraryItems),
  documents: many(documents),
}));

export const tripMemberRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, {
    fields: [tripMembers.tripId],
    references: [trips.id],
  }),
  user: one(user, {
    fields: [tripMembers.userId],
    references: [user.id],
  }),
}));

export const placeRelations = relations(places, ({ one, many }) => ({
  trip: one(trips, {
    fields: [places.tripId],
    references: [trips.id],
  }),
  itineraryItems: many(itineraryItems),
}));

export const tripSegmentRelations = relations(tripSegments, ({ one }) => ({
  trip: one(trips, {
    fields: [tripSegments.tripId],
    references: [trips.id],
  }),
  fromPlace: one(places, {
    fields: [tripSegments.fromPlaceId],
    references: [places.id],
    relationName: "fromPlace",
  }),
  toPlace: one(places, {
    fields: [tripSegments.toPlaceId],
    references: [places.id],
    relationName: "toPlace",
  }),
}));

export const itineraryItemRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
  place: one(places, {
    fields: [itineraryItems.placeId],
    references: [places.id],
  }),
}));

export const documentRelations = relations(documents, ({ one, many }) => ({
  trip: one(trips, {
    fields: [documents.tripId],
    references: [trips.id],
  }),
  creator: one(user, {
    fields: [documents.createdBy],
    references: [user.id],
  }),
  links: many(documentLinks),
}));

export const documentLinkRelations = relations(documentLinks, ({ one }) => ({
  document: one(documents, {
    fields: [documentLinks.documentId],
    references: [documents.id],
  }),
}));
