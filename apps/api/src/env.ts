import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

export type ApiEnv = {
  Bindings: {
    DB: D1Database;
    /** Plan wizard attachment storage; create with `wrangler r2 bucket create trippy-plan-uploads`. */
    PLAN_UPLOADS?: R2Bucket;
    BETTER_AUTH_SECRET?: string;
    /** Public origin of this API (no path), e.g. `https://trippy-api.example.com` — used for OAuth callback URLs. */
    BETTER_AUTH_URL: string;
    /** Allowed browser / web origin for CORS (e.g. Expo web dev server). */
    CORS_ORIGIN: string;
    /**
     * When `"true"`, allow Expo Go OAuth redirects (`exp://…`) in `trustedOrigins`.
     * Turn off in production if you only ship dev-client/store builds (`trippy://`).
     */
    BETTER_AUTH_ALLOW_EXPO_GO?: string;
    /** Google OAuth Web client ID (Google Cloud Console → Credentials). */
    GOOGLE_CLIENT_ID?: string;
    /** Google OAuth client secret; use `wrangler secret put GOOGLE_CLIENT_SECRET` for prod. */
    GOOGLE_CLIENT_SECRET?: string;
    /** Set via `wrangler secret put OPENAI_API_KEY` or `.dev.vars` for local dev. */
    OPENAI_API_KEY?: string;
    /** Unsplash Access Key for trip cover photos (`wrangler secret put UNSPLASH_ACCESS_KEY`). */
    UNSPLASH_ACCESS_KEY?: string;
  };
};
