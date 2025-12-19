---
description: Arquitectura Docker Completa
argument-hint: [arguments]
---

# Arquitectura Docker Completa

Eres un arquitecto Docker senior. Debes diseñar una arquitectura containerizada completa a partir de las especificaciones del proyecto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descripción del proyecto
- Stack técnico (ej: symfony, node, python)
- Servicios requeridos (ej: postgres, redis, elasticsearch)
- Restricciones (ej: prod, multi-env, microservices)

Ejemplo: `/docker:architecture "API REST E-commerce" stack:node services:postgres,redis,elasticsearch`

## MISIÓN

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
🏗️ ARQUITECTURA DOCKER
══════════════════════════════════════════════════════════════

Proyecto: {nombre}
Descripción: {descripción}

──────────────────────────────────────────────────────────────
📋 ANÁLISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Técnico
| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | {tech} | {versión} |
| Base de datos | {tech} | {versión} |
| Cache | {tech} | {versión} |

### Servicios Requeridos
| Servicio | Uso | Criticidad |
|----------|-----|------------|
| {servicio} | {uso} | Alta/Media/Baja |

### Entornos
| Env | Propósito | Especificidades |
|-----|-----------|-----------------|
| dev | Desarrollo | Hot-reload, debug |
| staging | Validación | Production-like |
| prod | Producción | Rendimiento, seguridad |
```

### Paso 2: Diseño de Arquitectura

```
──────────────────────────────────────────────────────────────
🔷 TOPOLOGÍA DE SERVICIOS
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌───────────────┐                                          │
│  │    Traefik    │ ─── Puerto 80/443                        │
│  │  (reverse     │                                          │
│  │   proxy)      │                                          │
│  └───────┬───────┘                                          │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌───────────────┐    ┌───────────────┐                     │
│  │      API      │────│    Workers    │                     │
│  │   (app:3000)  │    │  (jobs async) │                     │
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
🔒 SEGMENTACIÓN DE RED
──────────────────────────────────────────────────────────────

| Red | Servicios | Acceso |
|-----|-----------|--------|
| frontend | traefik | Público (80, 443) |
| backend | app, workers | Interno |
| data | db, redis, queue | Interno aislado |
```

### Paso 3: Estructura de Archivos

```
──────────────────────────────────────────────────────────────
📁 ESTRUCTURA DEL PROYECTO
──────────────────────────────────────────────────────────────

proyecto/
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
├── docker-compose.yml          # Base común
├── docker-compose.override.yml # Dev local (auto-cargado)
├── docker-compose.prod.yml     # Producción
├── docker-compose.ci.yml       # Tests CI
│
├── .env.example                # Variables documentadas
├── .dockerignore               # Exclusiones de build
│
├── .github/
│   └── workflows/
│       └── docker.yml          # CI/CD
│
└── docs/
    └── docker-operations.md    # Documentación ops
```

### Paso 4: Generar Archivos

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
  # APLICACIÓN
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
  # BASE DE DATOS
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
  # COLA DE MENSAJES
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
# REDES
# ═══════════════════════════════════════════════════════════
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  data:
    driver: bridge
    internal: true  # Sin acceso a internet

# ═══════════════════════════════════════════════════════════
# VOLÚMENES
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
# STAGE 1: Dependencias
#############################################
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

#############################################
# STAGE 2: Desarrollo
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
# STAGE 4: Producción
#############################################
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copiar artefactos
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Paso 5: Documentación de Operaciones

```markdown
# Operaciones Docker - {Proyecto}

## Comandos Comunes

### Desarrollo
\`\`\`bash
# Iniciar entorno
docker compose up -d

# Ver logs
docker compose logs -f app

# Acceder a shell
docker compose exec app sh

# Rebuild tras cambios en Dockerfile
docker compose up -d --build app
\`\`\`

### Producción
\`\`\`bash
# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Actualización sin downtime
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps app
\`\`\`

### Mantenimiento
\`\`\`bash
# Backup de base de datos
docker compose exec db pg_dump -U user app > backup_$(date +%Y%m%d).sql

# Restaurar
cat backup.sql | docker compose exec -T db psql -U user app

# Limpieza
docker system prune -af
\`\`\`

## Recursos

| Servicio | CPU | Memoria | Notas |
|----------|-----|---------|-------|
| app | 1 | 512MB | Escalado horizontal posible |
| worker | 0.5 | 256MB | Ajustar según carga |
| db | 0.5 | 256MB | Aumentar para prod |
| redis | 0.25 | 128MB | Suficiente para caché |
| rabbitmq | 0.25 | 256MB | Ajustar según colas |
```

### Paso 6: Reporte Final

```
══════════════════════════════════════════════════════════════
📊 ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
✅ ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripción |
|---------|-------------|
| docker-compose.yml | Configuración base |
| docker-compose.override.yml | Override desarrollo |
| docker-compose.prod.yml | Configuración producción |
| docker/app/Dockerfile | Imagen aplicación |
| .env.example | Variables de entorno |
| .dockerignore | Exclusiones build |
| docs/docker-operations.md | Documentación operaciones |

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Copiar .env.example a .env y configurar
2. [ ] Construir imágenes: docker compose build
3. [ ] Iniciar: docker compose up -d
4. [ ] Verificar: docker compose ps
5. [ ] Configurar CI/CD con /docker:cicd-pipeline
```
