import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { chatRouter } from "./routers/chatRouter";
import { expensesRouter } from "./routers/expensesRouter";
import { placesRouter } from "./routers/placesRouter";
import { tripsRouter } from "./routers/tripsRouter";
import { usersRouter } from "./routers/usersRouter";
import { router } from "./trpc";

export const appRouter = router({
  users: usersRouter,
  trips: tripsRouter,
  expenses: expensesRouter,
  chats: chatRouter,
  places: placesRouter,
});

// export type definition of API
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type AppRouter = typeof appRouter;
