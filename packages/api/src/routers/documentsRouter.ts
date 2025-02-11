import { Documents } from "@trippy/core/documents/documents";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const documentsRouter = router({
  getByTripId: procedure
    .input(z.string())
    .query((opts) => Documents.getByTripId(opts.input)),
});
