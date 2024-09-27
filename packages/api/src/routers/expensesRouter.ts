import { Expense } from "@trippy/core/expense/expense";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const expensesRouter = router({
  getByTripId: procedure
    .input(
      z.object({
        tripId: z.string(),
        start: z.date().default(new Date(2099, 12, 31)),
        limit: z.number().optional().default(100),
      })
    )
    .query((opts) => Expense.getByTripId(opts.input)),
});
