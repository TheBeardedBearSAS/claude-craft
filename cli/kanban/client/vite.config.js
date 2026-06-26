import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  plugins: [svelte()],
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
    // Keep every font as a same-origin file. Vite's default 4 KB inline limit
    // emitted small subsets as data:font/woff base64 URLs, which the strict CSP
    // (default-src 'self') blocks → console errors + Lighthouse best-practices
    // and font-render churn that delayed FCP/LCP. 0 = never inline.
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://127.0.0.1:3737',
    },
  },
});
