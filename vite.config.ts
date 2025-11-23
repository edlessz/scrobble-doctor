import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
	base: `/${pkg.name}/`,
	plugins: [react(), tailwindcss()],
});
