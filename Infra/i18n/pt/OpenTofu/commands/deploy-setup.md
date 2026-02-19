---
description: Configurar pipeline de CI/CD para OpenTofu
argument-hint: <Plataforma> [ambientes]
---

# OpenTofu Deploy Setup

Você é um especialista em implantação OpenTofu. Você deve configurar um pipeline completo de CI/CD para implantação segura de infraestrutura.

## Argumentos
$ARGUMENTS

Argumentos:
- Plataforma de CI/CD (github-actions, gitlab-ci)
- (Opcional) Ambientes: dev,staging,prod
- (Opcional) Estratégia de aprovação: manual, auto-dev-manual-prod

Exemplo: `/opentofu:deploy-setup "github-actions" envs:dev,staging,prod approval:manual-prod`

## Modo Plan

> **O modo plan é obrigatório.** Antes de executar, Claude ativa o modo plan para analisar o projeto, propor uma estratégia de implantação e aguardar validação.

## MISSÃO

### Etapa 1: Analisar Projeto

```
══════════════════════════════════════════════════════════════
OPENTOFU DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
PROJECT DETECTION
──────────────────────────────────────────────────────────────

| Component | Detected | Details |
|-----------|----------|---------|
| OpenTofu version | {version} | versions.tf |
| Backend | {type} | {S3/GCS/Azure} |
| Environments | {count} | {list} |
| State encryption | {yes/no} | {method} |
| Modules | {count} | {list} |
```

### Etapa 2: Projetar Estratégia do Pipeline

```
──────────────────────────────────────────────────────────────
PIPELINE STRATEGY
──────────────────────────────────────────────────────────────

Platform: {GitHub Actions / GitLab CI}
Approval: {auto-dev / manual-staging / manual-prod}

Pipeline:
  PR opened
    -> Validate (fmt, validate)
    -> Plan (per environment)
    -> Comment PR with plan output

  PR merged to main
    -> Plan (saved artifact)
    -> Apply dev (auto)
    -> Apply staging (auto/manual)
    -> Apply prod (manual approval)
```

### Etapa 3: Gerar Pipeline de CI/CD

Gerar configuração completa do pipeline com:
- Etapa de configuração do OpenTofu (`opentofu/setup-opentofu@v1`)
- Estágios de init, plan, apply
- Artefato de plan para applies seguros
- Comentário no PR com saída do plan
- Gates de aprovação por ambiente
- Autenticação OIDC (sem segredos de longa duração)

### Etapa 4: Gerar Detecção de Drift

Gerar workflow agendado de detecção de drift:
- Execução baseada em cron (ex: manhãs de dias úteis)
- Plan com `-detailed-exitcode`
- Notificação quando drift detectado

### Etapa 5: Gerar Procedimento de Rollback

Documentar estratégia de rollback:
- Versionamento e restauração de estado
- Destroy direcionado para novos recursos
- Procedimentos de intervenção manual

### Etapa 6: Relatório Final

```
══════════════════════════════════════════════════════════════
SETUP REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| .github/workflows/tofu-plan.yml | PR plan workflow |
| .github/workflows/tofu-apply.yml | Apply workflow |
| .github/workflows/tofu-drift.yml | Drift detection |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Configure OIDC provider in cloud account
2. [ ] Create IAM roles for plan and apply
3. [ ] Set GitHub environment protection rules
4. [ ] Test pipeline with a no-op change
5. [ ] Configure monitoring with drift detection
```
