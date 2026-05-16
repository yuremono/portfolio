import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import { vitePluginBboxLocalBatch } from './vitePluginBboxLocalBatch'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	base: mode === "production" ? "/portfolio/" : "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [react(), vitePluginBboxLocalBatch(__dirname)],
	build: {
		// three のコア（+ R3F が参照する部分）は minify 後でも ~700KB 超になりやすい。gzip は ~190KB 程度。
		chunkSizeWarningLimit: 800,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "index.html"),
				twonlyTest5: path.resolve(__dirname, "TWonly/test5.html"),
				twonlyTest6: path.resolve(__dirname, "TWonly/test6.html"),
				twonlyTest7: path.resolve(__dirname, "TWonly/test7.html"),
				twonlyTest8: path.resolve(__dirname, "TWonly/test8.html"),
				twonlyAozora: path.resolve(__dirname, "TWonly/aozora.html"),
				twonlyTest26: path.resolve(__dirname, "TWonly/test26.html"),
				twonlyTest9: path.resolve(__dirname, "TWonly/test9.html"),
				twonlyZzzScratch: path.resolve(__dirname, "TWonly/zzzscratch.html"),
				twonlyBbox: path.resolve(__dirname, "TWonly/bbox.html"),
				twonlyBunmyaku: path.resolve(__dirname, "TWonly/bunmyaku.html"),
			},
		},
	},
	server: {
		port: 3000,
		open: false,
	},
	preview: {
		port: 4173,
		open: false,
	},
	test: {
		environment: "happy-dom",
		globals: false,
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
	},
}));
