---
description: Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone
argument-hint: <Platform> [method]
---

# FrankenPHP Deploy Setup

Voce e um especialista em deployment FrankenPHP. Voce deve configurar um deployment completo para FrankenPHP no ambiente alvo.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao da plataforma
- (Opcional) Metodo: docker-compose, kubernetes, standalone-binary (padrao: docker-compose)
- (Opcional) Framework: symfony, laravel, php (padrao: auto-detect)

Exemplo: `/frankenphp:deploy-setup "Production API" method:kubernetes framework:symfony`

## Plan Mode

> **Plan mode e obrigatorio.** Antes de executar, Claude ativa o plan mode para analisar o ambiente alvo, propor uma estrategia de deployment e aguardar validacao.

## MISSAO

### Passo 1: Analisar Ambiente

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projeto: {name}

──────────────────────────────────────────────────────────────
DETECCAO DE AMBIENTE
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalhes |
|------------|-----------|---------|
| Framework PHP | {Symfony/Laravel/PHP} | {versao} |
| Alvo de deployment | {Docker/K8s/standalone} | {detalhes} |
| FrankenPHP existente | {sim/nao} | {versao} |
| Estrategia TLS | {auto/proxy/manual} | {detalhes} |
| Gerenciamento de secrets | {metodo} | {K8s Secrets/Vault/env} |
```

### Passo 2: Escolher Estrategia de Deployment

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE DEPLOYMENT
──────────────────────────────────────────────────────────────

Metodo: {Docker Compose / Kubernetes / Binario Standalone}
Imagem: dunglas/frankenphp:1.11-php8.5-bookworm
Worker mode: {sim/nao}

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Metodo de deployment | {metodo} | {razao} |
| Replicas | {contagem} | {razao} |
| Health check | {HTTP /healthz} | {razao} |
| Terminacao TLS | {FrankenPHP/proxy} | {razao} |
```

### Passo 3: Gerar Arquivos de Deployment

Gerar todos os arquivos de configuracao de deployment:
- Dockerfile (multi-stage, otimizado para producao)
- docker-compose.yml (se metodo Docker)
- Manifestos Kubernetes: Deployment, Service, HPA (se metodo K8s)
- Caddyfile para o ambiente
- Configuracao PHP (opcache, seguranca)
- Endpoint de health check

### Passo 4: Gerar Health Check

Gerar health check apropriado para o alvo de deployment:
- Docker: Instrucao HEALTHCHECK
- Kubernetes: livenessProbe + readinessProbe (HTTP)
- Standalone: Verificacao systemd

### Passo 5: Gerar Script de Reload

Gerar script de reload sem tempo de inatividade:
```bash
#!/bin/bash
# reload-frankenphp.sh
# Recarrega workers FrankenPHP sem derrubar conexoes (SIGUSR1)
```

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE SETUP
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descricao |
|---------|-----------|
| {file} | {descricao} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Configurar variaveis de ambiente (SERVER_NAME, secrets)
2. [ ] Construir e implantar imagem FrankenPHP
3. [ ] Verificar health checks passando
4. [ ] Auditar seguranca com /frankenphp:security-audit
5. [ ] Otimizar performance com /frankenphp:optimize
```
