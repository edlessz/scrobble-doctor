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
	enabled = false,
) {
	const [progress, setProgress] = useState<FetchProgress>({
		currentPage: 0,
		totalPages: 0,
		scrobblesFetched: 0,
	});
	const [liveData, setLiveData] = useState<LastfmScrobble[]>([]);

	const query = useQuery<LastfmScrobble[]>({
		queryKey: ["lastfm", "allScrobbles", username, maxScrobbles],
		queryFn: async () => {
			setLiveData([]); // Reset live data when starting new fetch
			const result = await fetchAllScrobbles(
				username,
				apiKey,
				(currentPage, totalPages, scrobblesFetched, allScrobbles) => {
					setProgress({ currentPage, totalPages, scrobblesFetched });
					if (allScrobbles) {
						setLiveData(allScrobbles); // Update live data as we fetch
					}
				},
				maxScrobbles,
			);
			return result;
		},
		enabled: enabled && !!username && !!apiKey, // Only fetch when enabled and credentials exist
		staleTime: Number.POSITIVE_INFINITY, // Cache forever (until manual refetch)
		gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
	});

	return {
		...query,
		progress,
		liveData,
	};
}
