import { eq } from "drizzle-orm";
import type { Db } from "../../db/client";
import { trips } from "../../db/schema";

export type TripsRepo = ReturnType<typeof createTripsRepo>;

export function createTripsRepo(db: Db) {
  return {
    listByOwner(ownerId: string) {
      return db.query.trips.findMany({
        where: eq(trips.ownerId, ownerId),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });
    },

    async create(input: { id: string; name: string; ownerId: string }) {
      const now = new Date();

      await db.insert(trips).values({
        id: input.id,
        name: input.name,
        ownerId: input.ownerId,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id: input.id,
        name: input.name,
        ownerId: input.ownerId,
        createdAt: now,
        updatedAt: now,
      };
    },
  };
}
