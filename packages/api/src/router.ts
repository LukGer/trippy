import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { expensesRouter } from "./routers/expensesRouter";
import { tripsRouter } from "./routers/tripsRouter";
import { usersRouter } from "./routers/usersRouter";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  trips: tripsRouter,
  expenses: expensesRouter,
});

// export type definition of API
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouter = typeof appRouter;
