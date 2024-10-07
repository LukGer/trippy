import type { Message } from "@trippy/core/src/message/message";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo } from "react";

export const useChatMessages = (messages: Message.Info[]) => {
  return useMemo(() => {
    messages.reverse();

    addDateSystemMessages(messages);

    return messages;
  }, [messages]);
};

const addDateSystemMessages = (messages: Message.Info[]) => {
  let lastDate: Dayjs | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (!message) continue;

    const currentDate = dayjs(message.createdAt);
    if (!lastDate || !lastDate.isSame(currentDate, "day")) {
      lastDate = currentDate;
      messages.splice(i + 1, 0, {
        id: `${message.id}-date`,
        type: "system",
        content: currentDate.format("ddd D MMM"),
        createdAt: currentDate.toDate(),
      });
    }
  }
};
