import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},

	server: {
		port: 5173,
		host: true,
		open: false,
	},
	define: {
		global: "globalThis",
	},
	optimizeDeps: {
		include: ["@rainbow-me/rainbowkit", "wagmi", "viem"],
	},
	build: {
		rollupOptions: {
			// external: ["@chakra-ui/react"],
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					chakra: [
						"@chakra-ui/react",
						"@emotion/react",
						"@emotion/styled",
					],
					web3: ["@rainbow-me/rainbowkit", "wagmi", "viem"],
				},
			},
		},
	},
	target: "esnext",
	minify: "esbuild",
});
