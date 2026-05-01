import { tool } from "ai";
import { z } from "zod";
import type { FetchTripCoverImageToolOutput } from "../types";

export const FETCH_TRIP_COVER_IMAGE_TOOL_NAME = "fetchTripCoverImage" as const;

type UnsplashSearchJson = {
	results?: Array<{
		id: string;
		urls?: { regular?: string };
		user?: { name?: string; links?: { html?: string } };
	}>;
};

/**
 * Landscape hero from Unsplash search; triggers download tracking when successful.
 * @see https://unsplash.com/documentation
 *
 * `accessKey` comes from Cloudflare bindings (`c.env.UNSPLASH_ACCESS_KEY`); inject it from the route/agent layer — this module has no request context.
 */
export async function fetchUnsplashCoverForQuery(
	accessKey: string,
	query: string,
	signal?: AbortSignal,
): Promise<{
	coverImageUrl: string;
	coverPhotographerName: string;
	coverPhotographerPageUrl: string;
} | null> {
	const key = accessKey.trim();
	if (!key) return null;

	const q = query.trim();
	if (!q) return null;
	const search = q.length > 140 ? `${q.slice(0, 137)}…` : q;
	console.info("[unsplash-cover] search", { query: search });

	const url = new URL("https://api.unsplash.com/search/photos");
	url.searchParams.set("query", search);
	url.searchParams.set("per_page", "1");
	url.searchParams.set("orientation", "landscape");

	const res = await fetch(url.toString(), {
		headers: { Authorization: `Client-ID ${key}` },
		signal,
	});
	if (!res.ok) {
		console.warn("[unsplash-cover] search HTTP error", { status: res.status });
		return null;
	}

	const data = (await res.json()) as UnsplashSearchJson;
	const first = data.results?.[0];
	const imageUrl = first?.urls?.regular;
	if (!first?.id || !imageUrl) {
		console.warn("[unsplash-cover] no photo in results");
		return null;
	}

	console.info("[unsplash-cover] photo", { id: first.id });

	void fetch(`https://api.unsplash.com/photos/${first.id}/download`, {
		headers: { Authorization: `Client-ID ${key}` },
		signal,
	}).catch(() => {});

	return {
		coverImageUrl: imageUrl,
		coverPhotographerName: first.user?.name?.trim() || "Photographer",
		coverPhotographerPageUrl:
			first.user?.links?.html?.trim() || "https://unsplash.com",
	};
}

/** Bind `accessKey` from env when constructing the tool (see itinerary route → agent stream input). */
export function createFetchTripCoverImageTool(
	accessKey: string,
	abortSignal: AbortSignal,
) {
	return tool({
		description:
			"REQUIRED first step: fetch one Unsplash hero image for this trip. Call exactly once before you output the itinerary JSON. Argument: short geographic search query only (city, country, or region, e.g. \"Lisbon\", \"Norway\"). Never pass URLs.",
		inputSchema: z.object({
			query: z
				.string()
				.min(1)
				.max(120)
				.describe(
					'Unsplash search query, e.g. "Kyoto", "Scottish Highlands", "Morocco".',
				),
		}),
		execute: async ({ query }): Promise<FetchTripCoverImageToolOutput> => {
			console.info("[fetchTripCoverImage] tool execute", { query });
			const cover = await fetchUnsplashCoverForQuery(
				accessKey,
				query,
				abortSignal,
			);
			if (!cover) {
				console.info("[fetchTripCoverImage] no cover returned");
				return { ok: false, message: "No photo found" };
			}
			return { ok: true, ...cover };
		},
	});
}
