---
description: Arquitetura Docker Completa
argument-hint: [arguments]
---

# Arquitetura Docker Completa

Você é um arquiteto Docker senior. Você deve projetar uma arquitetura containerizada completa a partir das especificações do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do projeto
- Stack técnico (ex: symfony, node, python)
- Serviços necessários (ex: postgres, redis, elasticsearch)
- Restrições (ex: prod, multi-env, microservices)

Exemplo: `/docker:architecture "API REST E-commerce" stack:node services:postgres,redis,elasticsearch`

## MISSÃO

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
🏗️ ARQUITETURA DOCKER
══════════════════════════════════════════════════════════════

Projeto: {nome}
Descrição: {descrição}

──────────────────────────────────────────────────────────────
📋 ANÁLISE DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Técnico
| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Backend | {tech} | {versão} |
| Banco de dados | {tech} | {versão} |
| Cache | {tech} | {versão} |

### Serviços Necessários
| Serviço | Uso | Criticidade |
|---------|-----|-------------|
| {serviço} | {uso} | Alta/Média/Baixa |

### Ambientes
| Env | Propósito | Especificidades |
|-----|-----------|-----------------|
| dev | Desenvolvimento | Hot-reload, debug |
| staging | Validação | Production-like |
| prod | Produção | Performance, segurança |
```

### Passo 2: Design de Arquitetura

```
──────────────────────────────────────────────────────────────
🔷 TOPOLOGIA DE SERVIÇOS
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌───────────────┐                                          │
│  │    Traefik    │ ─── Porta 80/443                         │
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
🔒 SEGMENTAÇÃO DE REDE
──────────────────────────────────────────────────────────────

| Rede | Serviços | Acesso |
|------|----------|--------|
| frontend | traefik | Público (80, 443) |
| backend | app, workers | Interno |
| data | db, redis, queue | Interno isolado |
```

### Passo 3: Estrutura de Arquivos

```
──────────────────────────────────────────────────────────────
📁 ESTRUTURA DO PROJETO
──────────────────────────────────────────────────────────────

projeto/
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
├── docker-compose.yml          # Base comum
├── docker-compose.override.yml # Dev local (auto-carregado)
├── docker-compose.prod.yml     # Produção
├── docker-compose.ci.yml       # Testes CI
│
├── .env.example                # Variáveis documentadas
├── .dockerignore               # Exclusões de build
│
├── .github/
│   └── workflows/
│       └── docker.yml          # CI/CD
│
└── docs/
    └── docker-operations.md    # Documentação ops
```

### Passo 4: Gerar Arquivos

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
  # APLICAÇÃO
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
  # BANCO DE DADOS
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
  # FILA DE MENSAGENS
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
    internal: true  # Sem acesso à internet

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
# STAGE 1: Dependências
#############################################
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

#############################################
# STAGE 2: Desenvolvimento
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
# STAGE 4: Produção
#############################################
FROM node:20-alpine AS production

WORKDIR /app

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copiar artefatos
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### Passo 5: Documentação de Operações

```markdown
# Operações Docker - {Projeto}

## Comandos Comuns

### Desenvolvimento
\`\`\`bash
# Iniciar ambiente
docker compose up -d

# Ver logs
docker compose logs -f app

# Acessar shell
docker compose exec app sh

# Rebuild após mudanças no Dockerfile
docker compose up -d --build app
\`\`\`

### Produção
\`\`\`bash
# Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Atualização sem downtime
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps app
\`\`\`

### Manutenção
\`\`\`bash
# Backup do banco de dados
docker compose exec db pg_dump -U user app > backup_$(date +%Y%m%d).sql

# Restaurar
cat backup.sql | docker compose exec -T db psql -U user app

# Limpeza
docker system prune -af
\`\`\`

## Recursos

| Serviço | CPU | Memória | Notas |
|---------|-----|---------|-------|
| app | 1 | 512MB | Escala horizontal possível |
| worker | 0.5 | 256MB | Ajustar conforme carga |
| db | 0.5 | 256MB | Aumentar para prod |
| redis | 0.25 | 128MB | Suficiente para cache |
| rabbitmq | 0.25 | 256MB | Ajustar conforme filas |
```

### Passo 6: Relatório Final

```
══════════════════════════════════════════════════════════════
📊 ARQUITETURA GERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
✅ ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descrição |
|---------|-----------|
| docker-compose.yml | Configuração base |
| docker-compose.override.yml | Override desenvolvimento |
| docker-compose.prod.yml | Configuração produção |
| docker/app/Dockerfile | Imagem aplicação |
| .env.example | Variáveis de ambiente |
| .dockerignore | Exclusões build |
| docs/docker-operations.md | Documentação operações |

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Copiar .env.example para .env e configurar
2. [ ] Construir imagens: docker compose build
3. [ ] Iniciar: docker compose up -d
4. [ ] Verificar: docker compose ps
5. [ ] Configurar CI/CD com /docker:cicd-pipeline
```
