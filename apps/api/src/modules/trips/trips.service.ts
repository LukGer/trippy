import { canManageTrip } from "@trippy/core";
import { TRPCError } from "@trpc/server";
import type { TripsRepo } from "./trips.repo";

export class TripsService {
  constructor(private readonly tripsRepo: TripsRepo) {}

  public async listForUser(userId: string) {
    return this.tripsRepo.listByOwner(userId);
  };

  public async createForOwner(input: {
    name: string;
    ownerId: string;
    coverImageUrl?: string | null;
    coverPhotographerName?: string | null;
    coverPhotographerPageUrl?: string | null;
  }) {
    if (!canManageTrip("owner")) {
      throw new Error("Owner role must be allowed to manage trips.");
    }

    return this.tripsRepo.create({
      id: crypto.randomUUID(),
      name: input.name,
      ownerId: input.ownerId,
      coverImageUrl: input.coverImageUrl ?? null,
      coverPhotographerName: input.coverPhotographerName ?? null,
      coverPhotographerPageUrl: input.coverPhotographerPageUrl ?? null,
    });
  };

  public async deleteForOwner(tripId: string, ownerId: string) {
    if (!canManageTrip("owner")) {
      throw new Error("Owner role must be allowed to manage trips.");
    }

    const deleted = await this.tripsRepo.deleteByIdForOwner(tripId, ownerId);
    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trip not found or you do not have access.",
      });
    }
    return { ok: true as const };
  }
}
