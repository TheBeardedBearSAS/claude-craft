---
description: Architecture Docker Complète
argument-hint: [arguments]
---

# Architecture Docker Complète

Tu es un architecte Docker senior. Tu dois concevoir une architecture containerisée complète à partir des spécifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Stack technique (ex: symfony, node, python)
- Services requis (ex: postgres, redis, elasticsearch)
- Contraintes (ex: prod, multi-env, microservices)

Exemple : `/docker:architecture "API REST e-commerce" stack:node services:postgres,redis,elasticsearch`

## MISSION

### Étape 1 : Discovery

```
══════════════════════════════════════════════════════════════
🏗️ ARCHITECTURE DOCKER
══════════════════════════════════════════════════════════════

Projet : {nom}
Description : {description}

──────────────────────────────────────────────────────────────
📋 ANALYSE DES BESOINS
──────────────────────────────────────────────────────────────

### Stack Technique
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | {tech} | {version} |
| Database | {tech} | {version} |
| Cache | {tech} | {version} |

### Services Requis
| Service | Usage | Criticité |
|---------|-------|-----------|
| {service} | {usage} | Haute/Moyenne/Basse |

### Environnements
| Env | Objectif | Particularités |
|-----|----------|----------------|
| dev | Développement | Hot-reload, debug |
| staging | Validation | Production-like |
| prod | Production | Performance, sécurité |
```

### Étape 2 : Design Architecture

```
──────────────────────────────────────────────────────────────
🔷 TOPOLOGIE DES SERVICES
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌───────────────┐                                          │
│  │    Traefik    │ ─── Port 80/443                          │
│  │  (reverse     │                                          │
│  │   proxy)      │                                          │
│  └───────┬───────┘                                          │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │      API      │────│    Workers    │                     │
│  │   (app:3000)  │    │  (async jobs) │                     │
│  └───────┬───────┘    └───────┬───────┘                     │
└──────────┼────────────────────┼─────────────────────────────┘
           │                    │
┌──────────▼────────────────────▼─────────────────────────────┐
│                         DATA                                 │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐       │
│  │  PostgreSQL  │  │    Redis    │  │   RabbitMQ    │       │
│  │   (db:5432)  │  │  (cache:    │  │  (queue:5672) │       │
│  │              │  │    6379)    │  │               │       │
│  └──────────────┘  └─────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
🔒 SEGMENTATION RÉSEAU
──────────────────────────────────────────────────────────────

| Réseau | Services | Accès |
|--------|----------|-------|
| frontend | traefik | Public (80, 443) |
| backend | app, workers | Interne |
| data | db, redis, queue | Interne isolé |
```

### Étape 3 : Structure des Fichiers

```
──────────────────────────────────────────────────────────────
📁 ARBORESCENCE PROJET
──────────────────────────────────────────────────────────────

project/
├── docker/
│   ├── app/
│   │   ├── Dockerfile
│   │   └── entrypoint.sh
│   ├── nginx/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── workers/
│       └── Dockerfile
│
├── docker-compose.yml          # Base commune
├── docker-compose.override.yml # Dev local (auto-chargé)
├── docker-compose.prod.yml     # Production
├── docker-compose.ci.yml       # Tests CI
│
├── .env.example                # Variables documentées
├── .dockerignore               # Exclusions build
│
├── .github/
│   └── workflows/
│       └── docker.yml          # CI/CD
│
└── docs/
    └── docker-operations.md    # Documentation ops
```

### Étape 4 : Générer les Fichiers

#### docker-compose.yml (Base)

```yaml
# docker-compose.yml
version: "3.8"

services:
  # ═══════════════════════════════════════════════════════════
  # REVERSE PROXY
  # ═══════════════════════════════════════════════════════════
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - frontend

  # ═══════════════════════════════════════════════════════════
  # APPLICATION
  # ═══════════════════════════════════════════════════════════
  app:
    build:
      context: .
      dockerfile: docker/app/Dockerfile
      target: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.localhost`)"
      - "traefik.http.services.app.loadbalancer.server.port=3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/app
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://user:password@rabbitmq:5672
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend
      - backend

  # ═══════════════════════════════════════════════════════════
  # WORKERS
  # ═══════════════════════════════════════════════════════════
  worker:
    build:
      context: .
      dockerfile: docker/app/Dockerfile
      target: production
    command: ["npm", "run", "worker"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/app
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://user:password@rabbitmq:5672
    depends_on:
      - app
      - rabbitmq
    networks:
      - backend
      - data

  # ═══════════════════════════════════════════════════════════
  # DATABASE
  # ═══════════════════════════════════════════════════════════
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
      - data

  # ═══════════════════════════════════════════════════════════
  # CACHE
  # ═══════════════════════════════════════════════════════════
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
      - data

  # ═══════════════════════════════════════════════════════════
  # MESSAGE QUEUE
  # ═══════════════════════════════════════════════════════════
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: user
      RABBITMQ_DEFAULT_PASS: password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - data

# ═══════════════════════════════════════════════════════════
# NETWORKS
# ═══════════════════════════════════════════════════════════
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  data:
    driver: bridge
    internal: true  # Pas d'accès internet

# ═══════════════════════════════════════════════════════════
# VOLUMES
# ═══════════════════════════════════════════════════════════
volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

#### Dockerfile (Multi-stage)

```dockerfile
# docker/app/Dockerfile
# syntax=docker/dockerfile:1

#############################################
# STAGE 1: Dependencies
#############################################
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

#############################################
# STAGE 2: Development
#############################################
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

#############################################
# STAGE 3: Build
#############################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

#############################################
# STAGE 4: Production
#############################################
FROM node:20-alpine AS production

WORKDIR /app

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copier les artifacts
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Étape 5 : Documentation Opérationnelle

```markdown
# Docker Operations - {Projet}

## Commandes Courantes

### Développement
\`\`\`bash
# Démarrer l'environnement
docker compose up -d

# Voir les logs
docker compose logs -f app

# Accéder au shell
docker compose exec app sh

# Rebuild après changements Dockerfile
docker compose up -d --build app
\`\`\`

### Production
\`\`\`bash
# Déployer
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Mise à jour zero-downtime
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps app
\`\`\`

### Maintenance
\`\`\`bash
# Backup base de données
docker compose exec db pg_dump -U user app > backup_$(date +%Y%m%d).sql

# Restaurer
cat backup.sql | docker compose exec -T db psql -U user app

# Nettoyer
docker system prune -af
\`\`\`

## Ressources

| Service | CPU | Memory | Notes |
|---------|-----|--------|-------|
| app | 1 | 512MB | Scale horizontal possible |
| worker | 0.5 | 256MB | Ajuster selon charge |
| db | 0.5 | 256MB | Augmenter pour prod |
| redis | 0.25 | 128MB | Suffisant pour cache |
| rabbitmq | 0.25 | 256MB | Ajuster selon queues |
```

### Étape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
📊 ARCHITECTURE GÉNÉRÉE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
✅ FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| docker-compose.yml | Configuration de base |
| docker-compose.override.yml | Override développement |
| docker-compose.prod.yml | Configuration production |
| docker/app/Dockerfile | Image application |
| .env.example | Variables d'environnement |
| .dockerignore | Exclusions de build |
| docs/docker-operations.md | Documentation opérationnelle |

──────────────────────────────────────────────────────────────
🎯 PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. [ ] Copier .env.example vers .env et configurer
2. [ ] Builder les images : docker compose build
3. [ ] Démarrer : docker compose up -d
4. [ ] Vérifier : docker compose ps
5. [ ] Configurer CI/CD avec /docker:cicd-pipeline
```
