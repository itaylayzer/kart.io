import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/kart.io/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  build: {
    outDir: "docs",
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3001", // The address of your Socket.IO server
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
