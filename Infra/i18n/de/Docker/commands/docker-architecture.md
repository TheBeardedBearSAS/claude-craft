---
description: Vollständige Docker-Architektur
argument-hint: [arguments]
---

# Vollständige Docker-Architektur

Du bist ein Senior Docker-Architekt. Du musst eine vollständige containerisierte Architektur aus Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Tech Stack (z.B. symfony, node, python)
- Benötigte Services (z.B. postgres, redis, elasticsearch)
- Einschränkungen (z.B. prod, multi-env, microservices)

Beispiel: `/docker:architecture "E-Commerce REST API" stack:node services:postgres,redis,elasticsearch`

## MISSION

### Schritt 1: Discovery

```
══════════════════════════════════════════════════════════════
🏗️ DOCKER ARCHITEKTUR
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {beschreibung}

──────────────────────────────────────────────────────────────
📋 ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Tech Stack
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Backend | {tech} | {version} |
| Datenbank | {tech} | {version} |
| Cache | {tech} | {version} |

### Benötigte Services
| Service | Verwendung | Kritikalität |
|---------|------------|--------------|
| {service} | {verwendung} | Hoch/Mittel/Niedrig |

### Umgebungen
| Env | Zweck | Besonderheiten |
|-----|-------|----------------|
| dev | Entwicklung | Hot-reload, Debug |
| staging | Validierung | Production-ähnlich |
| prod | Produktion | Performance, Sicherheit |
```

### Schritt 2: Architektur-Design

```
──────────────────────────────────────────────────────────────
🔷 SERVICE-TOPOLOGIE
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
🔒 NETZWERK-SEGMENTIERUNG
──────────────────────────────────────────────────────────────

| Netzwerk | Services | Zugriff |
|----------|----------|---------|
| frontend | traefik | Öffentlich (80, 443) |
| backend | app, workers | Intern |
| data | db, redis, queue | Isoliert intern |
```

### Schritt 3: Dateistruktur

```
──────────────────────────────────────────────────────────────
📁 PROJEKTSTRUKTUR
──────────────────────────────────────────────────────────────

projekt/
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
├── docker-compose.yml          # Gemeinsame Basis
├── docker-compose.override.yml # Lokale Dev (automatisch geladen)
├── docker-compose.prod.yml     # Produktion
├── docker-compose.ci.yml       # CI Tests
│
├── .env.example                # Dokumentierte Variablen
├── .dockerignore               # Build-Ausschlüsse
│
├── .github/
│   └── workflows/
│       └── docker.yml          # CI/CD
│
└── docs/
    └── docker-operations.md    # Ops-Dokumentation
```

### Schritt 4: Dateien generieren

#### docker-compose.yml (Basis)

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
  # ANWENDUNG
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
  # DATENBANK
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
# NETZWERKE
# ═══════════════════════════════════════════════════════════
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  data:
    driver: bridge
    internal: true  # Kein Internetzugang

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

# Nicht-root Benutzer erstellen
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Artefakte kopieren
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Schritt 5: Operations-Dokumentation

```markdown
# Docker Operations - {Projekt}

## Allgemeine Befehle

### Entwicklung
\`\`\`bash
# Umgebung starten
docker compose up -d

# Logs anzeigen
docker compose logs -f app

# Shell-Zugriff
docker compose exec app sh

# Rebuild nach Dockerfile-Änderungen
docker compose up -d --build app
\`\`\`

### Produktion
\`\`\`bash
# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Zero-downtime Update
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps app
\`\`\`

### Wartung
\`\`\`bash
# Datenbank-Backup
docker compose exec db pg_dump -U user app > backup_$(date +%Y%m%d).sql

# Wiederherstellen
cat backup.sql | docker compose exec -T db psql -U user app

# Bereinigung
docker system prune -af
\`\`\`

## Ressourcen

| Service | CPU | Memory | Hinweise |
|---------|-----|--------|----------|
| app | 1 | 512MB | Horizontale Skalierung möglich |
| worker | 0.5 | 256MB | Nach Last anpassen |
| db | 0.5 | 256MB | Für Prod erhöhen |
| redis | 0.25 | 128MB | Ausreichend für Caching |
| rabbitmq | 0.25 | 256MB | Nach Queues anpassen |
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
📊 GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
✅ ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| docker-compose.yml | Basis-Konfiguration |
| docker-compose.override.yml | Entwicklungs-Override |
| docker-compose.prod.yml | Produktions-Konfiguration |
| docker/app/Dockerfile | Anwendungs-Image |
| .env.example | Umgebungsvariablen |
| .dockerignore | Build-Ausschlüsse |
| docs/docker-operations.md | Operations-Dokumentation |

──────────────────────────────────────────────────────────────
🎯 NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] .env.example nach .env kopieren und konfigurieren
2. [ ] Images bauen: docker compose build
3. [ ] Starten: docker compose up -d
4. [ ] Verifizieren: docker compose ps
5. [ ] CI/CD konfigurieren mit /docker:cicd-pipeline
```
