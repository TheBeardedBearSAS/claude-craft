---
description: Initialize project for Coolify deployment
argument-hint: [arguments]
---

# Coolify Setup

Voce e um especialista em deploy Coolify. Voce deve analisar o projeto e prepara-lo para deploy em uma instancia Coolify PaaS auto-hospedada.

## Arguments
$ARGUMENTS

Argumentos:
- Descricao ou caminho do projeto
- (Opcional) Build pack alvo: nixpacks, dockerfile, compose
- (Opcional) Servicos necessarios: postgres, redis, mysql, mongodb

Exemplo: `/coolify:setup "API Node.js com PostgreSQL e Redis"` ou `/coolify:setup . buildpack:dockerfile services:postgres,redis`

## MISSAO

### Etapa 1: Analisar Stack do Projeto

```bash
# Detectar tipo de projeto
ls -la package.json composer.json requirements.txt go.mod Cargo.toml Gemfile *.csproj 2>/dev/null

# Verificar arquivos Docker existentes
ls -la Dockerfile* docker-compose*.yml .dockerignore nixpacks.toml 2>/dev/null

# Verificar configuracao de ambiente
ls -la .env .env.example .env.local 2>/dev/null

# Identificar servicos a partir do codigo
grep -r "DATABASE_URL\|REDIS_URL\|MONGODB_URI\|MYSQL_" .env* 2>/dev/null
```

```
══════════════════════════════════════════════════════════════
COOLIFY - CONFIGURACAO DO PROJETO
══════════════════════════════════════════════════════════════

Projeto: {name}
Caminho: {path}

──────────────────────────────────────────────────────────────
DETECCAO DE STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Versao |
|------------|-----------|--------|
| Linguagem | {language} | {version} |
| Framework | {framework} | {version} |
| Gerenciador de pacotes | {npm/yarn/pnpm/composer/pip} | {version} |

| Servico | Detectado | Fonte |
|---------|-----------|-------|
| {database} | {sim/nao} | {variavel de ambiente / arquivo de config} |
| {cache} | {sim/nao} | {variavel de ambiente / arquivo de config} |
| {queue} | {sim/nao} | {variavel de ambiente / arquivo de config} |
```

### Etapa 2: Recomendar Build Pack

```
──────────────────────────────────────────────────────────────
RECOMENDACAO DE BUILD PACK
──────────────────────────────────────────────────────────────

Recomendado: {Nixpacks / Dockerfile / Docker Compose}

Justificativa:
- {razao 1}
- {razao 2}

| Build Pack | Vantagens | Desvantagens |
|------------|-----------|--------------|
| Nixpacks | Zero-config, auto-detect | Menos controle |
| Dockerfile | Controle total, reproduzivel | Configuracao manual |
| Docker Compose | Multi-servico, setup existente | Mais complexo |

Selecionado: {build pack}
```

### Etapa 3: Gerar/Validar Configuracao

Para Nixpacks:
```toml
# nixpacks.toml (se customizacao necessaria)
[phases.setup]
nixPkgs = ["..."]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

Para Dockerfile (se nao presente):
```dockerfile
# Gerar Dockerfile apropriado baseado na stack detectada
# Build multi-stage otimizado para deploy no Coolify
```

Para Docker Compose (validar existente):
```yaml
# Validar docker-compose.yml para compatibilidade com Coolify
# Verificar conflitos de porta, definicoes de volume, configuracao de rede
```

### Etapa 4: Criar Template de Ambiente

```
──────────────────────────────────────────────────────────────
VARIAVEIS DE AMBIENTE
──────────────────────────────────────────────────────────────
```

Gerar template `.env.coolify`:
```bash
# =============================================================================
# Template de Variaveis de Ambiente Coolify
# =============================================================================
# Copie estas variaveis para a configuracao do servico Coolify
# Dashboard > Service > Environment Variables

# Aplicacao
NODE_ENV=production
APP_URL=https://{seu-dominio}
PORT=3000

# Banco de dados (usar PostgreSQL gerenciado pelo Coolify)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${SERVICE_URL_POSTGRES}:5432/${POSTGRES_DB}

# Cache (usar Redis gerenciado pelo Coolify)
REDIS_URL=redis://${SERVICE_URL_REDIS}:6379

# Secrets (gerar valores unicos)
SECRET_KEY={gerar-com: openssl rand -hex 32}
JWT_SECRET={gerar-com: openssl rand -hex 64}

# Servicos Externos (configurar conforme necessario)
# SMTP_HOST=
# SMTP_PORT=587
# S3_ENDPOINT=
# S3_BUCKET=
```

### Etapa 5: Gerar Checklist de Deploy

```
──────────────────────────────────────────────────────────────
CHECKLIST DE DEPLOY
──────────────────────────────────────────────────────────────

### Pre-requisitos do Servidor
- [ ] VPS provisionado (min 4 GB RAM, 2 vCPU, 50 GB SSD)
- [ ] Coolify instalado: curl -fsSL https://cdn.coolify.io/install.sh | bash
- [ ] Firewall configurado: portas 22, 80, 443 abertas
- [ ] Autenticacao por chave SSH habilitada

### Configuracao de DNS
- [ ] Registro A: {dominio} → {server-ip}
- [ ] (Opcional) Wildcard: *.{dominio} → {server-ip}
- [ ] Propagacao DNS verificada: dig +short {dominio}

### Configuracao do Coolify
- [ ] Fonte Git conectada (GitHub App / deploy key)
- [ ] Projeto criado no dashboard Coolify
- [ ] Ambiente criado (producao/staging)
- [ ] Servico de aplicacao adicionado

### Configuracao do Servico
- [ ] Build pack selecionado: {recomendacao}
- [ ] Comandos de build/start verificados
- [ ] Porta configurada: {porta}
- [ ] Variaveis de ambiente definidas
- [ ] Dominio configurado com SSL
- [ ] Endpoint de health check: /health

### Configuracao de Banco de Dados (se aplicavel)
- [ ] Servico de banco de dados criado no Coolify
- [ ] URL de conexao definida nas variaveis de ambiente
- [ ] Migracao/seed inicial prontos
- [ ] Agendamento de backup configurado

### Pos-Deploy
- [ ] Health check respondendo
- [ ] Certificado SSL valido
- [ ] Aplicacao funcional
- [ ] Monitoramento configurado
```

### Etapa 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE CONFIGURACAO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS/VERIFICADOS
──────────────────────────────────────────────────────────────

| Arquivo | Status | Descricao |
|---------|--------|-----------|
| {arquivo} | {criado/verificado/modificado} | {descricao} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar .env.coolify e definir valores de producao
2. [ ] Completar checklist de pre-requisitos do servidor
3. [ ] Configurar registros DNS
4. [ ] Fazer deploy com /coolify:deploy
5. [ ] Configurar backups com /coolify:backup
```
