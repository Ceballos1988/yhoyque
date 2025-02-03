import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: "frontend/recetas", // Asegura que esta es la ruta correcta
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://yhoyque-producción.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "src/main.jsx", // Asegura que Vite use src/main.jsx como punto de entrada
    },
  },
});
