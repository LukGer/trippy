import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "./api-url";

const scheme = Constants.expoConfig?.scheme;
const resolvedScheme =
	typeof scheme === "string" ? scheme : (scheme?.[0] ?? "trippy");

export const authClient = createAuthClient({
	baseURL: getApiUrl(),
	plugins: [
		expoClient({
			scheme: resolvedScheme,
			storagePrefix: "trippy",
			storage: SecureStore,
		}),
	],
});

/** Merge into fetch/TRPC `headers` so Workers receives the Better Auth session cookie. */
export function betterAuthCookieHeaders(): Record<string, string> {
	const cookie = authClient.getCookie();
	return typeof cookie === "string" && cookie.trim().length > 0 ?
			{ Cookie: cookie }
		:	{};
}
