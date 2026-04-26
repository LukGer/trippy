import { canManageTrip } from "@trippy/core";

import type { TripsRepo } from "./trips.repo";

export type TripsService = ReturnType<typeof createTripsService>;

export function createTripsService(deps: {
  tripsRepo: TripsRepo;
  createId?: () => string;
}) {
  const createId = deps.createId ?? crypto.randomUUID;

  return {
    async listForUser(userId: string) {
      return deps.tripsRepo.listByOwner(userId);
    },

    async createForOwner(input: { name: string; ownerId: string }) {
      if (!canManageTrip("owner")) {
        throw new Error("Owner role must be allowed to manage trips.");
      }

      return deps.tripsRepo.create({
        id: createId(),
        name: input.name,
        ownerId: input.ownerId,
      });
    },
  };
}
