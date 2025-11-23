import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllScrobbles, fetchRecentTracksPage } from "../services/lastfm";
import type { FetchProgress, LastfmScrobble } from "../types/lastfm";

export function useRecentTracksPage(
	username: string,
	apiKey: string,
	page: number,
	enabled = true,
) {
	return useQuery({
		queryKey: ["lastfm", "recentTracks", username, page],
		queryFn: () => fetchRecentTracksPage(username, apiKey, page),
		enabled: enabled && !!username && !!apiKey,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useAllScrobbles(
	username: string,
	apiKey: string,
	maxScrobbles?: number,
) {
	const [progress, setProgress] = useState<FetchProgress>({
		currentPage: 0,
		totalPages: 0,
		scrobblesFetched: 0,
	});

	const query = useQuery<LastfmScrobble[]>({
		queryKey: ["lastfm", "allScrobbles", username, maxScrobbles],
		queryFn: () =>
			fetchAllScrobbles(
				username,
				apiKey,
				(currentPage, totalPages, scrobblesFetched) => {
					setProgress({ currentPage, totalPages, scrobblesFetched });
				},
				maxScrobbles,
			),
		enabled: false, // Don't auto-fetch, user must trigger
		staleTime: Number.POSITIVE_INFINITY, // Cache forever (until manual refetch)
		gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
	});

	return {
		...query,
		progress,
	};
}
