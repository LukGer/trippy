import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { getApiUrl } from "./api-url";

export const authClient = createAuthClient({
	baseURL: getApiUrl(),
	plugins: [
		expoClient({
			scheme: "trippy",
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
