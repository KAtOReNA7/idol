/** TEST ONLY isolated host. No application routes, production data or APIs. */
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4178,
    strictPort: true,
    fs: {allow: [fileURLToPath(new URL('../../', import.meta.url))]},
  },
  build: {
    outDir: 'browser-fixture-dist',
    emptyOutDir: false,
  },
});
