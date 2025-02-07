import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/',  // Mantiene la base desde raíz
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
      input: "/index.html",  // Cambia la ruta para asegurar que apunta a la raíz
    },
    copyPublicDir: true,
  },
});
