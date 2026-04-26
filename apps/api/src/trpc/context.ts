import type { Context } from "hono";

import { createAuth } from "../auth/auth";
import { getSession } from "../auth/auth-context";
import { createDb } from "../db/client";
import type { ApiEnv } from "../env";

export async function createTRPCContext(c: Context<ApiEnv>) {
  const auth = createAuth(c.env);
  const session = await getSession(auth, c.req.raw);

  return {
    auth,
    db: createDb(c.env.DB),
    env: c.env,
    request: c.req.raw,
    session,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
