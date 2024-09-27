import dayjs from "dayjs";
import { z } from "zod";
import { Message } from "../message/message";
import { fn } from "../util/fn";

export namespace Chat {
  export const getChatMessages = fn(
    z.object({
      tripId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().optional().default(50),
    }),
    async (input) => {
      const start = dayjs(input.cursor ?? "2099-01-01");

      const messages: Message.Info[] = await Message.getByTripIdFromTo({
        tripId: input.tripId,
        start: start.toDate(),
        limit: input.limit,
      });

      const nextCursor = messages.at(-1)?.createdAt.toDateString() ?? null;

      return {
        data: messages.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        ),
        nextCursor,
      };
    }
  );
}
