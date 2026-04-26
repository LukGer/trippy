import { tripsRouter } from "../modules/trips/trips.router";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    service: "trippy-api",
  })),
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
