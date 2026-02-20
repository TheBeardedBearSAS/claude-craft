---
description: Setup PgBouncer deployment with Docker, Kubernetes, or systemd
argument-hint: <Platform> [method]
---

# PgBouncer Deploy Setup

Voce e um especialista em deployment PgBouncer. Voce deve configurar um deployment completo para PgBouncer no ambiente alvo.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao da plataforma
- (Opcional) Metodo: docker-compose, kubernetes-standalone, kubernetes-sidecar, systemd (padrao: docker-compose)
- (Opcional) HA: yes, no (padrao: no)

Exemplo: `/pgbouncer:deploy-setup "Production web app" method:kubernetes-standalone ha:yes`

## Plan Mode

> **Plan mode e obrigatorio.** Antes de executar, Claude ativa o plan mode para analisar o ambiente alvo, propor uma estrategia de deployment e aguardar validacao.

## MISSAO

### Passo 1: Analisar Ambiente

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projeto: {name}

──────────────────────────────────────────────────────────────
DETECCAO DE AMBIENTE
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalhes |
|------------|-----------|---------|
| PostgreSQL | {version} | {host, port} |
| Alvo de deployment | {Docker/K8s/systemd} | {detalhes} |
| PgBouncer existente | {sim/nao} | {version} |
| Rede | {topologia} | {privada/publica} |
| Gerenciamento de secrets | {metodo} | {K8s Secrets/Vault/env} |
```

### Passo 2: Escolher Estrategia de Deployment

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE DEPLOYMENT
──────────────────────────────────────────────────────────────

Metodo: {Docker Compose / K8s Standalone / K8s Sidecar / Systemd}
HA: {Active-passive / Multiplas replicas / Instancia unica}
Imagem: bitnami/pgbouncer:1.25.1

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Metodo de deployment | {metodo} | {razao} |
| Replicas | {count} | {razao} |
| Health check | {pg_isready / TCP} | {razao} |
| Gerenciamento de config | {ConfigMap/env/file} | {razao} |
```

### Passo 3: Gerar Arquivos de Deployment

Gerar todos os arquivos de configuracao de deployment:
- Definicao do servico Docker Compose (se Docker)
- Manifestos Kubernetes: Deployment, Service, ConfigMap, Secret (se K8s)
- Unit file systemd (se bare metal)
- Configuracao pgbouncer.ini
- Script de health check
- Script de reload para mudancas de configuracao sem tempo de inatividade

### Passo 4: Gerar Health Check

Gerar configuracao de health check apropriada para o alvo de deployment:
- Docker: Instrucao HEALTHCHECK
- Kubernetes: livenessProbe + readinessProbe
- Systemd: Verificacao ExecStartPost

### Passo 5: Gerar Script de Reload

Gerar script de reload sem tempo de inatividade:
```bash
#!/bin/bash
# reload-pgbouncer.sh
# Recarrega configuracao do PgBouncer sem derrubar conexoes
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

1. [ ] Configurar credenciais do banco de dados nos secrets
2. [ ] Implantar PgBouncer no ambiente alvo
3. [ ] Verificar health checks passando
4. [ ] Atualizar DATABASE_URL da aplicacao para apontar ao PgBouncer
5. [ ] Auditar seguranca com /pgbouncer:security-audit
6. [ ] Configurar monitoramento com /pgbouncer:optimize
```
