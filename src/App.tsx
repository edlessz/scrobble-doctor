import { useState } from "react";
import { useAllScrobbles } from "./hooks/useLastfm";

const App = () => {
	// Form input states (what user is typing)
	const [username, setUsername] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [maxScrobbles, setMaxScrobbles] = useState("");

	// Query parameters (what was actually submitted)
	const [queryParams, setQueryParams] = useState<{
		username: string;
		apiKey: string;
		max?: number;
	} | null>(null);

	const { data, isLoading, error, progress, liveData } = useAllScrobbles(
		queryParams?.username || "",
		queryParams?.apiKey || "",
		queryParams?.max,
		!!queryParams, // Enable query when queryParams is set
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const max = maxScrobbles ? Number.parseInt(maxScrobbles, 10) : undefined;
		setQueryParams({ username, apiKey, max });
	};

	// Process scrobbles to find missing data (updates in real-time during fetch)
	// Use liveData during loading for real-time updates, data when complete
	const currentData = isLoading ? liveData : data;
	const problematicScrobbles =
		currentData && currentData.length > 0
			? (() => {
					// Filter scrobbles with missing artist or album
					const withIssues = currentData.filter(
						(scrobble) =>
							!scrobble.artist["#text"] ||
							scrobble.artist["#text"].trim() === "" ||
							!scrobble.album["#text"] ||
							scrobble.album["#text"].trim() === "",
					);

					// Count scrobbles and keep track of unique tracks
					const countMap = new Map<
						string,
						{ scrobble: typeof withIssues[0]; count: number }
					>();
					for (const scrobble of withIssues) {
						const key = `${scrobble.name}-${scrobble.artist["#text"]}`;
						const existing = countMap.get(key);
						if (existing) {
							existing.count++;
						} else {
							countMap.set(key, { scrobble, count: 1 });
						}
					}

					// Convert to array with count information
					const withCounts = Array.from(countMap.values());

					// Sort by scrobble count (descending), then artist, then album
					return withCounts.sort((a, b) => {
						// First sort by count (highest first)
						const countCompare = b.count - a.count;
						if (countCompare !== 0) return countCompare;

						// Then by artist
						const artistCompare = a.scrobble.artist["#text"].localeCompare(
							b.scrobble.artist["#text"],
						);
						if (artistCompare !== 0) return artistCompare;

						// Then by album
						return a.scrobble.album["#text"].localeCompare(b.scrobble.album["#text"]);
					});
				})()
			: [];

	return (
		<div className="p-8 min-h-screen bg-gray-50">
			<h1 className="text-3xl font-bold mb-6 text-center">
				🎧 <a href="https://github.com/edlessz/scrobble-doctor" target="_blank" rel="noopener noreferrer">Last.fm Scrobble Doctor</a>
			</h1>

			<div className="flex gap-6 max-w-7xl mx-auto">
				{/* Left side - Form */}
				<div className="w-96 flex-shrink-0">
					<form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow">
						<div className="mb-4">
							<label htmlFor="username" className="block mb-2 font-medium">
								Last.fm Username:
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter your username"
								required
								className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div className="mb-4">
							<label htmlFor="apiKey" className="block mb-2 font-medium">
								API Key:
							</label>
							<input
								id="apiKey"
								type="text"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder="Enter your API key"
								required
								className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<small className="text-gray-600">
								Create an API key{" "}
								<a
									target="_blank"
									rel="noopener noreferrer"
									href="https://www.last.fm/api/account/create"
									className="text-blue-600 hover:underline"
								>
									here
								</a>
							</small>
						</div>

						<div className="mb-4">
							<label htmlFor="maxScrobbles" className="block mb-2 font-medium">
								Max Scrobbles (optional):
							</label>
							<input
								id="maxScrobbles"
								type="number"
								value={maxScrobbles}
								onChange={(e) => setMaxScrobbles(e.target.value)}
								placeholder="Leave empty for all"
								min="1"
								className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<small className="text-gray-600">Limit recent scrobbles to fetch</small>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className={`w-full px-6 py-3 text-white border-none rounded font-medium ${
								isLoading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 cursor-pointer"
							}`}
						>
							{isLoading ? "Fetching..." : "Fetch Scrobbles"}
						</button>
					</form>

					{isLoading && (
						<div className="p-4 bg-white rounded-lg shadow">
							<p className="m-0 text-sm">
								<strong>Progress:</strong> Page {progress.currentPage} /{" "}
								{queryParams?.max ? Math.ceil(queryParams.max / 200) : progress.totalPages}
							</p>
							<p className="mt-2 mb-0 text-sm">
								<strong>Scrobbles:</strong> {progress.scrobblesFetched}
								{queryParams?.max && ` / ${queryParams.max}`}
							</p>
							<p className="mt-2 mb-0 text-sm text-yellow-600">
								<strong>Issues found:</strong> {problematicScrobbles.length}
							</p>
						</div>
					)}

					{error && (
						<div className="p-4 bg-red-100 rounded-lg shadow text-red-700 text-sm">
							<strong>Error:</strong> {error.message}
						</div>
					)}

					{data && !isLoading && (
						<div className="p-4 bg-white rounded-lg shadow">
							<h2 className="text-lg font-bold mb-2">Summary</h2>
							<p className="text-sm mb-1">
								<strong>Total scrobbles:</strong> {data.length}
							</p>
							<p className="text-sm">
								<strong>Issues found:</strong>{" "}
								<span className={problematicScrobbles.length > 0 ? "text-red-600 font-bold" : "text-green-600"}>
									{problematicScrobbles.length}
								</span>
							</p>
						</div>
					)}
				</div>

				{/* Right side - Table */}
				<div className="flex-1 min-w-0">
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="p-4 bg-gray-100 border-b border-gray-200">
							<h2 className="text-xl font-bold">
								🔍 Scrobbles with Missing Data
								{problematicScrobbles.length > 0 && (
									<span className="ml-2 text-sm font-normal text-gray-600">
										({problematicScrobbles.length} issues)
									</span>
								)}
							</h2>
						</div>

						{/* Table */}
						<div className="overflow-auto max-h-[calc(100vh-200px)]">
							{problematicScrobbles.length > 0 ? (
								<table className="w-full text-sm">
									<thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
										<tr>
											<th className="text-left p-3 font-semibold">Scrobbles</th>
											<th className="text-left p-3 font-semibold">Track</th>
											<th className="text-left p-3 font-semibold">Artist</th>
											<th className="text-left p-3 font-semibold">Album</th>
											<th className="text-left p-3 font-semibold">Last Scrobbled</th>
											<th className="text-left p-3 font-semibold">Missing</th>
											<th className="text-left p-3 font-semibold">Action</th>
										</tr>
									</thead>
									<tbody>
										{problematicScrobbles.map((item) => {
											const { scrobble, count } = item;
											const missingFields: string[] = [];
											const missingArtist =
												!scrobble.artist["#text"] || scrobble.artist["#text"].trim() === "";
											const missingAlbum =
												!scrobble.album["#text"] || scrobble.album["#text"].trim() === "";

											if (missingArtist) missingFields.push("Artist");
											if (missingAlbum) missingFields.push("Album");

											// Format the date
											const lastScrobbled = scrobble.date
												? new Date(Number(scrobble.date.uts) * 1000).toLocaleDateString("en-US", {
														year: "numeric",
														month: "short",
														day: "numeric",
													})
												: "Unknown";

											return (
												<tr
													key={`${scrobble.date?.uts}-${scrobble.name}`}
													className="border-b border-gray-100 hover:bg-gray-50"
												>
													<td className="p-3 font-bold text-blue-600">{count}</td>
													<td className="p-3 font-medium max-w-xs truncate">{scrobble.name}</td>
													<td
														className={`p-3 max-w-xs truncate ${missingArtist ? "text-red-600 italic" : ""}`}
													>
														{scrobble.artist["#text"] || "(missing)"}
													</td>
													<td
														className={`p-3 max-w-xs truncate ${missingAlbum ? "text-red-600 italic" : ""}`}
													>
														{scrobble.album["#text"] || "(missing)"}
													</td>
													<td className="p-3 text-gray-600 whitespace-nowrap">{lastScrobbled}</td>
													<td className="p-3 text-xs text-red-600">{missingFields.join(", ")}</td>
													<td className="p-3">
														<a
															href={scrobble.url.replace(
																"https://www.last.fm/music/",
																`https://www.last.fm/user/${queryParams?.username || ""}/library/music/`,
															)}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-700 hover:underline text-xs whitespace-nowrap"
														>
															Edit →
														</a>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							) : (
								<div className="p-8 text-center text-gray-500">
									{isLoading
										? "Scanning scrobbles... issues will appear here"
										: data
											? "✅ No issues found! All scrobbles have complete data."
											: "Enter your credentials and click 'Fetch Scrobbles' to start"}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
