import { expo } from "@better-auth/expo";
import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db/client";
import type { ApiEnv } from "../env";
import * as authSchema from "./schema";

export type { Auth } from "better-auth";

function buildTrustedOrigins(env: ApiEnv["Bindings"]): string[] {
	const origins = new Set<string>([
		env.CORS_ORIGIN.replace(/\/+$/, ""),
		"trippy://",
	]);
	/** Expo Go OAuth redirects (`exp://…`). Disable in production Workers config if unused. */
	if (env.BETTER_AUTH_ALLOW_EXPO_GO === "true") {
		origins.add("exp://");
		origins.add("exp://**");
	}
	return [...origins];
}

export function createAuth(env: ApiEnv["Bindings"]): Auth {
	const googleConfigured =
		Boolean(env.GOOGLE_CLIENT_ID?.trim()) &&
		Boolean(env.GOOGLE_CLIENT_SECRET?.trim());

	const authOptions: BetterAuthOptions = {
		baseURL: env.BETTER_AUTH_URL.replace(/\/+$/, ""),
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: buildTrustedOrigins(env),
		database: drizzleAdapter(createDb(env.DB), {
			provider: "sqlite",
			schema: authSchema,
		}),
		plugins: [expo()],
		emailAndPassword: {
			enabled: true,
		},
		...(googleConfigured
			? {
					socialProviders: {
						google: {
							clientId: env.GOOGLE_CLIENT_ID as string,
							clientSecret: env.GOOGLE_CLIENT_SECRET as string,
							prompt: "select_account",
						},
					},
				}
			: {}),
	};

	return betterAuth(authOptions);
}
