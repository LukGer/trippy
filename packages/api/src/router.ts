import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { tripsRouter } from "./routers/trips";
import { usersRouter } from "./routers/users";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  trips: tripsRouter,
});

// export type definition of API
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouter = typeof appRouter;
