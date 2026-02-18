---
description: Docker Compose Einrichtung
argument-hint: [arguments]
---

# Docker Compose Einrichtung

Du bist ein Docker Compose Orchestrierungs-Experte. Du musst eine vollständige und optimierte Konfiguration für eine Multi-Service-Umgebung generieren.

## Argumente
$ARGUMENTS

Argumente:
- Benötigte Services (z.B. postgres, redis, rabbitmq)
- Kontext: dev, staging, prod
- Tech Stack (z.B. symfony, node, python)

Beispiel: `/docker:compose-setup postgres,redis context:dev stack:symfony`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: Anforderungen analysieren

Services und ihre Interaktionen identifizieren:

```
══════════════════════════════════════════════════════════════
🐳 DOCKER COMPOSE ANALYSE
══════════════════════════════════════════════════════════════

Projekt: {name}
Kontext: {dev|staging|prod}
Stack: {stack}

──────────────────────────────────────────────────────────────
📋 IDENTIFIZIERTE SERVICES
──────────────────────────────────────────────────────────────

| Service | Image | Interner Port | Exponierter Port | Volumes |
|---------|-------|---------------|------------------|---------|
| app | custom | 3000 | 3000 | code |
| db | postgres:16 | 5432 | 5432 (dev) | data |
| redis | redis:7 | 6379 | - | data |
```

### Schritt 2: docker-compose.yml generieren

```yaml
# docker-compose.yml - Gemeinsame Basis
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

### Schritt 3: Dev Override generieren

```yaml
# docker-compose.override.yml - Entwicklung (automatisch geladen)
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
      - "5432:5432"  # Direkter Zugriff für Tools

  redis:
    ports:
      - "6379:6379"
```

### Schritt 4: Produktions-Konfiguration generieren

```yaml
# docker-compose.prod.yml - Produktion
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

### Schritt 5: .env.example generieren

```bash
# .env.example - Umgebungsvariablen

# Anwendung
NODE_ENV=development
APP_PORT=3000
APP_SECRET=in-produktion-aendern

# Datenbank
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Redis
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=debug
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
📊 GENERIERTE KONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

✅ docker-compose.yml          # Gemeinsame Basis
✅ docker-compose.override.yml # Dev (automatisch geladen)
✅ docker-compose.prod.yml     # Produktion
✅ .env.example                # Variablen

──────────────────────────────────────────────────────────────
🚀 BEFEHLE
──────────────────────────────────────────────────────────────

# Entwicklung (verwendet Override automatisch)
docker compose up -d
docker compose logs -f app

# Produktion
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Stoppen
docker compose down

# Mit Volume-Entfernung
docker compose down -v

──────────────────────────────────────────────────────────────
🔧 NETZWERK-KONFIGURATION
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│           NETZWERK: backend             │
├─────────────────────────────────────────┤
│  app ←──→ db (5432)                     │
│  app ←──→ redis (6379)                  │
└─────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
💾 PERSISTENTE VOLUMES
──────────────────────────────────────────────────────────────

| Volume | Container-Pfad | Verwendung |
|--------|----------------|------------|
| postgres_data | /var/lib/postgresql/data | DB |
| redis_data | /data | Cache |
```
