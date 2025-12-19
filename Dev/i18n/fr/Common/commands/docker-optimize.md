---
description: Optimisation Dockerfile
argument-hint: [arguments]
---

# Optimisation Dockerfile

Tu es un DevOps Engineer expert en conteneurisation. Tu dois analyser et optimiser les Dockerfiles du projet pour réduire la taille des images, améliorer les temps de build et renforcer la sécurité.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Chemin vers le Dockerfile (défaut: ./Dockerfile)

Exemple : `/common:docker-optimize ./docker/php/Dockerfile`

## MISSION

### Étape 1 : Analyser le Dockerfile Existant

```bash
# Lister les Dockerfiles
find . -name "Dockerfile*" -o -name "*.dockerfile"

# Analyser la taille de l'image actuelle
docker images | grep <image-name>

# Historique des layers
docker history <image-name> --no-trunc
```

### Étape 2 : Checklist d'Optimisation

```
══════════════════════════════════════════════════════════════
🐳 ANALYSE DOCKERFILE
══════════════════════════════════════════════════════════════

Fichier : {chemin}
Image de base : {base image}
Taille actuelle : {size}

──────────────────────────────────────────────────────────────
📋 CHECKLIST OPTIMISATION
──────────────────────────────────────────────────────────────

### Image de Base
- [ ] Utiliser une image slim/alpine si possible
- [ ] Utiliser une version spécifique (pas :latest)
- [ ] Image officielle ou de confiance

### Multi-Stage Build
- [ ] Séparer build et runtime
- [ ] Copier uniquement les artifacts nécessaires
- [ ] Nommer les stages pour clarté

### Layers & Cache
- [ ] Ordonnancer du moins au plus changeant
- [ ] Grouper les RUN avec &&
- [ ] Nettoyer dans le même RUN
- [ ] Utiliser .dockerignore

### Sécurité
- [ ] Pas de secrets dans l'image
- [ ] Utilisateur non-root
- [ ] Permissions minimales
- [ ] Scan de vulnérabilités

### Performance
- [ ] apt-get clean dans le même layer
- [ ] --no-install-recommends
- [ ] Pas de cache inutile
```

### Étape 3 : Templates Optimisés par Technologie

#### PHP/Symfony

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Composer dependencies
#############################################
FROM composer:2 AS composer

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (cache)
COPY composer.json composer.lock ./

# Installer sans dev pour production
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Copier le reste et générer l'autoloader
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

#############################################
# STAGE 2: Frontend assets (si applicable)
#############################################
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

#############################################
# STAGE 3: Production runtime
#############################################
FROM php:8.3-fpm-alpine AS runtime

# Installer les extensions PHP nécessaires
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

# Configuration PHP pour production
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Créer un utilisateur non-root
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /app

# Copier l'application
COPY --from=composer --chown=app:app /app/vendor ./vendor
COPY --from=frontend --chown=app:app /app/public/build ./public/build
COPY --chown=app:app . .

# Warmup cache
RUN php bin/console cache:warmup --env=prod

USER app

EXPOSE 9000
CMD ["php-fpm"]
```

#### Node.js/React

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Dependencies
#############################################
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm ci

#############################################
# STAGE 2: Build
#############################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

#############################################
# STAGE 3: Production runtime
#############################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copier uniquement ce qui est nécessaire
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
# STAGE 1: Build dependencies
#############################################
FROM python:3.12-slim AS builder

WORKDIR /app

# Installer les outils de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Créer et activer le venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#############################################
# STAGE 2: Production runtime
#############################################
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime dependencies seulement
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copier le venv du builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Créer un utilisateur non-root
RUN useradd --create-home --shell /bin/bash app

# Copier l'application
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Étape 4 : .dockerignore Optimal

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

# Documentation
*.md
!README.md
docs/

# Tests
tests/
__tests__/
*.test.*
coverage/
.pytest_cache/

# Build artifacts
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

# Environment
.env*
!.env.example

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
```

### Étape 5 : Analyse et Recommandations

```
══════════════════════════════════════════════════════════════
📊 RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📉 RÉDUCTION DE TAILLE
──────────────────────────────────────────────────────────────

| Image | Avant | Après | Réduction |
|-------|-------|-------|-----------|
| php | 850MB | 180MB | -79% |
| node | 1.2GB | 150MB | -87% |
| python | 950MB | 200MB | -79% |

──────────────────────────────────────────────────────────────
⚡ OPTIMISATION BUILD TIME
──────────────────────────────────────────────────────────────

| Étape | Avant | Après | Gain |
|-------|-------|-------|------|
| Install deps | 120s | 15s* | -87% |
| Build | 60s | 60s | 0% |
| Total | 180s | 75s | -58% |

* Avec cache

──────────────────────────────────────────────────────────────
🔒 SÉCURITÉ
──────────────────────────────────────────────────────────────

- ✅ Utilisateur non-root
- ✅ Pas de secrets dans l'image
- ✅ Image de base officielle
- ⚠️ 2 vulnérabilités medium (à corriger)

──────────────────────────────────────────────────────────────
🎯 COMMANDES UTILES
──────────────────────────────────────────────────────────────

# Build avec cache
docker build --cache-from=registry/image:latest -t image .

# Analyser la taille
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Scanner les vulnérabilités
docker scout cve image:tag
# ou
trivy image image:tag

# Analyser les layers
dive image:tag
```
