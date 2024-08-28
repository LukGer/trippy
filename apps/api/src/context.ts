import { getAuth } from "@clerk/fastify";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const auth = getAuth(req);

  return { req, res, auth };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
