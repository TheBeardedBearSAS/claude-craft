---
description: Configuración Docker Compose
argument-hint: [arguments]
---

# Configuración Docker Compose

Eres un experto en orquestación Docker Compose. Debes generar una configuración completa y optimizada para un entorno multi-servicio.

## Argumentos
$ARGUMENTS

Argumentos:
- Servicios requeridos (ej: postgres, redis, rabbitmq)
- Contexto: dev, staging, prod
- Stack técnico (ej: symfony, node, python)

Ejemplo: `/docker:compose-setup postgres,redis context:dev stack:symfony`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Analizar Requisitos

Identificar servicios y sus interacciones:

```
══════════════════════════════════════════════════════════════
🐳 ANÁLISIS DOCKER COMPOSE
══════════════════════════════════════════════════════════════

Proyecto: {nombre}
Contexto: {dev|staging|prod}
Stack: {stack}

──────────────────────────────────────────────────────────────
📋 SERVICIOS IDENTIFICADOS
──────────────────────────────────────────────────────────────

| Servicio | Imagen | Puerto Interno | Puerto Expuesto | Volúmenes |
|----------|--------|----------------|-----------------|-----------|
| app | custom | 3000 | 3000 | code |
| db | postgres:16 | 5432 | 5432 (dev) | data |
| redis | redis:7 | 6379 | - | data |
```

### Paso 2: Generar docker-compose.yml

```yaml
# docker-compose.yml - Base común
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

### Paso 3: Generar Override de Desarrollo

```yaml
# docker-compose.override.yml - Desarrollo (auto-cargado)
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
      - "5432:5432"  # Acceso directo para herramientas

  redis:
    ports:
      - "6379:6379"
```

### Paso 4: Generar Configuración de Producción

```yaml
# docker-compose.prod.yml - Producción
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

### Paso 5: Generar .env.example

```bash
# .env.example - Variables de entorno

# Aplicación
NODE_ENV=development
APP_PORT=3000
APP_SECRET=cambiar-en-produccion

# Base de datos
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Redis
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=debug
```

### Paso 6: Reporte Final

```
══════════════════════════════════════════════════════════════
📊 CONFIGURACIÓN GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

✅ docker-compose.yml          # Base común
✅ docker-compose.override.yml # Dev (auto-cargado)
✅ docker-compose.prod.yml     # Producción
✅ .env.example                # Variables

──────────────────────────────────────────────────────────────
🚀 COMANDOS
──────────────────────────────────────────────────────────────

# Desarrollo (usa override automáticamente)
docker compose up -d
docker compose logs -f app

# Producción
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Parar
docker compose down

# Con eliminación de volúmenes
docker compose down -v

──────────────────────────────────────────────────────────────
🔧 CONFIGURACIÓN DE RED
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│              RED: backend               │
├─────────────────────────────────────────┤
│  app ←──→ db (5432)                     │
│  app ←──→ redis (6379)                  │
└─────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
💾 VOLÚMENES PERSISTENTES
──────────────────────────────────────────────────────────────

| Volumen | Ruta en Contenedor | Uso |
|---------|-------------------|-----|
| postgres_data | /var/lib/postgresql/data | DB |
| redis_data | /data | Cache |
```
