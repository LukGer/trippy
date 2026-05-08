import { expo } from "@better-auth/expo";
import type { D1Database } from "@cloudflare/workers-types";
import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

const db = drizzle({} as D1Database);

const authOptions: BetterAuthOptions = {
	database: drizzleAdapter(db, { provider: "sqlite" }),
	plugins: [expo()],
	emailAndPassword: {
		enabled: true,
	},
};

export const auth: Auth = betterAuth(authOptions);
