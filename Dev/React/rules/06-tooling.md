# Tooling React - Configuration et Optimisation

## Build Tools

### Vite - Recommandé pour Nouveaux Projets

#### Installation et Configuration

```bash
# Créer un nouveau projet
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

#### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Alias de chemins
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Optimisation du build
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod']
        }
      }
    },
    // Augmenter la limite de taille si nécessaire
    chunkSizeWarningLimit: 1000
  },

  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Configuration CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

#### .env Files

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_FEATURE_NEW_DASHBOARD=true

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_FEATURE_NEW_DASHBOARD=false

# .env.local (gitignored - secrets)
VITE_API_KEY=secret-key-here
```

#### Usage des Variables d'Environnement

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
} as const;

// Validation des variables d'environnement
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Next.js - Framework Full-Stack

#### Installation

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
```

#### next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode
  reactStrictMode: true,

  // Optimisation des images
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true
      }
    ];
  },

  // Headers personnalisés
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },

  // Variables d'environnement exposées
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Webpack custom config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};

export default nextConfig;
```

## Gestionnaires de Paquets

### NPM

```bash
# Installation
npm install

# Ajouter une dépendance
npm install react-query

# Ajouter une dev dependency
npm install -D @types/node

# Mettre à jour les dépendances
npm update

# Auditer les vulnérabilités
npm audit
npm audit fix

# Nettoyer le cache
npm cache clean --force
```

### PNPM - Recommandé

**Avantages** :
- Plus rapide que npm
- Utilise moins d'espace disque (symlinks)
- Gestion stricte des dépendances

```bash
# Installation globale
npm install -g pnpm

# Initialiser un projet
pnpm create vite my-app -- --template react-ts

# Installation
pnpm install

# Ajouter une dépendance
pnpm add react-query

# Ajouter une dev dependency
pnpm add -D @types/node

# Scripts
pnpm dev
pnpm build
pnpm test
```

#### .npmrc (Configuration PNPM)

```
# .npmrc
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
```

### Yarn

```bash
# Installation
yarn install

# Ajouter une dépendance
yarn add react-query

# Ajouter une dev dependency
yarn add -D @types/node

# Scripts
yarn dev
yarn build
yarn test
```

## Docker Configuration

### Dockerfile (Multi-stage Build)

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer pnpm et les dépendances
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build l'application
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Stage 3: Runner (Production)
FROM nginx:alpine AS runner

# Copier la config nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Cache headers
    map $sent_http_content_type $expires {
        default                    off;
        text/html                  epoch;
        text/css                   max;
        application/javascript     max;
        ~image/                    max;
    }

    expires $expires;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip
        gzip on;
        gzip_vary on;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy (optionnel)
        location /api {
            proxy_pass http://backend:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend React
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8000}
    ports:
      - '3000:80'
    environment:
      - NODE_ENV=production
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost/']
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API (exemple)
  backend:
    image: backend-api:latest
    ports:
      - '8000:8000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  node_modules:
```

### .dockerignore

```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
README.md
.vscode
.idea
dist
build
coverage
*.md
.husky
```

## Makefile pour Automatisation

### Makefile Complet

```makefile
# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = $(DOCKER_COMPOSE) exec frontend
NPM = pnpm

# Couleurs pour l'output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

.PHONY: help
help: ## Afficher l'aide
	@echo "$(BLUE)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Installation
.PHONY: install
install: ## Installer les dépendances
	@echo "$(BLUE)Installation des dépendances...$(NC)"
	$(NPM) install

.PHONY: install-ci
install-ci: ## Installer les dépendances (CI)
	@echo "$(BLUE)Installation des dépendances (CI)...$(NC)"
	$(NPM) install --frozen-lockfile

# Développement
.PHONY: dev
dev: ## Lancer le serveur de développement
	@echo "$(BLUE)Démarrage du serveur de développement...$(NC)"
	$(NPM) run dev

.PHONY: build
build: ## Build l'application
	@echo "$(BLUE)Build de l'application...$(NC)"
	$(NPM) run build

.PHONY: preview
preview: build ## Preview du build
	@echo "$(BLUE)Preview du build...$(NC)"
	$(NPM) run preview

# Tests
.PHONY: test
test: ## Lancer les tests
	@echo "$(BLUE)Lancement des tests...$(NC)"
	$(NPM) run test

.PHONY: test-watch
test-watch: ## Lancer les tests en mode watch
	@echo "$(BLUE)Lancement des tests (watch)...$(NC)"
	$(NPM) run test:watch

.PHONY: test-coverage
test-coverage: ## Générer le coverage des tests
	@echo "$(BLUE)Génération du coverage...$(NC)"
	$(NPM) run test:coverage

.PHONY: test-e2e
test-e2e: ## Lancer les tests E2E
	@echo "$(BLUE)Lancement des tests E2E...$(NC)"
	$(NPM) run test:e2e

# Qualité de code
.PHONY: lint
lint: ## Lancer le linter
	@echo "$(BLUE)Lancement du linter...$(NC)"
	$(NPM) run lint

.PHONY: lint-fix
lint-fix: ## Corriger les erreurs de lint
	@echo "$(BLUE)Correction des erreurs de lint...$(NC)"
	$(NPM) run lint:fix

.PHONY: format
format: ## Formater le code
	@echo "$(BLUE)Formatage du code...$(NC)"
	$(NPM) run format

.PHONY: format-check
format-check: ## Vérifier le formatage
	@echo "$(BLUE)Vérification du formatage...$(NC)"
	$(NPM) run format:check

.PHONY: type-check
type-check: ## Vérifier les types TypeScript
	@echo "$(BLUE)Vérification des types...$(NC)"
	$(NPM) run type-check

.PHONY: quality
quality: lint type-check test ## Vérifier la qualité du code
	@echo "$(GREEN)✓ Qualité du code vérifiée$(NC)"

# Docker
.PHONY: docker-build
docker-build: ## Build l'image Docker
	@echo "$(BLUE)Build de l'image Docker...$(NC)"
	$(DOCKER_COMPOSE) build

.PHONY: docker-up
docker-up: ## Démarrer les containers Docker
	@echo "$(BLUE)Démarrage des containers...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Arrêter les containers Docker
	@echo "$(BLUE)Arrêt des containers...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Voir les logs Docker
	@echo "$(BLUE)Logs des containers...$(NC)"
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-shell
docker-shell: ## Ouvrir un shell dans le container
	@echo "$(BLUE)Ouverture du shell...$(NC)"
	$(DOCKER_EXEC) sh

.PHONY: docker-clean
docker-clean: ## Nettoyer Docker (containers, images, volumes)
	@echo "$(YELLOW)Nettoyage de Docker...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all

# Utilitaires
.PHONY: clean
clean: ## Nettoyer les fichiers générés
	@echo "$(BLUE)Nettoyage...$(NC)"
	rm -rf node_modules dist build coverage .next

.PHONY: deps-update
deps-update: ## Mettre à jour les dépendances
	@echo "$(BLUE)Mise à jour des dépendances...$(NC)"
	$(NPM) update

.PHONY: deps-audit
deps-audit: ## Auditer les vulnérabilités
	@echo "$(BLUE)Audit des vulnérabilités...$(NC)"
	$(NPM) audit

.PHONY: deps-outdated
deps-outdated: ## Vérifier les dépendances obsolètes
	@echo "$(BLUE)Dépendances obsolètes...$(NC)"
	$(NPM) outdated

# Git
.PHONY: pre-commit
pre-commit: lint-fix format test ## Hook pre-commit
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

# CI/CD
.PHONY: ci
ci: install-ci quality build ## Pipeline CI complète
	@echo "$(GREEN)✓ CI pipeline completed$(NC)"

# Production
.PHONY: deploy-staging
deploy-staging: ## Déployer en staging
	@echo "$(BLUE)Déploiement en staging...$(NC)"
	# Commandes de déploiement

.PHONY: deploy-prod
deploy-prod: ## Déployer en production
	@echo "$(YELLOW)Déploiement en production...$(NC)"
	# Commandes de déploiement

# Monitoring
.PHONY: analyze-bundle
analyze-bundle: ## Analyser le bundle
	@echo "$(BLUE)Analyse du bundle...$(NC)"
	$(NPM) run build -- --analyze
```

### Usage du Makefile

```bash
# Afficher l'aide
make help

# Développement
make install      # Installer les dépendances
make dev          # Lancer le serveur de dev
make build        # Build l'application

# Tests et qualité
make test         # Tests unitaires
make test-e2e     # Tests E2E
make lint         # Linter
make format       # Formater
make quality      # Tout vérifier

# Docker
make docker-build # Build l'image
make docker-up    # Démarrer
make docker-down  # Arrêter
make docker-logs  # Voir les logs

# CI
make ci           # Pipeline complète
```

## Build Optimization

### Code Splitting

```typescript
// Lazy loading des routes
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
```

### Bundle Analysis

```bash
# Installer le plugin
npm install -D rollup-plugin-visualizer

# Ajouter au vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});

# Build et analyser
npm run build
# Ouvre automatiquement stats.html
```

### Tree Shaking

```typescript
// ✅ Bon - Import spécifique
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';

// ❌ Mauvais - Import global
import * as React from 'react';
import * as utils from '@/utils';
```

## Scripts NPM Complets

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",

    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",

    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",

    "type-check": "tsc --noEmit",

    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",

    "analyze": "vite-bundle-visualizer",

    "prepare": "husky install",
    "pre-commit": "lint-staged"
  }
}
```

## Conclusion

Un bon tooling permet :

1. ✅ **Développement rapide** : HMR, TypeScript, ESLint
2. ✅ **Build optimisé** : Code splitting, tree shaking, compression
3. ✅ **Qualité** : Tests, linting, formatting automatiques
4. ✅ **Déploiement** : Docker, CI/CD, environnements multiples
5. ✅ **Maintenance** : Makefile, scripts NPM, documentation

**Règle d'or** : Investir du temps dans la configuration du tooling au début du projet pour gagner énormément de temps par la suite.
