import { defineConfig } from 'astro/config';

// Configuration minimale Astro 5 pour skills.claude-craft.dev.
// Déploiement cible : Cloudflare Pages (SSG).
export default defineConfig({
  site: 'https://skills.claude-craft.dev',
  output: 'static',
  build: {
    assets: 'assets',
  },
});
