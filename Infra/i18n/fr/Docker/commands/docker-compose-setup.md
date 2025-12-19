---
description: Configuration Docker Compose
argument-hint: [arguments]
---

# Configuration Docker Compose

Tu es un expert en orchestration Docker Compose. Tu dois générer une configuration complète et optimisée pour un environnement multi-services.

## Arguments
$ARGUMENTS

Arguments :
- Services requis (ex: postgres, redis, rabbitmq)
- Contexte : dev, staging, prod
- Stack technique (ex: symfony, node, python)

Exemple : `/docker:compose-setup postgres,redis contexte:dev stack:symfony`

## MISSION

### Étape 1 : Analyser les Besoins

Identifier les services et leurs interactions :

```
══════════════════════════════════════════════════════════════
🐳 ANALYSE DOCKER COMPOSE
══════════════════════════════════════════════════════════════

Projet : {nom}
Contexte : {dev|staging|prod}
Stack : {stack}

──────────────────────────────────────────────────────────────
📋 SERVICES IDENTIFIÉS
──────────────────────────────────────────────────────────────

| Service | Image | Port Interne | Port Exposé | Volumes |
|---------|-------|--------------|-------------|---------|
| app | custom | 3000 | 3000 | code |
| db | postgres:16 | 5432 | 5432 (dev) | data |
| redis | redis:7 | 6379 | - | data |
```

### Étape 2 : Générer docker-compose.yml

```yaml
# docker-compose.yml - Base commune
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

### Étape 3 : Générer Override pour Dev

```yaml
# docker-compose.override.yml - Développement (chargé auto)
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
      - "5432:5432"  # Accès direct pour outils

  redis:
    ports:
      - "6379:6379"
```

### Étape 4 : Générer Config Production

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

### Étape 5 : Générer .env.example

```bash
# .env.example - Variables d'environnement

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

### Étape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
📊 CONFIGURATION GÉNÉRÉE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

✅ docker-compose.yml          # Base commune
✅ docker-compose.override.yml # Dev (auto-chargé)
✅ docker-compose.prod.yml     # Production
✅ .env.example                # Variables

──────────────────────────────────────────────────────────────
🚀 COMMANDES
──────────────────────────────────────────────────────────────

# Développement (utilise override automatiquement)
docker compose up -d
docker compose logs -f app

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Arrêt
docker compose down

# Avec suppression des volumes
docker compose down -v

──────────────────────────────────────────────────────────────
🔧 CONFIGURATION RÉSEAU
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│              NETWORK: backend           │
├─────────────────────────────────────────┤
│  app ←──→ db (5432)                     │
│  app ←──→ redis (6379)                  │
└─────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
💾 VOLUMES PERSISTANTS
──────────────────────────────────────────────────────────────

| Volume | Chemin Container | Usage |
|--------|------------------|-------|
| postgres_data | /var/lib/postgresql/data | BDD |
| redis_data | /data | Cache |
```
