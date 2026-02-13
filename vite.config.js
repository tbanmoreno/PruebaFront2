import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Necesitas instalar @types/node si usas TS, en JS funciona directo

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Esto te permite usar '@' para referirte a la carpeta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Puerto estándar de Vite
    proxy: {
      // Opcional: Útil si quieres evitar problemas de CORS en LOCAL
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})