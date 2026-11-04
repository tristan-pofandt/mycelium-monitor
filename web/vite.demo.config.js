// The fictional demo (src/demo), built on its own into ../demo/dist and served by ../demo/server.py.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const DEMO_API = process.env.DEMO_API_URL || "http://127.0.0.1:8200";

export default defineConfig({
  root: fileURLToPath(new URL("./src/demo", import.meta.url)),
  plugins: [react()],
  build: { outDir: fileURLToPath(new URL("../demo/dist", import.meta.url)), emptyOutDir: true },
  server: { host: "127.0.0.1", port: 5174, proxy: { "/api": DEMO_API } },
});
