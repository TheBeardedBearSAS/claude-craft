---
description: Dockerfile-Optimierung
argument-hint: [arguments]
---

# Dockerfile-Optimierung

Sie sind ein DevOps-Ingenieur mit Expertise in Containerisierung. Sie müssen die Dockerfiles des Projekts analysieren und optimieren, um die Image-Größe zu reduzieren, Build-Zeiten zu verbessern und die Sicherheit zu stärken.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Pfad zum Dockerfile (Standard: ./Dockerfile)

Beispiel: `/common:docker-optimize ./docker/php/Dockerfile`

## MISSION

### Schritt 1: Bestehendes Dockerfile analysieren

```bash
# Dockerfiles auflisten
find . -name "Dockerfile*" -o -name "*.dockerfile"

# Aktuelle Image-Größe analysieren
docker images | grep <image-name>

# Layer-Historie
docker history <image-name> --no-trunc
```

### Schritt 2: Optimierungs-Checkliste

```
══════════════════════════════════════════════════════════════
🐳 DOCKERFILE-ANALYSE
══════════════════════════════════════════════════════════════

Datei: {pfad}
Base-Image: {base image}
Aktuelle Größe: {größe}

──────────────────────────────────────────────────────────────
📋 OPTIMIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### Base-Image
- [ ] Slim/Alpine-Image verwenden falls möglich
- [ ] Spezifische Version verwenden (nicht :latest)
- [ ] Offizielles oder vertrauenswürdiges Image

### Multi-Stage Build
- [ ] Build und Runtime trennen
- [ ] Nur notwendige Artefakte kopieren
- [ ] Stages zur Klarheit benennen

### Layers & Cache
- [ ] Reihenfolge von am wenigsten zu am meisten wechselnd
- [ ] RUN mit && gruppieren
- [ ] Im gleichen RUN aufräumen
- [ ] .dockerignore verwenden

### Sicherheit
- [ ] Keine Secrets im Image
- [ ] Non-Root-Benutzer
- [ ] Minimale Berechtigungen
- [ ] Schwachstellen-Scan

### Performance
- [ ] apt-get clean im gleichen Layer
- [ ] --no-install-recommends
- [ ] Kein unnötiger Cache
```

### Schritt 3: Optimierte Templates nach Technologie

#### PHP/Symfony

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Composer-Abhängigkeiten
#############################################
FROM composer:2 AS composer

WORKDIR /app

# Nur Dependency-Dateien zuerst kopieren (Cache)
COPY composer.json composer.lock ./

# Ohne Dev für Produktion installieren
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Rest kopieren und Autoloader generieren
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

#############################################
# STAGE 2: Frontend-Assets (falls zutreffend)
#############################################
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

#############################################
# STAGE 3: Production Runtime
#############################################
FROM php:8.3-fpm-alpine AS runtime

# Erforderliche PHP-Extensions installieren
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

# PHP-Konfiguration für Produktion
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Non-Root-Benutzer erstellen
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /app

# Anwendung kopieren
COPY --from=composer --chown=app:app /app/vendor ./vendor
COPY --from=frontend --chown=app:app /app/public/build ./public/build
COPY --chown=app:app . .

# Cache aufwärmen
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

# Nur Dependency-Dateien kopieren
COPY package*.json ./

# Alle Dependencies installieren (inkl. dev für Build)
RUN npm ci

#############################################
# STAGE 2: Build
#############################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-Umgebungsvariablen
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

#############################################
# STAGE 3: Production Runtime
#############################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-Root-Benutzer erstellen
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Nur das Nötige kopieren
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
# STAGE 1: Build-Abhängigkeiten
#############################################
FROM python:3.12-slim AS builder

WORKDIR /app

# Build-Tools installieren
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Venv erstellen und aktivieren
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Dependencies installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#############################################
# STAGE 2: Production Runtime
#############################################
FROM python:3.12-slim AS runtime

WORKDIR /app

# Nur Runtime-Abhängigkeiten
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Venv vom Builder kopieren
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Non-Root-Benutzer erstellen
RUN useradd --create-home --shell /bin/bash app

# Anwendung kopieren
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Schritt 4: Optimale .dockerignore

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

# Dokumentation
*.md
!README.md
docs/

# Tests
tests/
__tests__/
*.test.*
coverage/
.pytest_cache/

# Build-Artefakte
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

# Umgebung
.env*
!.env.example

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
```

### Schritt 5: Analyse und Empfehlungen

```
══════════════════════════════════════════════════════════════
📊 OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📉 GRÖSSENREDUZIERUNG
──────────────────────────────────────────────────────────────

| Image | Vorher | Nachher | Reduzierung |
|-------|-------|-------|-----------|
| php | 850MB | 180MB | -79% |
| node | 1.2GB | 150MB | -87% |
| python | 950MB | 200MB | -79% |

──────────────────────────────────────────────────────────────
⚡ BUILD-ZEIT-OPTIMIERUNG
──────────────────────────────────────────────────────────────

| Schritt | Vorher | Nachher | Gewinn |
|-------|-------|-------|------|
| Install deps | 120s | 15s* | -87% |
| Build | 60s | 60s | 0% |
| Total | 180s | 75s | -58% |

* Mit Cache

──────────────────────────────────────────────────────────────
🔒 SICHERHEIT
──────────────────────────────────────────────────────────────

- ✅ Non-Root-Benutzer
- ✅ Keine Secrets im Image
- ✅ Offizielles Base-Image
- ⚠️ 2 mittlere Schwachstellen (zu beheben)

──────────────────────────────────────────────────────────────
🎯 NÜTZLICHE BEFEHLE
──────────────────────────────────────────────────────────────

# Build mit Cache
docker build --cache-from=registry/image:latest -t image .

# Größe analysieren
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Schwachstellen scannen
docker scout cve image:tag
# oder
trivy image image:tag

# Layers analysieren
dive image:tag
```
