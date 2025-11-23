import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false,
		},
	},
});

const root = document.getElementById("root");
if (!root) throw new Error("Failed to find the root element");

createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</StrictMode>,
);
