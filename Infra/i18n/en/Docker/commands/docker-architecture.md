---
description: Complete Docker Architecture
argument-hint: [arguments]
---

# Complete Docker Architecture

You are a senior Docker architect. You must design a complete containerized architecture from project specifications.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Tech stack (e.g., symfony, node, python)
- Required services (e.g., postgres, redis, elasticsearch)
- Constraints (e.g., prod, multi-env, microservices)

Example: `/docker:architecture "E-commerce REST API" stack:node services:postgres,redis,elasticsearch`

## MISSION

### Step 1: Discovery

```
══════════════════════════════════════════════════════════════
🏗️ DOCKER ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
📋 REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Backend | {tech} | {version} |
| Database | {tech} | {version} |
| Cache | {tech} | {version} |

### Required Services
| Service | Usage | Criticality |
|---------|-------|-------------|
| {service} | {usage} | High/Medium/Low |

### Environments
| Env | Purpose | Specifics |
|-----|---------|-----------|
| dev | Development | Hot-reload, debug |
| staging | Validation | Production-like |
| prod | Production | Performance, security |
```

### Step 2: Architecture Design

```
──────────────────────────────────────────────────────────────
🔷 SERVICE TOPOLOGY
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
🔒 NETWORK SEGMENTATION
──────────────────────────────────────────────────────────────

| Network | Services | Access |
|---------|----------|--------|
| frontend | traefik | Public (80, 443) |
| backend | app, workers | Internal |
| data | db, redis, queue | Isolated internal |
```

### Step 3: File Structure

```
──────────────────────────────────────────────────────────────
📁 PROJECT STRUCTURE
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
├── docker-compose.yml          # Common base
├── docker-compose.override.yml # Local dev (auto-loaded)
├── docker-compose.prod.yml     # Production
├── docker-compose.ci.yml       # CI tests
│
├── .env.example                # Documented variables
├── .dockerignore               # Build exclusions
│
├── .github/
│   └── workflows/
│       └── docker.yml          # CI/CD
│
└── docs/
    └── docker-operations.md    # Ops documentation
```

### Step 4: Generate Files

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
    internal: true  # No internet access

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

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy artifacts
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Step 5: Operations Documentation

```markdown
# Docker Operations - {Project}

## Common Commands

### Development
\`\`\`bash
# Start environment
docker compose up -d

# View logs
docker compose logs -f app

# Access shell
docker compose exec app sh

# Rebuild after Dockerfile changes
docker compose up -d --build app
\`\`\`

### Production
\`\`\`bash
# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Zero-downtime update
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps app
\`\`\`

### Maintenance
\`\`\`bash
# Database backup
docker compose exec db pg_dump -U user app > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T db psql -U user app

# Cleanup
docker system prune -af
\`\`\`

## Resources

| Service | CPU | Memory | Notes |
|---------|-----|--------|-------|
| app | 1 | 512MB | Horizontal scaling possible |
| worker | 0.5 | 256MB | Adjust based on load |
| db | 0.5 | 256MB | Increase for prod |
| redis | 0.25 | 128MB | Sufficient for caching |
| rabbitmq | 0.25 | 256MB | Adjust based on queues |
```

### Step 6: Final Report

```
══════════════════════════════════════════════════════════════
📊 GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
✅ CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| docker-compose.yml | Base configuration |
| docker-compose.override.yml | Development override |
| docker-compose.prod.yml | Production configuration |
| docker/app/Dockerfile | Application image |
| .env.example | Environment variables |
| .dockerignore | Build exclusions |
| docs/docker-operations.md | Operations documentation |

──────────────────────────────────────────────────────────────
🎯 NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Copy .env.example to .env and configure
2. [ ] Build images: docker compose build
3. [ ] Start: docker compose up -d
4. [ ] Verify: docker compose ps
5. [ ] Configure CI/CD with /docker:cicd-pipeline
```
