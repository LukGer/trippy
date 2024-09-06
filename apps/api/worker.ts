import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./src/context";
import { appRouter } from "./src/router";

export default {
  async fetch(request: Request): Promise<Response> {
    return fetchRequestHandler({
      endpoint: "/trpc",
      req: request,
      router: appRouter,
      createContext,
    });
  },
};
