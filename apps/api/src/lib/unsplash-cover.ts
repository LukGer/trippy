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
	const q = query.trim();
	if (!q) return null;
	const search = q.length > 140 ? `${q.slice(0, 137)}…` : q;
	console.info("[unsplash-cover] search", { query: search });

	const url = new URL("https://api.unsplash.com/search/photos");
	url.searchParams.set("query", search);
	url.searchParams.set("per_page", "1");
	url.searchParams.set("orientation", "landscape");

	const res = await fetch(url.toString(), {
		headers: { Authorization: `Client-ID ${accessKey}` },
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
		headers: { Authorization: `Client-ID ${accessKey}` },
		signal,
	}).catch(() => {});

	return {
		coverImageUrl: imageUrl,
		coverPhotographerName: first.user?.name?.trim() || "Photographer",
		coverPhotographerPageUrl:
			first.user?.links?.html?.trim() || "https://unsplash.com",
	};
}
