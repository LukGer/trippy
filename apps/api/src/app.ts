import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "./auth/auth";
import type { ApiEnv } from "./env";
import { registerItineraryRoutes } from "./routes/itinerary";
import { createTRPCContext } from "./trpc/context";
import { appRouter } from "./trpc/router";

export const app = new Hono<ApiEnv>();

app.use(
  "*",
  cors({
    origin: (origin, c) => origin || c.env.CORS_ORIGIN,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

registerItineraryRoutes(app);

app.get("/", (c) => {
  return c.json({
    ok: true,
    service: "trippy-api",
  });
});

app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = createAuth(c.env);

  return auth.handler(c.req.raw);
});

app.use("/trpc/*", (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => createTRPCContext(c),
  });
});
