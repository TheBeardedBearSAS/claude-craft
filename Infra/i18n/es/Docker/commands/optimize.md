---
description: Optimización de Dockerfile
argument-hint: [arguments]
---

# Optimización de Dockerfile

Eres un Ingeniero DevOps experto en contenedorización. Debes analizar y optimizar los Dockerfiles del proyecto para reducir el tamaño de imagen, mejorar los tiempos de construcción y reforzar la seguridad.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Ruta al Dockerfile (predeterminado: ./Dockerfile)

Ejemplo: `/docker:optimize ./docker/php/Dockerfile`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Analizar Dockerfile Existente

```bash
# Listar Dockerfiles
find . -name "Dockerfile*" -o -name "*.dockerfile"

# Analizar tamaño de imagen actual
docker images | grep <nombre-imagen>

# Historial de capas
docker history <nombre-imagen> --no-trunc
```

### Paso 2: Lista de Verificación de Optimización

```
══════════════════════════════════════════════════════════════
🐳 ANÁLISIS DE DOCKERFILE
══════════════════════════════════════════════════════════════

Archivo: {ruta}
Imagen base: {imagen base}
Tamaño actual: {tamaño}

──────────────────────────────────────────────────────────────
📋 LISTA DE VERIFICACIÓN DE OPTIMIZACIÓN
──────────────────────────────────────────────────────────────

### Imagen Base
- [ ] Usar imagen slim/alpine si es posible
- [ ] Usar versión específica (no :latest)
- [ ] Imagen oficial o de confianza

### Construcción Multi-Etapa
- [ ] Separar construcción y runtime
- [ ] Copiar solo artefactos necesarios
- [ ] Nombrar etapas para claridad

### Capas y Caché
- [ ] Ordenar de menos a más cambiante
- [ ] Agrupar RUN con &&
- [ ] Limpiar en mismo RUN
- [ ] Usar .dockerignore

### Seguridad
- [ ] Sin secretos en imagen
- [ ] Usuario no root
- [ ] Permisos mínimos
- [ ] Escaneo de vulnerabilidades

### Rendimiento
- [ ] apt-get clean en misma capa
- [ ] --no-install-recommends
- [ ] Sin caché innecesario
```

### Paso 3: Plantillas Optimizadas por Tecnología

#### PHP/Symfony

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# ETAPA 1: Dependencias Composer
#############################################
FROM composer:2 AS composer

WORKDIR /app

# Copiar solo archivos de dependencias primero (caché)
COPY composer.json composer.lock ./

# Instalar sin dev para producción
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Copiar resto y generar autoloader
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

#############################################
# ETAPA 2: Assets frontend (si aplica)
#############################################
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build

#############################################
# ETAPA 3: Runtime producción
#############################################
FROM php:8.3-fpm-alpine AS runtime

# Instalar extensiones PHP requeridas
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

# Configuración PHP para producción
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Crear usuario no root
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /app

# Copiar aplicación
COPY --from=composer --chown=app:app /app/vendor ./vendor
COPY --from=frontend --chown=app:app /app/public/build ./public/build
COPY --chown=app:app . .

# Precalentar caché
RUN php bin/console cache:warmup --env=prod

USER app

EXPOSE 9000
CMD ["php-fpm"]
```

#### Node.js/React

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# ETAPA 1: Dependencias
#############################################
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar solo archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev para build)
RUN npm ci

#############################################
# ETAPA 2: Build
#############################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

#############################################
# ETAPA 3: Runtime producción
#############################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copiar solo lo necesario
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
# ETAPA 1: Build dependencias
#############################################
FROM python:3.12-slim AS builder

WORKDIR /app

# Instalar herramientas de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear y activar venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#############################################
# ETAPA 2: Runtime producción
#############################################
FROM python:3.12-slim AS runtime

WORKDIR /app

# Solo dependencias de runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copiar venv desde builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Crear usuario no root
RUN useradd --create-home --shell /bin/bash app

# Copiar aplicación
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Paso 4: .dockerignore Óptimo

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

# Documentación
*.md
!README.md
docs/

# Tests
tests/
__tests__/
*.test.*
coverage/
.pytest_cache/

# Artefactos de build
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

# Entorno
.env*
!.env.example

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db
```

### Paso 5: Análisis y Recomendaciones

```
══════════════════════════════════════════════════════════════
📊 REPORTE DE OPTIMIZACIÓN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📉 REDUCCIÓN DE TAMAÑO
──────────────────────────────────────────────────────────────

| Imagen | Antes | Después | Reducción |
|-------|-------|--------|-----------|
| php | 850MB | 180MB | -79% |
| node | 1.2GB | 150MB | -87% |
| python | 950MB | 200MB | -79% |

──────────────────────────────────────────────────────────────
⚡ OPTIMIZACIÓN DE TIEMPO DE BUILD
──────────────────────────────────────────────────────────────

| Paso | Antes | Después | Ganancia |
|-------|-------|--------|------|
| Instalar deps | 120s | 15s* | -87% |
| Build | 60s | 60s | 0% |
| Total | 180s | 75s | -58% |

* Con caché

──────────────────────────────────────────────────────────────
🔒 SEGURIDAD
──────────────────────────────────────────────────────────────

- ✅ Usuario no root
- ✅ Sin secretos en imagen
- ✅ Imagen base oficial
- ⚠️ 2 vulnerabilidades medias (a corregir)

──────────────────────────────────────────────────────────────
🎯 COMANDOS ÚTILES
──────────────────────────────────────────────────────────────

# Build con caché
docker build --cache-from=registry/image:latest -t image .

# Analizar tamaño
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Escanear vulnerabilidades
docker scout cve image:tag
# o
trivy image image:tag

# Analizar capas
dive image:tag
```
