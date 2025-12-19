# Ferramentas React - Configuracao e Otimizacao

## Ferramentas de Build

### Vite - Recomendado para Novos Projetos

#### Instalacao e Configuracao

```bash
# Criar um novo projeto
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

  // Aliases de caminho
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

  // Configuracao do servidor de desenvolvimento
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

  // Otimizacao de build
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
    // Aumentar limite de tamanho se necessario
    chunkSizeWarningLimit: 1000
  },

  // Variaveis de ambiente
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Configuracao CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

#### Arquivos .env

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_FEATURE_NEW_DASHBOARD=true

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_FEATURE_NEW_DASHBOARD=false

# .env.local (gitignored - segredos)
VITE_API_KEY=chave-secreta-aqui
```

#### Uso de Variaveis de Ambiente

```typescript
// src/config/env.ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
} as const;

// Validacao de variaveis de ambiente
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${envVar}`);
  }
});
```

### Next.js - Framework Full-Stack

#### Instalacao

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

  // Otimizacao de imagens
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Redirecionamentos
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true
      }
    ];
  },

  // Headers personalizados
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

  // Variaveis de ambiente expostas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Configuracao webpack personalizada
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

## Gerenciadores de Pacotes

### NPM

```bash
# Instalacao
npm install

# Adicionar dependencia
npm install react-query

# Adicionar dependencia de dev
npm install -D @types/node

# Atualizar dependencias
npm update

# Auditar vulnerabilidades
npm audit
npm audit fix

# Limpar cache
npm cache clean --force
```

### PNPM - Recomendado

**Vantagens**:
- Mais rapido que npm
- Usa menos espaco em disco (symlinks)
- Gerenciamento rigoroso de dependencias

```bash
# Instalacao global
npm install -g pnpm

# Inicializar projeto
pnpm create vite my-app -- --template react-ts

# Instalacao
pnpm install

# Adicionar dependencia
pnpm add react-query

# Adicionar dependencia de dev
pnpm add -D @types/node

# Scripts
pnpm dev
pnpm build
pnpm test
```

#### .npmrc (Configuracao PNPM)

```
# .npmrc
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
```

### Yarn

```bash
# Instalacao
yarn install

# Adicionar dependencia
yarn add react-query

# Adicionar dependencia de dev
yarn add -D @types/node

# Scripts
yarn dev
yarn build
yarn test
```

## Configuracao Docker

### Dockerfile (Build Multi-estagio)

```dockerfile
# Dockerfile
# Estagio 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar arquivos de dependencia
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm e dependencias
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Estagio 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Construir aplicacao
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Estagio 3: Runner (Producao)
FROM nginx:alpine AS runner

# Copiar configuracao nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta
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

    # Compressao
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Headers de cache
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

        # Headers de seguranca
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip
        gzip on;
        gzip_vary on;

        # Roteamento SPA
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache de assets estaticos
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

  # API Backend (exemplo)
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

## Makefile para Automacao

### Makefile Completo

```makefile
# Variaveis
DOCKER_COMPOSE = docker-compose
DOCKER_EXEC = $(DOCKER_COMPOSE) exec frontend
NPM = pnpm

# Cores para output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # Sem Cor

.PHONY: help
help: ## Exibir ajuda
	@echo "$(BLUE)Comandos disponiveis:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Instalacao
.PHONY: install
install: ## Instalar dependencias
	@echo "$(BLUE)Instalando dependencias...$(NC)"
	$(NPM) install

.PHONY: install-ci
install-ci: ## Instalar dependencias (CI)
	@echo "$(BLUE)Instalando dependencias (CI)...$(NC)"
	$(NPM) install --frozen-lockfile

# Desenvolvimento
.PHONY: dev
dev: ## Iniciar servidor de desenvolvimento
	@echo "$(BLUE)Iniciando servidor de desenvolvimento...$(NC)"
	$(NPM) run dev

.PHONY: build
build: ## Construir aplicacao
	@echo "$(BLUE)Construindo aplicacao...$(NC)"
	$(NPM) run build

.PHONY: preview
preview: build ## Visualizar build
	@echo "$(BLUE)Visualizando build...$(NC)"
	$(NPM) run preview

# Testes
.PHONY: test
test: ## Executar testes
	@echo "$(BLUE)Executando testes...$(NC)"
	$(NPM) run test

.PHONY: test-watch
test-watch: ## Executar testes em modo watch
	@echo "$(BLUE)Executando testes (watch)...$(NC)"
	$(NPM) run test:watch

.PHONY: test-coverage
test-coverage: ## Gerar cobertura de testes
	@echo "$(BLUE)Gerando cobertura...$(NC)"
	$(NPM) run test:coverage

.PHONY: test-e2e
test-e2e: ## Executar testes E2E
	@echo "$(BLUE)Executando testes E2E...$(NC)"
	$(NPM) run test:e2e

# Qualidade de codigo
.PHONY: lint
lint: ## Executar linter
	@echo "$(BLUE)Executando linter...$(NC)"
	$(NPM) run lint

.PHONY: lint-fix
lint-fix: ## Corrigir erros de lint
	@echo "$(BLUE)Corrigindo erros de lint...$(NC)"
	$(NPM) run lint:fix

.PHONY: format
format: ## Formatar codigo
	@echo "$(BLUE)Formatando codigo...$(NC)"
	$(NPM) run format

.PHONY: format-check
format-check: ## Verificar formatacao
	@echo "$(BLUE)Verificando formatacao...$(NC)"
	$(NPM) run format:check

.PHONY: type-check
type-check: ## Verificar tipos TypeScript
	@echo "$(BLUE)Verificando tipos...$(NC)"
	$(NPM) run type-check

.PHONY: quality
quality: lint type-check test ## Verificar qualidade do codigo
	@echo "$(GREEN)✓ Qualidade do codigo verificada$(NC)"

# Docker
.PHONY: docker-build
docker-build: ## Construir imagem Docker
	@echo "$(BLUE)Construindo imagem Docker...$(NC)"
	$(DOCKER_COMPOSE) build

.PHONY: docker-up
docker-up: ## Iniciar containers Docker
	@echo "$(BLUE)Iniciando containers...$(NC)"
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Parar containers Docker
	@echo "$(BLUE)Parando containers...$(NC)"
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Visualizar logs Docker
	@echo "$(BLUE)Logs do container...$(NC)"
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-shell
docker-shell: ## Abrir shell no container
	@echo "$(BLUE)Abrindo shell...$(NC)"
	$(DOCKER_EXEC) sh

.PHONY: docker-clean
docker-clean: ## Limpar Docker (containers, imagens, volumes)
	@echo "$(YELLOW)Limpando Docker...$(NC)"
	$(DOCKER_COMPOSE) down -v --rmi all

# Utilitarios
.PHONY: clean
clean: ## Limpar arquivos gerados
	@echo "$(BLUE)Limpando...$(NC)"
	rm -rf node_modules dist build coverage .next

.PHONY: deps-update
deps-update: ## Atualizar dependencias
	@echo "$(BLUE)Atualizando dependencias...$(NC)"
	$(NPM) update

.PHONY: deps-audit
deps-audit: ## Auditar vulnerabilidades
	@echo "$(BLUE)Auditando vulnerabilidades...$(NC)"
	$(NPM) audit

.PHONY: deps-outdated
deps-outdated: ## Verificar dependencias desatualizadas
	@echo "$(BLUE)Dependencias desatualizadas...$(NC)"
	$(NPM) outdated

# Git
.PHONY: pre-commit
pre-commit: lint-fix format test ## Hook pre-commit
	@echo "$(GREEN)✓ Verificacoes pre-commit passaram$(NC)"

# CI/CD
.PHONY: ci
ci: install-ci quality build ## Pipeline CI completo
	@echo "$(GREEN)✓ Pipeline CI concluido$(NC)"

# Producao
.PHONY: deploy-staging
deploy-staging: ## Deploy para staging
	@echo "$(BLUE)Fazendo deploy para staging...$(NC)"
	# Comandos de deployment

.PHONY: deploy-prod
deploy-prod: ## Deploy para producao
	@echo "$(YELLOW)Fazendo deploy para producao...$(NC)"
	# Comandos de deployment

# Monitoramento
.PHONY: analyze-bundle
analyze-bundle: ## Analisar bundle
	@echo "$(BLUE)Analisando bundle...$(NC)"
	$(NPM) run build -- --analyze
```

### Uso do Makefile

```bash
# Exibir ajuda
make help

# Desenvolvimento
make install      # Instalar dependencias
make dev          # Iniciar servidor dev
make build        # Construir aplicacao

# Testes e qualidade
make test         # Testes unitarios
make test-e2e     # Testes E2E
make lint         # Linter
make format       # Formatar
make quality      # Verificar tudo

# Docker
make docker-build # Construir imagem
make docker-up    # Iniciar
make docker-down  # Parar
make docker-logs  # Ver logs

# CI
make ci           # Pipeline completo
```

## Otimizacao de Build

### Code Splitting

```typescript
// Lazy loading de rotas
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

### Analise de Bundle

```bash
# Instalar plugin
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.ts
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

# Construir e analisar
npm run build
# Abre automaticamente stats.html
```

### Tree Shaking

```typescript
// ✅ Bom - Import especifico
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';

// ❌ Ruim - Import global
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

## Conclusao

Boas ferramentas permitem:

1. ✅ **Desenvolvimento rapido**: HMR, TypeScript, ESLint
2. ✅ **Build otimizado**: Code splitting, tree shaking, compressao
3. ✅ **Qualidade**: Testes automaticos, linting, formatacao
4. ✅ **Deployment**: Docker, CI/CD, multiplos ambientes
5. ✅ **Manutencao**: Makefile, scripts NPM, documentacao

**Regra de ouro**: Invista tempo na configuracao de ferramentas no inicio do projeto para economizar muito tempo depois.
