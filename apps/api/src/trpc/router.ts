import { documentsRouter } from "../modules/documents/documents.router";
import { tripsRouter } from "../modules/trips/trips.router";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    service: "trippy-api",
  })),
  documents: documentsRouter,
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
