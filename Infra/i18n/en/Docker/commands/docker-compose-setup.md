---
description: Docker Compose Setup
argument-hint: [arguments]
---

# Docker Compose Setup

You are a Docker Compose orchestration expert. You must generate a complete and optimized configuration for a multi-service environment.

## Arguments
$ARGUMENTS

Arguments:
- Required services (e.g., postgres, redis, rabbitmq)
- Context: dev, staging, prod
- Tech stack (e.g., symfony, node, python)

Example: `/docker:compose-setup postgres,redis context:dev stack:symfony`

## MISSION

### Step 1: Analyze Requirements

Identify services and their interactions:

```
══════════════════════════════════════════════════════════════
🐳 DOCKER COMPOSE ANALYSIS
══════════════════════════════════════════════════════════════

Project: {name}
Context: {dev|staging|prod}
Stack: {stack}

──────────────────────────────────────────────────────────────
📋 IDENTIFIED SERVICES
──────────────────────────────────────────────────────────────

| Service | Image | Internal Port | Exposed Port | Volumes |
|---------|-------|---------------|--------------|---------|
| app | custom | 3000 | 3000 | code |
| db | postgres:16 | 5432 | 5432 (dev) | data |
| redis | redis:7 | 6379 | - | data |
```

### Step 2: Generate docker-compose.yml

```yaml
# docker-compose.yml - Common base
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    volumes:
      - .:/app:cached
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

networks:
  backend:

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Generate Dev Override

```yaml
# docker-compose.override.yml - Development (auto-loaded)
services:
  app:
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug
    volumes:
      - .:/app:cached
    environment:
      - DEBUG=*

  db:
    ports:
      - "5432:5432"  # Direct access for tools

  redis:
    ports:
      - "6379:6379"
```

### Step 4: Generate Production Config

```yaml
# docker-compose.prod.yml - Production
services:
  app:
    build:
      target: production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  redis:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M

networks:
  backend:
    driver: bridge
    internal: true
```

### Step 5: Generate .env.example

```bash
# .env.example - Environment variables

# Application
NODE_ENV=development
APP_PORT=3000
APP_SECRET=change-me-in-production

# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Redis
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=debug
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
📊 GENERATED CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 CREATED FILES
──────────────────────────────────────────────────────────────

✅ docker-compose.yml          # Common base
✅ docker-compose.override.yml # Dev (auto-loaded)
✅ docker-compose.prod.yml     # Production
✅ .env.example                # Variables

──────────────────────────────────────────────────────────────
🚀 COMMANDS
──────────────────────────────────────────────────────────────

# Development (uses override automatically)
docker compose up -d
docker compose logs -f app

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Stop
docker compose down

# With volume removal
docker compose down -v

──────────────────────────────────────────────────────────────
🔧 NETWORK CONFIGURATION
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│              NETWORK: backend           │
├─────────────────────────────────────────┤
│  app ←──→ db (5432)                     │
│  app ←──→ redis (6379)                  │
└─────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
💾 PERSISTENT VOLUMES
──────────────────────────────────────────────────────────────

| Volume | Container Path | Usage |
|--------|----------------|-------|
| postgres_data | /var/lib/postgresql/data | DB |
| redis_data | /data | Cache |
```
