import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno de manera segura sin `process`
  const env = loadEnv(mode, import.meta.url);

  return {
    base: "/", // Asegura rutas absolutas para Netlify y PWA
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
        input: "index.html",
      },
      copyPublicDir: true,
      emptyOutDir: true,
    },
    define: {
      "import.meta.env.APP_ENV": JSON.stringify(env.APP_ENV || "development"),
    },
    esbuild: {
      drop: env.MODE === "production" ? ["console"] : [],
    },
  };
});
