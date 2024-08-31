import { clerkPlugin } from "@clerk/fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { Resource } from "sst";
import { createContext } from "./context";
import { appRouter, type AppRouter } from "./router";

const app = fastify({
  maxParamLength: 5000,
  logger: true,
});

app.register(clerkPlugin, {
  publishableKey: Resource.ClerkPublishableKey.value,
  secretKey: Resource.ClerkSecretKey.value,
});

app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      // report to error monitoring
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

app.get("/health", async () => {
  return { ok: true };
});

export const handler = awsLambdaFastify(app);
