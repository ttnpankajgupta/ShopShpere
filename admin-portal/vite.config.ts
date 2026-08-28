import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_API_TIMEOUT_MS: '10000',
    },
  },
});
