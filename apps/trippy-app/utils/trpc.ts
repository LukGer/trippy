import type { AppRouter } from "@repo/api/src/router";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
