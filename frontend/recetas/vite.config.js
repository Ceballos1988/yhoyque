import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    outDir: "dist",
    manifest: true,
    assetsDir: "assets",
    rollupOptions: {
      input: "/index.html",
    },
    copyPublicDir: true,
  },
});
