import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Keep app configuration typed against the same Vite instance used by the build.
// Vitest uses its default 'node' environment for the unit tests.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
});
