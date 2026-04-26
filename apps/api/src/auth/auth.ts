import { betterAuth, type Auth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db/client";
import type { ApiEnv } from "../env";
import * as authSchema from "./schema";

export type { Auth } from "better-auth";

export function createAuth(env: ApiEnv["Bindings"]): Auth {
	const authOptions: BetterAuthOptions = {
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.CORS_ORIGIN],
		database: drizzleAdapter(createDb(env.DB), {
			provider: "sqlite",
			schema: authSchema,
		}),
		emailAndPassword: {
			enabled: true,
		},
	};

	return betterAuth(authOptions);
}
