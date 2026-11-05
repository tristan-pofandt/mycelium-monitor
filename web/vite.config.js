import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const API = process.env.API_URL || "http://127.0.0.1:8100"; // the Flask server in ../server

export default defineConfig({
  plugins: [react()],
  // The 3D map never asks for WebGPU; a stub keeps three's WebGPU build out of its chunk.
  resolve: { alias: [{ find: /^three\/webgpu$/, replacement: fileURLToPath(new URL("src/panels/no-webgpu.js", import.meta.url)) }] },
  test: { environment: "jsdom", include: ["src/**/*.test.{js,jsx}"], setupFiles: ["src/test-setup.js"] },
  build: { outDir: "dist", emptyOutDir: true },
  server: { host: "127.0.0.1", proxy: { "/api": API, "/healthz": API } },
});
