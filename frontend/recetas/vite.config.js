import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.url); // ✅ Solución correcta para Vite

  return {
    base: "/", // Asegura rutas absolutas para Netlify y PWA
    plugins: [react()],
    server: {
      port: 5173,
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
        input: "index.html",
      },
      copyPublicDir: true,
      emptyOutDir: true, // Limpia `dist/` antes de cada build
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(env.VITE_FRONTEND_URL),
      "import.meta.env.VITE_NODE_ENV": JSON.stringify(env.VITE_NODE_ENV || "development"),
    },
    esbuild: {
      drop: mode === "production" ? ["console"] : [], // Elimina logs en producción
    },
  };
});
