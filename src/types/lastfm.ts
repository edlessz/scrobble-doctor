export interface LastfmScrobble {
	artist: {
		"#text": string;
		mbid?: string;
	};
	album: {
		"#text": string;
		mbid?: string;
	};
	name: string;
	mbid?: string;
	date?: {
		uts: string;
		"#text": string;
	};
	url: string;
	image: Array<{
		"#text": string;
		size: "small" | "medium" | "large" | "extralarge";
	}>;
	"@attr"?: {
		nowplaying: string;
	};
}

export interface LastfmRecentTracksResponse {
	recenttracks: {
		track: LastfmScrobble[];
		"@attr": {
			user: string;
			totalPages: string;
			page: string;
			perPage: string;
			total: string;
		};
	};
}

export interface FetchProgress {
	currentPage: number;
	totalPages: number;
	scrobblesFetched: number;
}
