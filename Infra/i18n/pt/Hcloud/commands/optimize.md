---
description: Optimize Hetzner Cloud cost and performance
argument-hint: [target]
---

# Hcloud Optimize

Voce e um especialista em otimizacao Hetzner Cloud. Voce deve analisar a utilizacao de recursos da infraestrutura e fornecer recomendacoes acionaveis para economia de custos e melhorias de performance.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Alvo: cost, performance, both (padrao: both)

Exemplo: `/hcloud:optimize target:cost`

## Plan Mode

> **O modo plan e recomendado.** Claude analisa a utilizacao atual dos recursos antes de propor otimizacoes.

## MISSION

### Passo 1: Inventario de Recursos

```
══════════════════════════════════════════════════════════════
HCLOUD OPTIMIZATION
══════════════════════════════════════════════════════════════

Target: {cost/performance/both}

──────────────────────────────────────────────────────────────
CURRENT RESOURCE PROFILE
──────────────────────────────────────────────────────────────

| Resource | Count | Monthly Cost | Details |
|----------|-------|-------------|---------|
| Servers | {n} | {cost}€ | {types breakdown} |
| Volumes | {n} | {cost}€ | {total GB} |
| Load Balancers | {n} | {cost}€ | {types} |
| Floating IPs | {n} | {cost}€ | {assigned/unassigned} |
| Snapshots | {n} | {cost}€ | {total GB} |
| **Total** | | **{total}€** | |
```

Inventariar todos os recursos usando hcloud CLI e calcular os custos mensais atuais.

### Passo 2: Dimensionamento de Servidores

```
──────────────────────────────────────────────────────────────
SERVER RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Server | Current Type | CPU Avg | RAM Avg | Recommendation | Savings |
|--------|-------------|---------|---------|----------------|---------|
| {name} | {type} | {x}% | {x}% | {new type} | {x}€/mo |
```

Verificar metricas de servidor e identificar:
- **Servidores superdimensionados** (CPU < 20%): reduzir ou mudar para compartilhado (CX)
- **Candidatos ARM** (workloads compativeis): mudar para CAX para 30-50% de economia
- **Servidores subdimensionados** (CPU > 80%): upgrade ou escalar horizontalmente

### Passo 3: Avaliacao de Migracao ARM

```
──────────────────────────────────────────────────────────────
ARM (CAX) MIGRATION OPPORTUNITIES
──────────────────────────────────────────────────────────────

| Server | Current | Proposed ARM | Monthly Savings | Compatible |
|--------|---------|-------------|-----------------|------------|
| {name} | {type} ({cost}€) | {cax type} ({cost}€) | {savings}€ | {yes/no} |
```

Avaliar cada servidor para compatibilidade ARM (Go, Node.js, Python, Java, .NET 8+, PostgreSQL, MySQL, Redis todos suportam ARM).

### Passo 4: Limpeza de Recursos

```
──────────────────────────────────────────────────────────────
UNUSED RESOURCES
──────────────────────────────────────────────────────────────

| Resource | Name | Status | Cost | Action |
|----------|------|--------|------|--------|
| Server | {name} | Stopped | {cost}€/mo | Snapshot + delete |
| Volume | {name} | Unattached | {cost}€/mo | Archive or delete |
| Floating IP | {ip} | Unassigned | {cost}€/mo | Delete |
| Snapshot | {name} | > 30 days | {cost}€ | Delete |
```

Identificar servidores parados, volumes desanexados, floating IPs nao atribuidos e snapshots antigos.

### Passo 5: Otimizacao de Performance

```
──────────────────────────────────────────────────────────────
PERFORMANCE TUNING
──────────────────────────────────────────────────────────────

| Setting | Current | Recommended | Impact |
|---------|---------|-------------|--------|
| Placement groups | {used/unused} | Usado para HA | Distribuicao entre hosts |
| Private network | {used/unused} | Usado para todo interno | Menor latencia, gratuito |
| Load balancer type | {lb11/lb21} | {recomendacao} | Throughput |
| Volume I/O | {standard} | Considerar SSD local | Melhoria de IOPS |
| Server location | {location} | {recomendacao} | Latencia |
```

Padroes chave de otimizacao:
- **Rede privada** para trafego entre servidores (gratuito, menor latencia)
- **Grupos de posicionamento** com spread policy para alta disponibilidade
- **SSD local** ao inves de block volumes para workloads efemeros de alto IOPS
- **CDN** para assets estaticos para reduzir largura de banda de saida

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
OPTIMIZATION REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Optimization | Impact | Effort | Monthly Savings | Priority |
|-------------|--------|--------|-----------------|----------|
| Dimensionar servidores | Alto | Baixo | {x}€ | 1 |
| Migrar para ARM (CAX) | Alto | Medio | {x}€ | 2 |
| Deletar recursos nao utilizados | Medio | Baixo | {x}€ | 3 |
| Limpar snapshots antigos | Baixo | Baixo | {x}€ | 4 |
| Otimizar rede | Medio | Medio | {x}€ | 5 |

**Total de economia potencial: {total}€/mes ({percentage}% de reducao)**

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar recomendacoes de dimensionamento de servidores
2. [ ] Testar compatibilidade ARM para servidores identificados
3. [ ] Deletar recursos nao utilizados apos confirmacao da equipe
4. [ ] Configurar automacao de limpeza de snapshots
5. [ ] Auditar postura de seguranca com /hcloud:security-audit
```
