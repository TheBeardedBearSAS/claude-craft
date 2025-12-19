# Herramientas React - Configuración y Optimización

## Herramientas de Construcción

### Vite - Recomendado para Proyectos Nuevos

#### Instalación y Configuración

```bash
# Crear un nuevo proyecto
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

  // Alias de rutas
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

  // Configuración del servidor de desarrollo
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

  // Optimización de construcción
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar chunks de vendors
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod']
        }
      }
    },
    // Aumentar límite de tamaño si es necesario
    chunkSizeWarningLimit: 1000
  },

  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Configuración CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

#### Archivos .env

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_FEATURE_NEW_DASHBOARD=true

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_FEATURE_NEW_DASHBOARD=false

# .env.local (gitignored - secretos)
VITE_API_KEY=secret-key-here
```

#### Uso de Variables de Entorno

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
} as const;

// Validación de variables de entorno
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Next.js - Framework Full-Stack

#### Instalación

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

  // Optimización de imágenes
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Redirecciones
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true
      }
    ];
  },

  // Encabezados personalizados
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

  // Variables de entorno expuestas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Configuración webpack personalizada
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

## Gestores de Paquetes

### NPM

```bash
# Instalación
npm install

# Agregar una dependencia
npm install react-query

# Agregar una dependencia de desarrollo
npm install -D @types/node

# Actualizar dependencias
npm update

# Auditar vulnerabilidades
npm audit
npm audit fix

# Limpiar caché
npm cache clean --force
```

### PNPM - Recomendado

**Ventajas**:
- Más rápido que npm
- Usa menos espacio en disco (symlinks)
- Gestión estricta de dependencias

```bash
# Instalación global
npm install -g pnpm

# Inicializar un proyecto
pnpm create vite my-app -- --template react-ts

# Instalación
pnpm install

# Agregar una dependencia
pnpm add react-query

# Agregar una dependencia de desarrollo
pnpm add -D @types/node

# Scripts
pnpm dev
pnpm build
pnpm test
```

#### .npmrc (Configuración PNPM)

```
# .npmrc
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
```

### Yarn

```bash
# Instalación
yarn install

# Agregar una dependencia
yarn add react-query

# Agregar una dependencia de desarrollo
yarn add -D @types/node

# Scripts
yarn dev
yarn build
yarn test
```

## Configuración Docker

### Dockerfile (Construcción Multi-etapa)

```dockerfile
# Dockerfile
# Etapa 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Etapa 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de construcción
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Construir la aplicación
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Etapa 3: Runner (Producción)
FROM nginx:alpine AS runner

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
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

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Encabezados de caché
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

        # Encabezados de seguridad
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip
        gzip on;
        gzip_vary on;

        # Enrutamiento SPA
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cachear activos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Proxy API (opcional)
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

  # Backend API (ejemplo)
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

## Makefile para Automatización

### Makefile Completo

```makefile
# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = $(DOCKER_COMPOSE) exec frontend
NPM = pnpm

# Colores para salida
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

.PHONY: help
help: ## Mostrar ayuda
	@echo "$(BLUE)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Instalación
.PHONY: install
install: ## Instalar dependencias
	@echo "$(BLUE)Instalando dependencias...$(NC)"
	$(NPM) install

.PHONY: install-ci
install-ci: ## Instalar dependencias (CI)
	@echo "$(BLUE)Instalando dependencias (CI)...$(NC)"
	$(NPM) install --frozen-lockfile

# Desarrollo
.PHONY: dev
dev: ## Iniciar servidor de desarrollo
	@echo "$(BLUE)Iniciando servidor de desarrollo...$(NC)"
	$(NPM) run dev

.PHONY: build
build: ## Construir la aplicación
	@echo "$(BLUE)Construyendo aplicación...$(NC)"
	$(NPM) run build

.PHONY: preview
preview: build ## Previsualizar la construcción
	@echo "$(BLUE)Previsualizando construcción...$(NC)"
	$(NPM) run preview

# Tests
.PHONY: test
test: ## Ejecutar tests
	@echo "$(BLUE)Ejecutando tests...$(NC)"
	$(NPM) run test

.PHONY: test-watch
test-watch: ## Ejecutar tests en modo watch
	@echo "$(BLUE)Ejecutando tests (watch)...$(NC)"
	$(NPM) run test:watch

.PHONY: test-coverage
test-coverage: ## Generar cobertura de tests
	@echo "$(BLUE)Generando cobertura...$(NC)"
	$(NPM) run test:coverage

.PHONY: test-e2e
test-e2e: ## Ejecutar tests E2E
	@echo "$(BLUE)Ejecutando tests E2E...$(NC)"
	$(NPM) run test:e2e

# Calidad de código
.PHONY: lint
lint: ## Ejecutar linter
	@echo "$(BLUE)Ejecutando linter...$(NC)"
	$(NPM) run lint

.PHONY: lint-fix
lint-fix: ## Corregir errores de lint
	@echo "$(BLUE)Corrigiendo errores de lint...$(NC)"
	$(NPM) run lint:fix

.PHONY: format
format: ## Formatear código
	@echo "$(BLUE)Formateando código...$(NC)"
	$(NPM) run format

.PHONY: format-check
format-check: ## Verificar formateo
	@echo "$(BLUE)Verificando formateo...$(NC)"
	$(NPM) run format:check

.PHONY: type-check
type-check: ## Verificar tipos TypeScript
	@echo "$(BLUE)Verificando tipos...$(NC)"
	$(NPM) run type-check

.PHONY: quality
quality: lint type-check test ## Verificar calidad de código
	@echo "$(GREEN)✓ Calidad de código verificada$(NC)"

# Docker
.PHONY: docker-build
docker-build: ## Construir imagen Docker
	@echo "$(BLUE)Construyendo imagen Docker...$(NC)"
	$(DOCKER_COMPOSE) build

.PHONY: docker-up
docker-up: ## Iniciar contenedores Docker
	@echo "$(BLUE)Iniciando contenedores...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Detener contenedores Docker
	@echo "$(BLUE)Deteniendo contenedores...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Ver logs de Docker
	@echo "$(BLUE)Logs de contenedores...$(NC)"
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-shell
docker-shell: ## Abrir shell en contenedor
	@echo "$(BLUE)Abriendo shell...$(NC)"
	$(DOCKER_EXEC) sh

.PHONY: docker-clean
docker-clean: ## Limpiar Docker (contenedores, imágenes, volúmenes)
	@echo "$(YELLOW)Limpiando Docker...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all

# Utilidades
.PHONY: clean
clean: ## Limpiar archivos generados
	@echo "$(BLUE)Limpiando...$(NC)"
	rm -rf node_modules dist build coverage .next

.PHONY: deps-update
deps-update: ## Actualizar dependencias
	@echo "$(BLUE)Actualizando dependencias...$(NC)"
	$(NPM) update

.PHONY: deps-audit
deps-audit: ## Auditar vulnerabilidades
	@echo "$(BLUE)Auditando vulnerabilidades...$(NC)"
	$(NPM) audit

.PHONY: deps-outdated
deps-outdated: ## Verificar dependencias desactualizadas
	@echo "$(BLUE)Dependencias desactualizadas...$(NC)"
	$(NPM) outdated

# Git
.PHONY: pre-commit
pre-commit: lint-fix format test ## Hook pre-commit
	@echo "$(GREEN)✓ Verificaciones pre-commit pasadas$(NC)"

# CI/CD
.PHONY: ci
ci: install-ci quality build ## Pipeline CI completo
	@echo "$(GREEN)✓ Pipeline CI completado$(NC)"

# Producción
.PHONY: deploy-staging
deploy-staging: ## Desplegar a staging
	@echo "$(BLUE)Desplegando a staging...$(NC)"
	# Comandos de despliegue

.PHONY: deploy-prod
deploy-prod: ## Desplegar a producción
	@echo "$(YELLOW)Desplegando a producción...$(NC)"
	# Comandos de despliegue

# Monitoreo
.PHONY: analyze-bundle
analyze-bundle: ## Analizar bundle
	@echo "$(BLUE)Analizando bundle...$(NC)"
	$(NPM) run build -- --analyze
```

### Uso del Makefile

```bash
# Mostrar ayuda
make help

# Desarrollo
make install      # Instalar dependencias
make dev          # Iniciar servidor dev
make build        # Construir aplicación

# Tests y calidad
make test         # Tests unitarios
make test-e2e     # Tests E2E
make lint         # Linter
make format       # Formatear
make quality      # Verificar todo

# Docker
make docker-build # Construir imagen
make docker-up    # Iniciar
make docker-down  # Detener
make docker-logs  # Ver logs

# CI
make ci           # Pipeline completo
```

## Optimización de Construcción

### Code Splitting

```typescript
// Lazy loading de rutas
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

### Análisis de Bundle

```bash
# Instalar plugin
npm install -D rollup-plugin-visualizer

# Agregar a vite.config.ts
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

# Construir y analizar
npm run build
# Abre automáticamente stats.html
```

### Tree Shaking

```typescript
// ✅ Bueno - Importación específica
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';

// ❌ Malo - Importación global
import * as React from 'react';
import * as utils from '@/utils';
```

## Scripts NPM Completos

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

## Conclusión

Un buen tooling permite:

1. ✅ **Desarrollo rápido**: HMR, TypeScript, ESLint
2. ✅ **Construcción optimizada**: Code splitting, tree shaking, compresión
3. ✅ **Calidad**: Tests automáticos, linting, formateo
4. ✅ **Despliegue**: Docker, CI/CD, múltiples entornos
5. ✅ **Mantenimiento**: Makefile, scripts NPM, documentación

**Regla de oro**: Invertir tiempo en configurar el tooling al inicio del proyecto ahorra un tiempo enorme posteriormente.
