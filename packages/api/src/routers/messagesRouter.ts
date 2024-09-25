import { Message } from "@trippy/core/message/message";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const meassagesRouter = router({
  getByTripId: procedure
    .input(z.string())
    .query((opts) => Message.fromTripId(opts.input)),
});
