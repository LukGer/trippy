import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { expensesRouter } from "./routers/expensesRouter";
import { meassagesRouter } from "./routers/messagesRouter";
import { tripsRouter } from "./routers/tripsRouter";
import { usersRouter } from "./routers/usersRouter";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  trips: tripsRouter,
  expenses: expensesRouter,
  messages: meassagesRouter,
});

// export type definition of API
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouter = typeof appRouter;
