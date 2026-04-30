import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export type ApiEnv = {
  Bindings: {
    DB: D1Database;
    /** Plan wizard attachment storage; create with `wrangler r2 bucket create trippy-plan-uploads`. */
    PLAN_UPLOADS?: R2Bucket;
    BETTER_AUTH_SECRET?: string;
    BETTER_AUTH_URL: string;
    CORS_ORIGIN: string;
    /** Set via `wrangler secret put OPENAI_API_KEY` or `.dev.vars` for local dev. */
    OPENAI_API_KEY?: string;
    /** Unsplash Access Key for trip cover photos (`wrangler secret put UNSPLASH_ACCESS_KEY`). */
    UNSPLASH_ACCESS_KEY?: string;
  };
};
