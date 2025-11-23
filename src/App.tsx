import { useState } from "react";
import { useAllScrobbles } from "./hooks/useLastfm";

const App = () => {
	const [username, setUsername] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [maxScrobbles, setMaxScrobbles] = useState("");

	const max = maxScrobbles ? Number.parseInt(maxScrobbles, 10) : undefined;
	const { data, isLoading, error, refetch, progress } = useAllScrobbles(
		username,
		apiKey,
		max,
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		refetch();
	};

	return (
		<div className="p-8 max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Last.fm Scrobble Doctor 🎧</h1>

			<form onSubmit={handleSubmit} className="mb-8">
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
						placeholder="Leave empty for all scrobbles"
						min="1"
						className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<small className="text-gray-600">
						Limit the number of recent scrobbles to fetch
					</small>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className={`px-6 py-3 text-white border-none rounded ${
						isLoading
							? "bg-gray-400 cursor-not-allowed"
							: "bg-blue-600 hover:bg-blue-700 cursor-pointer"
					}`}
				>
					{isLoading ? "Fetching..." : "Fetch Scrobbles"}
				</button>
			</form>

			{isLoading && (
				<div className="mb-4 p-4 bg-gray-100 rounded">
					<p className="m-0">
						<strong>Progress:</strong> Page {progress.currentPage} /{" "}
						{progress.totalPages}
					</p>
					<p className="mt-2 mb-0">
						<strong>Scrobbles fetched:</strong> {progress.scrobblesFetched}
					</p>
				</div>
			)}

			{error && (
				<div className="p-4 bg-red-100 rounded text-red-700">
					<strong>Error:</strong> {error.message}
				</div>
			)}

			{data && !isLoading && (
				<div className="p-4 bg-green-100 rounded">
					<h2 className="text-2xl font-bold mb-2">Success!</h2>
					<p>
						<strong>Total scrobbles:</strong> {data.length}
					</p>
					<details>
						<summary className="cursor-pointer mt-4">
							Show first 10 scrobbles
						</summary>
						<ul className="mt-4">
							{data.slice(0, 10).map((scrobble) => (
								<li key={`${scrobble.date?.uts}-${scrobble.name}`}>
									<strong>{scrobble.name}</strong> by {scrobble.artist["#text"]}
									{scrobble.album["#text"] && ` - ${scrobble.album["#text"]}`}
								</li>
							))}
						</ul>
					</details>
				</div>
			)}
		</div>
	);
};

export default App;
