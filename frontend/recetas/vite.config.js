import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./", // <- Asegura que los archivos se resuelvan correctamente en Vercel
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
      input: "src/main.jsx", // Asegura que apunte al archivo correcto
    },
  },
});
