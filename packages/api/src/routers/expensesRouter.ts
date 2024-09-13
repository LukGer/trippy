import { Expense } from "@trippy/core/expense/expense";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const expensesRouter = router({
  getByTripId: procedure
    .input(z.string())
    .query((opts) => Expense.fromTripId(opts.input)),
});
