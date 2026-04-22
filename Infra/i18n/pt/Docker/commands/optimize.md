---
description: Otimização de Dockerfile
argument-hint: [arguments]
---

# Otimização de Dockerfile

Você é um Engenheiro DevOps especialista em conteinerização. Você deve analisar e otimizar os Dockerfiles do projeto para reduzir o tamanho da imagem, melhorar os tempos de build e fortalecer a segurança.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Caminho para o Dockerfile (padrão: ./Dockerfile)

Exemplo: `/docker:optimize ./docker/php/Dockerfile`

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

### Etapa 1: Analisar Dockerfile Existente

```bash
# Listar Dockerfiles
find . -name "Dockerfile*" -o -name "*.dockerfile"

# Analisar tamanho da imagem atual
docker images | grep <nome-imagem>

# Histórico de camadas
docker history <nome-imagem> --no-trunc
```

### Etapa 2: Checklist de Otimização

```
══════════════════════════════════════════════════════════════
🐳 ANÁLISE DO DOCKERFILE
══════════════════════════════════════════════════════════════

Arquivo: {caminho}
Imagem base: {imagem base}
Tamanho atual: {tamanho}

──────────────────────────────────────────────────────────────
📋 CHECKLIST DE OTIMIZAÇÃO
──────────────────────────────────────────────────────────────

### Imagem Base
- [ ] Usar imagem slim/alpine se possível
- [ ] Usar versão específica (não :latest)
- [ ] Imagem oficial ou confiável

### Build Multi-Stage
- [ ] Separar build e runtime
- [ ] Copiar apenas artefatos necessários
- [ ] Nomear stages para clareza

### Camadas & Cache
- [ ] Ordenar do menos para o mais mutável
- [ ] Agrupar RUN com &&
- [ ] Limpar no mesmo RUN
- [ ] Usar .dockerignore

### Segurança
- [ ] Sem segredos na imagem
- [ ] Usuário não-root
- [ ] Permissões mínimas
- [ ] Scan de vulnerabilidades

### Performance
- [ ] apt-get clean na mesma camada
- [ ] --no-install-recommends
- [ ] Sem cache desnecessário
```

### Etapa 3: Templates Otimizados por Tecnologia

#### PHP/Symfony

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Dependências Composer
#############################################
FROM composer:2 AS composer

WORKDIR /app

# Copiar apenas arquivos de dependências primeiro (cache)
COPY composer.json composer.lock ./

# Instalar sem dev para produção
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Copiar resto e gerar autoloader
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

#############################################
# STAGE 2: Assets frontend (se aplicável)
#############################################
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

#############################################
# STAGE 3: Runtime de produção
#############################################
FROM php:8.3-fpm-alpine AS runtime

# Instalar extensões PHP necessárias
RUN apk add --no-cache \
        icu-libs \
        libpq \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        postgresql-dev \
        libzip-dev \
    && docker-php-ext-install \
        intl \
        pdo_pgsql \
        zip \
        opcache \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/*

# Configuração PHP para produção
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Criar usuário não-root
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /app

# Copiar aplicação
COPY --from=composer --chown=app:app /app/vendor ./vendor
COPY --from=frontend --chown=app:app /app/public/build ./public/build
COPY --chown=app:app . .

# Aquecer cache
RUN php bin/console cache:warmup --env=prod

USER app

EXPOSE 9000
CMD ["php-fpm"]
```

#### Node.js/React

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Dependências
#############################################
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar apenas arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm ci

#############################################
# STAGE 2: Build
#############################################
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

#############################################
# STAGE 3: Runtime de produção
#############################################
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar apenas o necessário
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### Python/FastAPI

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Build de dependências
#############################################
FROM python:3.12-slim AS builder

WORKDIR /app

# Instalar ferramentas de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Criar e ativar venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#############################################
# STAGE 2: Runtime de produção
#############################################
FROM python:3.12-slim AS runtime

WORKDIR /app

# Apenas dependências de runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiar venv do builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Criar usuário não-root
RUN useradd --create-home --shell /bin/bash app

# Copiar aplicação
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Etapa 4: .dockerignore Otimizado

```dockerignore
# Git
.git
.gitignore
.gitattributes

# IDE
.idea
.vscode
*.swp
*.swo

# Documentação
*.md
!README.md
docs/

# Testes
tests/
__tests__/
*.test.*
coverage/
.pytest_cache/

# Artefatos de build
node_modules/
vendor/
__pycache__/
*.pyc
.mypy_cache/
dist/
build/

# Docker
Dockerfile*
docker-compose*.yml
.docker/

# CI/CD
.github/
.gitlab-ci.yml
.circleci/

# Ambiente
.env*
!.env.example

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
```

### Etapa 5: Análise e Recomendações

```
══════════════════════════════════════════════════════════════
📊 RELATÓRIO DE OTIMIZAÇÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📉 REDUÇÃO DE TAMANHO
──────────────────────────────────────────────────────────────

| Imagem | Antes | Depois | Redução |
|-------|-------|--------|---------|
| php | 850MB | 180MB | -79% |
| node | 1.2GB | 150MB | -87% |
| python | 950MB | 200MB | -79% |

──────────────────────────────────────────────────────────────
⚡ OTIMIZAÇÃO DE TEMPO DE BUILD
──────────────────────────────────────────────────────────────

| Etapa | Antes | Depois | Ganho |
|-------|-------|--------|------|
| Instalar deps | 120s | 15s* | -87% |
| Build | 60s | 60s | 0% |
| Total | 180s | 75s | -58% |

* Com cache

──────────────────────────────────────────────────────────────
🔒 SEGURANÇA
──────────────────────────────────────────────────────────────

- ✅ Usuário não-root
- ✅ Sem segredos na imagem
- ✅ Imagem base oficial
- ⚠️ 2 vulnerabilidades médias (a corrigir)

──────────────────────────────────────────────────────────────
🎯 COMANDOS ÚTEIS
──────────────────────────────────────────────────────────────

# Build com cache
docker build --cache-from=registry/image:latest -t image .

# Analisar tamanho
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Scan de vulnerabilidades
docker scout cve image:tag
# ou
trivy image image:tag

# Analisar camadas
dive image:tag
```
