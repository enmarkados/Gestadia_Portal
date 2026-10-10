import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("./app", import.meta.url)),
  base: "/",
  plugins: [react()],
  build: { outDir: "../dist-app", emptyOutDir: true, target: "es2022" },
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
    fs: { allow: [".."] },
    proxy: {
      "/api": process.env.GESTADIA_API_PROXY || "http://localhost:3001",
      "/lidia": {
        target:
          process.env.GESTADIA_LIDIA_PROXY || "https://lidia.gestadia.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lidia/, ""),
        timeout: 180000,
        proxyTimeout: 180000,
      },
    },
  },
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
});
