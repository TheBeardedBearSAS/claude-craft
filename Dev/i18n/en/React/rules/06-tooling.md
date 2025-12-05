# React Tooling - Configuration and Optimization

## Build Tools

### Vite - Recommended for New Projects

#### Installation and Configuration

```bash
# Create a new project
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

  // Path aliases
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

  // Development server configuration
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

  // Build optimization
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod']
        }
      }
    },
    // Increase size limit if necessary
    chunkSizeWarningLimit: 1000
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // CSS configuration
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

#### Environment Variables Usage

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
} as const;

// Environment variables validation
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Next.js - Full-Stack Framework

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

  // Image optimization
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true
      }
    ];
  },

  // Custom headers
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

  // Exposed environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Custom webpack config
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

## Package Managers

### NPM

```bash
# Installation
npm install

# Add a dependency
npm install react-query

# Add a dev dependency
npm install -D @types/node

# Update dependencies
npm update

# Audit vulnerabilities
npm audit
npm audit fix

# Clean cache
npm cache clean --force
```

### PNPM - Recommended

**Advantages**:
- Faster than npm
- Uses less disk space (symlinks)
- Strict dependency management

```bash
# Global installation
npm install -g pnpm

# Initialize a project
pnpm create vite my-app -- --template react-ts

# Installation
pnpm install

# Add a dependency
pnpm add react-query

# Add a dev dependency
pnpm add -D @types/node

# Scripts
pnpm dev
pnpm build
pnpm test
```

#### .npmrc (PNPM Configuration)

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

# Add a dependency
yarn add react-query

# Add a dev dependency
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

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Stage 3: Runner (Production)
FROM nginx:alpine AS runner

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
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

        # API proxy (optional)
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
  # React Frontend
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

  # Backend API (example)
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

## Makefile for Automation

### Complete Makefile

```makefile
# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = $(DOCKER_COMPOSE) exec frontend
NPM = pnpm

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

.PHONY: help
help: ## Display help
	@echo "$(BLUE)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Installation
.PHONY: install
install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	$(NPM) install

.PHONY: install-ci
install-ci: ## Install dependencies (CI)
	@echo "$(BLUE)Installing dependencies (CI)...$(NC)"
	$(NPM) install --frozen-lockfile

# Development
.PHONY: dev
dev: ## Start development server
	@echo "$(BLUE)Starting development server...$(NC)"
	$(NPM) run dev

.PHONY: build
build: ## Build the application
	@echo "$(BLUE)Building application...$(NC)"
	$(NPM) run build

.PHONY: preview
preview: build ## Preview the build
	@echo "$(BLUE)Previewing build...$(NC)"
	$(NPM) run preview

# Tests
.PHONY: test
test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	$(NPM) run test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests (watch)...$(NC)"
	$(NPM) run test:watch

.PHONY: test-coverage
test-coverage: ## Generate test coverage
	@echo "$(BLUE)Generating coverage...$(NC)"
	$(NPM) run test:coverage

.PHONY: test-e2e
test-e2e: ## Run E2E tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	$(NPM) run test:e2e

# Code quality
.PHONY: lint
lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	$(NPM) run lint

.PHONY: lint-fix
lint-fix: ## Fix lint errors
	@echo "$(BLUE)Fixing lint errors...$(NC)"
	$(NPM) run lint:fix

.PHONY: format
format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	$(NPM) run format

.PHONY: format-check
format-check: ## Check formatting
	@echo "$(BLUE)Checking formatting...$(NC)"
	$(NPM) run format:check

.PHONY: type-check
type-check: ## Check TypeScript types
	@echo "$(BLUE)Checking types...$(NC)"
	$(NPM) run type-check

.PHONY: quality
quality: lint type-check test ## Check code quality
	@echo "$(GREEN)✓ Code quality verified$(NC)"

# Docker
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(NC)"
	$(DOCKER_COMPOSE) build

.PHONY: docker-up
docker-up: ## Start Docker containers
	@echo "$(BLUE)Starting containers...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@echo "$(BLUE)Stopping containers...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## View Docker logs
	@echo "$(BLUE)Container logs...$(NC)"
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-shell
docker-shell: ## Open shell in container
	@echo "$(BLUE)Opening shell...$(NC)"
	$(DOCKER_EXEC) sh

.PHONY: docker-clean
docker-clean: ## Clean Docker (containers, images, volumes)
	@echo "$(YELLOW)Cleaning Docker...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all

# Utilities
.PHONY: clean
clean: ## Clean generated files
	@echo "$(BLUE)Cleaning...$(NC)"
	rm -rf node_modules dist build coverage .next

.PHONY: deps-update
deps-update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	$(NPM) update

.PHONY: deps-audit
deps-audit: ## Audit vulnerabilities
	@echo "$(BLUE)Auditing vulnerabilities...$(NC)"
	$(NPM) audit

.PHONY: deps-outdated
deps-outdated: ## Check outdated dependencies
	@echo "$(BLUE)Outdated dependencies...$(NC)"
	$(NPM) outdated

# Git
.PHONY: pre-commit
pre-commit: lint-fix format test ## Pre-commit hook
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

# CI/CD
.PHONY: ci
ci: install-ci quality build ## Complete CI pipeline
	@echo "$(GREEN)✓ CI pipeline completed$(NC)"

# Production
.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	@echo "$(BLUE)Deploying to staging...$(NC)"
	# Deployment commands

.PHONY: deploy-prod
deploy-prod: ## Deploy to production
	@echo "$(YELLOW)Deploying to production...$(NC)"
	# Deployment commands

# Monitoring
.PHONY: analyze-bundle
analyze-bundle: ## Analyze bundle
	@echo "$(BLUE)Analyzing bundle...$(NC)"
	$(NPM) run build -- --analyze
```

### Makefile Usage

```bash
# Display help
make help

# Development
make install      # Install dependencies
make dev          # Start dev server
make build        # Build application

# Tests and quality
make test         # Unit tests
make test-e2e     # E2E tests
make lint         # Linter
make format       # Format
make quality      # Check everything

# Docker
make docker-build # Build image
make docker-up    # Start
make docker-down  # Stop
make docker-logs  # View logs

# CI
make ci           # Complete pipeline
```

## Build Optimization

### Code Splitting

```typescript
// Lazy loading routes
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
# Install plugin
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
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

# Build and analyze
npm run build
# Automatically opens stats.html
```

### Tree Shaking

```typescript
// ✅ Good - Specific import
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';

// ❌ Bad - Global import
import * as React from 'react';
import * as utils from '@/utils';
```

## Complete NPM Scripts

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

Good tooling enables:

1. ✅ **Fast development**: HMR, TypeScript, ESLint
2. ✅ **Optimized build**: Code splitting, tree shaking, compression
3. ✅ **Quality**: Automatic tests, linting, formatting
4. ✅ **Deployment**: Docker, CI/CD, multiple environments
5. ✅ **Maintenance**: Makefile, NPM scripts, documentation

**Golden rule**: Invest time in tooling configuration at the start of the project to save tremendous time later.
