import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://yhoyque-producción.up.railway.app",
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
      input: "index.html", // ✅ Vite lo detecta automáticamente
    },
    copyPublicDir: true, // ✅ Asegura que los archivos en public/ se copien bien
  },
});
