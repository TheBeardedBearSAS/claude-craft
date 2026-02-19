---
description: Setup CI/CD pipeline for Hetzner Cloud deployments
argument-hint: <Platform> [ci-tool]
---

# Hcloud Deploy Setup

Voce e um especialista em deployment Hetzner Cloud. Voce deve configurar um pipeline CI/CD completo para deployments de infraestrutura baseados em hcloud.

## Arguments
$ARGUMENTS

Argumentos:
- Descricao da plataforma
- (Opcional) Ferramenta CI: github-actions, gitlab-ci (padrao: github-actions)
- (Opcional) Estrategia: blue-green, snapshot, rebuild (padrao: blue-green)

Exemplo: `/hcloud:deploy-setup "Plataforma Web" ci:github-actions strategy:blue-green`

## Plan Mode

> **O modo plan e obrigatorio.** Antes de executar, Claude ativa o modo plan para analisar o projeto, propor uma estrategia de pipeline e aguardar validacao.

## MISSION

### Passo 1: Analisar Projeto

```
══════════════════════════════════════════════════════════════
HCLOUD DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
INFRASTRUCTURE DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| Servers | {count} | {types, locations} |
| Networks | {count} | {names, subnets} |
| Load Balancers | {count} | {names} |
| Firewalls | {count} | {names} |
| Volumes | {count} | {sizes} |
| Floating IPs | {count} | {assigned/unassigned} |
| Snapshots | {count} | {latest date} |
```

### Passo 2: Projetar Pipeline

```
──────────────────────────────────────────────────────────────
PIPELINE STRATEGY
──────────────────────────────────────────────────────────────

CI Tool: {GitHub Actions / GitLab CI}
Strategy: {Blue-Green / Snapshot / Rebuild}

Pipeline:
  Push / PR
    → Lint & Test (application code)
    → Build Image (Packer, optional)
    → Deploy Staging (auto)
    → Smoke Tests
    → Approval Gate
    → Deploy Production

──────────────────────────────────────────────────────────────
STRATEGY SELECTION
──────────────────────────────────────────────────────────────

| Stage | Tool | Trigger | Artifacts |
|-------|------|---------|-----------|
| Build | Packer / cloud-init | On push | Snapshot ID |
| Deploy Staging | hcloud CLI | On merge to main | Server status |
| Smoke Test | curl / health check | After staging | Test report |
| Deploy Prod | hcloud CLI | Manual approval | Server status |
```

### Passo 3: Gerar Pipeline CI

Gerar o arquivo de configuracao CI/CD:

Para **GitHub Actions** (`.github/workflows/hcloud-deploy.yml`):
- Instalar hcloud CLI via `hetznercloud/setup-hcloud@v1`
- Construir imagem Packer (opcional) ou usar cloud-init
- Deploy no staging ao fazer merge para main
- Executar health checks contra o staging
- Deploy em producao com gate de aprovacao manual
- Blue-green: criar novo servidor, trocar floating IP, deletar antigo
- Usar GitHub Secrets para `HCLOUD_TOKEN` por ambiente

Para **GitLab CI** (`.gitlab-ci.yml`):
- Usar stages: build, deploy-staging, test, deploy-prod
- Instalar hcloud CLI via curl/pip
- Usar variaveis protegidas para HCLOUD_TOKEN

### Passo 4: Gerar Scripts de Deployment

Gerar scripts auxiliares de deployment:
- `scripts/deploy.sh` -- Script principal de deployment usando hcloud CLI
- `scripts/rollback.sh` -- Rollback para snapshot anterior
- `scripts/health-check.sh` -- Verificar saude do deployment

### Passo 5: Gerar Template Packer (se baseado em imagem)

Gerar template Packer `hcloud.pkr.hcl` para construcao de golden images com o plugin hcloud builder.

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
SETUP REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| .github/workflows/hcloud-deploy.yml | Pipeline CI/CD |
| scripts/deploy.sh | Script de deployment |
| scripts/rollback.sh | Script de rollback |
| scripts/health-check.sh | Script de health check |
| hcloud.pkr.hcl | Template Packer (se aplicavel) |
| cloud-init.yml | Template de provisionamento de servidor |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Armazenar HCLOUD_TOKEN nos secrets do CI (por ambiente)
2. [ ] Armazenar chave privada SSH nos secrets do CI
3. [ ] Testar pipeline de ponta a ponta em uma feature branch
4. [ ] Auditar postura de seguranca com /hcloud:security-audit
5. [ ] Otimizar custos com /hcloud:optimize
```
