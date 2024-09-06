import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { trpcServer } from "@hono/trpc-server";
import { TRPCError } from "@trpc/server";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { appRouter } from "./src/router";

const app = new Hono();

app.use(
  "*",
  clerkMiddleware({
    secretKey: Resource.ClerkSecretKey.value,
    publishableKey: Resource.ClerkPublishableKey.value,
  })
);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    onError: (opts) => {
      console.error("TRPC ERROR", opts.ctx.userId);
    },
    createContext: (opts, c) => {
      const auth = getAuth(c);

      if (!auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized",
        });
      }

      return {
        ...opts,
        userId: auth.userId,
      };
    },
  })
);

export const handler = handle(app);

export default app;
