---
description: Configuração Docker Compose
argument-hint: [arguments]
---

# Configuração Docker Compose

Você é um especialista em orquestração Docker Compose. Você deve gerar uma configuração completa e otimizada para um ambiente multi-serviço.

## Argumentos
$ARGUMENTS

Argumentos:
- Serviços necessários (ex: postgres, redis, rabbitmq)
- Contexto: dev, staging, prod
- Stack técnico (ex: symfony, node, python)

Exemplo: `/docker:compose-setup postgres,redis context:dev stack:symfony`

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## MISSÃO

### Passo 1: Analisar Requisitos

Identificar serviços e suas interações:

```
══════════════════════════════════════════════════════════════
🐳 ANÁLISE DOCKER COMPOSE
══════════════════════════════════════════════════════════════

Projeto: {nome}
Contexto: {dev|staging|prod}
Stack: {stack}

──────────────────────────────────────────────────────────────
📋 SERVIÇOS IDENTIFICADOS
──────────────────────────────────────────────────────────────

| Serviço | Imagem | Porta Interna | Porta Exposta | Volumes |
|---------|--------|---------------|---------------|---------|
| app | custom | 3000 | 3000 | code |
| db | postgres:16 | 5432 | 5432 (dev) | data |
| redis | redis:7 | 6379 | - | data |
```

### Passo 2: Gerar docker-compose.yml

```yaml
# docker-compose.yml - Base comum
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

### Passo 3: Gerar Override de Desenvolvimento

```yaml
# docker-compose.override.yml - Desenvolvimento (auto-carregado)
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
      - "5432:5432"  # Acesso direto para ferramentas

  redis:
    ports:
      - "6379:6379"
```

### Passo 4: Gerar Configuração de Produção

```yaml
# docker-compose.prod.yml - Produção
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

### Passo 5: Gerar .env.example

```bash
# .env.example - Variáveis de ambiente

# Aplicação
NODE_ENV=development
APP_PORT=3000
APP_SECRET=alterar-em-producao

# Banco de dados
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Redis
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=debug
```

### Passo 6: Relatório Final

```
══════════════════════════════════════════════════════════════
📊 CONFIGURAÇÃO GERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📁 ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

✅ docker-compose.yml          # Base comum
✅ docker-compose.override.yml # Dev (auto-carregado)
✅ docker-compose.prod.yml     # Produção
✅ .env.example                # Variáveis

──────────────────────────────────────────────────────────────
🚀 COMANDOS
──────────────────────────────────────────────────────────────

# Desenvolvimento (usa override automaticamente)
docker compose up -d
docker compose logs -f app

# Produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Parar
docker compose down

# Com remoção de volumes
docker compose down -v

──────────────────────────────────────────────────────────────
🔧 CONFIGURAÇÃO DE REDE
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────┐
│              REDE: backend              │
├─────────────────────────────────────────┤
│  app ←──→ db (5432)                     │
│  app ←──→ redis (6379)                  │
└─────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
💾 VOLUMES PERSISTENTES
──────────────────────────────────────────────────────────────

| Volume | Caminho no Container | Uso |
|--------|---------------------|-----|
| postgres_data | /var/lib/postgresql/data | DB |
| redis_data | /data | Cache |
```
