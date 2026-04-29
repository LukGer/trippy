import type { D1Database } from "@cloudflare/workers-types";

export type ApiEnv = {
  Bindings: {
    DB: D1Database;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL: string;
    CORS_ORIGIN: string;
    /** Set via `wrangler secret put OPENAI_API_KEY` or `.dev.vars` for local dev. */
    OPENAI_API_KEY?: string;
  };
};
