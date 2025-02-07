import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/',  // Asegura que los recursos se sirvan desde la raíz
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://yhoyque.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    manifest: true,
    assetsDir: "assets",
    rollupOptions: {
      input: "index.html",
    },
    copyPublicDir: true,
  },
});
