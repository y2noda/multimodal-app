import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@frontend": path.resolve(__dirname, "./src/frontend"),
			"@backend": path.resolve(__dirname, "./src/backend"),
			"@shared": path.resolve(__dirname, "./src/shared")
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:8080",
				changeOrigin: true,
				ws: true,
			}
		}
	}
});
