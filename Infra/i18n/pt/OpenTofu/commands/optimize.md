---
description: Otimização de custos e análise de recursos OpenTofu
argument-hint: [Alvo]
---

# OpenTofu Optimize

Você é um especialista em otimização de custos OpenTofu. Você deve analisar as configurações de infraestrutura e fornecer recomendações acionáveis de redução de custos.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Alvo: resources, costs, tags, full (padrão: full)
- (Opcional) Caminho para o diretório de configuração

Exemplo: `/opentofu:optimize target:full path:infra/`

## Modo Plan

> **O modo plan é recomendado.** Claude analisa as configurações atuais antes de propor otimizações.

## MISSÃO

### Etapa 1: Análise de Recursos

```
══════════════════════════════════════════════════════════════
OPENTOFU OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {resources/costs/tags/full}
Path: {configuration path}

──────────────────────────────────────────────────────────────
RESOURCE INVENTORY
──────────────────────────────────────────────────────────────
```

Analisar com:
```bash
tofu state list | sort
infracost breakdown --path=. --format=table
```

### Etapa 2: Detalhamento de Custos

```
──────────────────────────────────────────────────────────────
COST ANALYSIS
──────────────────────────────────────────────────────────────

| Resource Type | Count | Monthly Cost | % Total |
|---------------|-------|-------------|---------|
| Compute | {n} | ${x} | {y}% |
| Database | {n} | ${x} | {y}% |
| Storage | {n} | ${x} | {y}% |
| Network | {n} | ${x} | {y}% |
| **Total** | | **${x}** | **100%** |
```

### Etapa 3: Recomendações de Dimensionamento Correto

```
──────────────────────────────────────────────────────────────
RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Resource | Current | Recommended | Savings |
|----------|---------|-------------|---------|
| {resource} | {type} | {type} | {x}% |
```

### Etapa 4: Conformidade de Tags

```
──────────────────────────────────────────────────────────────
TAG COMPLIANCE
──────────────────────────────────────────────────────────────

| Required Tag | Coverage | Missing Resources |
|-------------|----------|-------------------|
| CostCenter | {x}% | {list} |
| Environment | {x}% | {list} |
| Project | {x}% | {list} |
```

### Etapa 5: Ações de Otimização

Gerar alterações específicas de configuração OpenTofu:
- Definições de recursos com dimensionamento correto
- Configurações de instâncias spot/preemptible
- Otimização de camadas de armazenamento
- Tags padrão no provider
- Políticas OPA de custos

### Etapa 6: Relatório Final

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Right-size instances | High | Low | 1 |
| Enable spot instances | High | Medium | 2 |
| Tag compliance | Medium | Low | 3 |
| Infracost CI gate | Medium | Medium | 4 |

──────────────────────────────────────────────────────────────
ESTIMATED SAVINGS
──────────────────────────────────────────────────────────────

| Area | Current | Optimized | Monthly Savings |
|------|---------|-----------|-----------------|
| Compute | ${x} | ${y} | ${z} |
| Database | ${x} | ${y} | ${z} |
| Storage | ${x} | ${y} | ${z} |
| **Total** | **${x}** | **${y}** | **${z}** |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Apply right-sizing in dev first
2. [ ] Integrate Infracost in CI/CD
3. [ ] Enforce tag compliance via OPA
4. [ ] Review reserved instance opportunities
5. [ ] Schedule monthly cost review
```
