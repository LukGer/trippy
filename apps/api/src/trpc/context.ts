import type { Context } from "hono";

import { createAuth } from "../auth/auth";
import { getSession } from "../auth/auth-context";
import { createDb } from "../db/client";
import type { ApiEnv } from "../env";
import { buildServices } from "../modules/services";

export async function createTRPCContext(c: Context<ApiEnv>) {
  const auth = createAuth(c.env);
  const session = await getSession(auth, c.req.raw);
  const db = createDb(c.env.DB);

  return {
    auth,
    db,
    env: c.env,
    request: c.req.raw,
    session,
    services: buildServices(db),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
