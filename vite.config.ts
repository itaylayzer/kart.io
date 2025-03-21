import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { obfuscator } from "rollup-obfuscator";
import objs from "vite-plugin-javascript-obfuscator";
import simpleSsl from "@vitejs/plugin-basic-ssl";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		objs({
			apply: "build",
			debugger: true,
			options: {
				splitStrings: true,
				splitStringsChunkLength: 1,
				stringArray: true,
				stringArrayRotate: true,
				stringArrayShuffle: true,
				stringArrayThreshold: 0.75,
				stringArrayIndexShift: true,
				target: "browser",
				compact: true,
				simplify: true,
				debugProtection: true,
				stringArrayWrappersCount: 1,
				stringArrayWrappersChainedCalls: true,
			},
		}),
	],
	base: "/kart.io/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
	build: {
		outDir: "docs",
	},
});
