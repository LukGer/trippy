import { Chat } from "@trippy/core/chat/chat";
import { z } from "zod";
import { procedure, router } from "../trpc";

export const chatRouter = router({
  getByTripId: procedure
    .input(
      z.object({
        tripId: z.string(),
        cursor: z.string().optional(),
      })
    )
    .query((opts) => Chat.getChatMessages(opts.input)),
});
