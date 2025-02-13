import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // Si despliegas en un subdirectorio, cambia esto
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
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    manifest: true,
    rollupOptions: {
      input: "index.html", // Asegura que index.html esté en dist
    },
    copyPublicDir: true, // Copia automáticamente archivos de public/
    emptyOutDir: true, // Borra dist/ antes de generar nuevos archivos
  },
});
