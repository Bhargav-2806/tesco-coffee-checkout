// Vite plugin that enables React + JSX support
import react from '@vitejs/plugin-react';
// Node path helper for building absolute paths in aliases
import path from 'path';
// defineConfig gives us type hints; loadEnv reads .env files
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load any VITE_* variables from .env files (not strictly needed now, kept for future use)
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        // Lets us import files as '@/components/...' instead of relative paths
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Dev server listens on port 3000 and binds all interfaces (needed inside Docker)
      port: 3000,
      host: '0.0.0.0',
      // During `npm run dev`, any /api/* request is forwarded to the Go backend
      // In a docker-compose network that's http://go-api:8080; running npm on host it's localhost:8080
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
