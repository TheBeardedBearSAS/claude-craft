# Dockerfile Optimization

You are a DevOps Engineer expert in containerization. You must analyze and optimize the project's Dockerfiles to reduce image size, improve build times, and strengthen security.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Path to Dockerfile (default: ./Dockerfile)

Example: `/common:docker-optimize ./docker/php/Dockerfile`

## MISSION

### Step 1: Analyze Existing Dockerfile

```bash
# List Dockerfiles
find . -name "Dockerfile*" -o -name "*.dockerfile"

# Analyze current image size
docker images | grep <image-name>

# Layer history
docker history <image-name> --no-trunc
```

### Step 2: Optimization Checklist

```
══════════════════════════════════════════════════════════════
🐳 DOCKERFILE ANALYSIS
══════════════════════════════════════════════════════════════

File: {path}
Base image: {base image}
Current size: {size}

──────────────────────────────────────────────────────────────
📋 OPTIMIZATION CHECKLIST
──────────────────────────────────────────────────────────────

### Base Image
- [ ] Use slim/alpine image if possible
- [ ] Use specific version (not :latest)
- [ ] Official or trusted image

### Multi-Stage Build
- [ ] Separate build and runtime
- [ ] Copy only necessary artifacts
- [ ] Name stages for clarity

### Layers & Cache
- [ ] Order from least to most changing
- [ ] Group RUN with &&
- [ ] Clean in same RUN
- [ ] Use .dockerignore

### Security
- [ ] No secrets in image
- [ ] Non-root user
- [ ] Minimal permissions
- [ ] Vulnerability scan

### Performance
- [ ] apt-get clean in same layer
- [ ] --no-install-recommends
- [ ] No unnecessary cache
```

### Step 3: Optimized Templates by Technology

#### PHP/Symfony

```dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Composer dependencies
#############################################
FROM composer:2 AS composer

WORKDIR /app

# Copy only dependency files first (cache)
COPY composer.json composer.lock ./

# Install without dev for production
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress

# Copy rest and generate autoloader
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative

#############################################
# STAGE 2: Frontend assets (if applicable)
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

# Install required PHP extensions
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

# PHP configuration for production
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Create non-root user
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

WORKDIR /app

# Copy application
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

# Copy only dependency files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

#############################################
# STAGE 2: Build
#############################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build environment variables
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

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy only what's needed
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

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create and activate venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#############################################
# STAGE 2: Production runtime
#############################################
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Copy application
COPY --chown=app:app . .

USER app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 4: Optimal .dockerignore

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

### Step 5: Analysis and Recommendations

```
══════════════════════════════════════════════════════════════
📊 OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📉 SIZE REDUCTION
──────────────────────────────────────────────────────────────

| Image | Before | After | Reduction |
|-------|-------|-------|-----------|
| php | 850MB | 180MB | -79% |
| node | 1.2GB | 150MB | -87% |
| python | 950MB | 200MB | -79% |

──────────────────────────────────────────────────────────────
⚡ BUILD TIME OPTIMIZATION
──────────────────────────────────────────────────────────────

| Step | Before | After | Gain |
|-------|-------|-------|------|
| Install deps | 120s | 15s* | -87% |
| Build | 60s | 60s | 0% |
| Total | 180s | 75s | -58% |

* With cache

──────────────────────────────────────────────────────────────
🔒 SECURITY
──────────────────────────────────────────────────────────────

- ✅ Non-root user
- ✅ No secrets in image
- ✅ Official base image
- ⚠️ 2 medium vulnerabilities (to fix)

──────────────────────────────────────────────────────────────
🎯 USEFUL COMMANDS
──────────────────────────────────────────────────────────────

# Build with cache
docker build --cache-from=registry/image:latest -t image .

# Analyze size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Scan vulnerabilities
docker scout cve image:tag
# or
trivy image image:tag

# Analyze layers
dive image:tag
```
