import type {
	LastfmRecentTracksResponse,
	LastfmScrobble,
} from "../types/lastfm";

const BASE_URL = "https://ws.audioscrobbler.com/2.0/";

export async function fetchRecentTracksPage(
	username: string,
	apiKey: string,
	page: number,
	limit = 200,
): Promise<LastfmRecentTracksResponse> {
	const url = new URL(BASE_URL);
	url.searchParams.set("method", "user.getrecenttracks");
	url.searchParams.set("user", username);
	url.searchParams.set("api_key", apiKey);
	url.searchParams.set("format", "json");
	url.searchParams.set("limit", limit.toString());
	url.searchParams.set("page", page.toString());

	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error(`Last.fm API error: ${response.status}`);
	}

	return response.json();
}

export async function fetchAllScrobbles(
	username: string,
	apiKey: string,
	onProgress?: (
		currentPage: number,
		totalPages: number,
		scrobbles: number,
		allScrobbles?: LastfmScrobble[],
	) => void,
	maxScrobbles?: number,
): Promise<LastfmScrobble[]> {
	const allScrobbles: LastfmScrobble[] = [];
	let page = 1;
	let totalPages = 1;

	while (page <= totalPages) {
		// Stop if we've reached the max scrobbles limit
		if (maxScrobbles && allScrobbles.length >= maxScrobbles) {
			break;
		}

		// Retry logic for individual pages
		let retries = 3;
		let success = false;
		let data: Awaited<ReturnType<typeof fetchRecentTracksPage>> | null = null;

		while (retries > 0 && !success) {
			try {
				data = await fetchRecentTracksPage(username, apiKey, page);
				success = true;
			} catch (error) {
				retries--;
				if (retries === 0) {
					// If all retries failed, throw error with context
					throw new Error(
						`Failed to fetch page ${page} after 3 attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
				// Wait a bit longer before retrying
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		if (!data) {
			throw new Error(`Failed to fetch page ${page}`);
		}

		const tracks = data.recenttracks.track;

		// Filter out "now playing" track (doesn't have date)
		const scrobbles = tracks.filter((track) => track.date);
		allScrobbles.push(...scrobbles);

		totalPages = Number(data.recenttracks["@attr"].totalPages);

		onProgress?.(page, totalPages, allScrobbles.length, [...allScrobbles]);

		page++;

		// Respect rate limits - small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	// Trim to exact max if we went over
	if (maxScrobbles && allScrobbles.length > maxScrobbles) {
		return allScrobbles.slice(0, maxScrobbles);
	}

	return allScrobbles;
}
