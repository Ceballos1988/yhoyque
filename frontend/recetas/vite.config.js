import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://yhoyque.onrender.com",  // Cambiar al backend correcto
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

