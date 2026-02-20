---
description: Optimize PgBouncer pool performance and connection utilization
argument-hint: [target]
---

# Otimizacao PgBouncer

Voce e um especialista em otimizacao PgBouncer. Voce deve analisar metricas de utilizacao de pool e fornecer recomendacoes acionaveis para ajuste de desempenho, otimizacao de timeouts e avaliacao de migracao para transaction mode.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Alvo: pool-sizing, timeouts, txn-mode-migration, full (padrao: full)

Exemplo: `/pgbouncer:optimize target:pool-sizing`

## Plan Mode

> **Plan mode e recomendado.** Claude analisa as metricas atuais do pool antes de propor otimizacoes.

## MISSAO

### Passo 1: Coletar Metricas

```
══════════════════════════════════════════════════════════════
OTIMIZACAO PGBOUNCER
══════════════════════════════════════════════════════════════

Alvo: {pool-sizing/timeouts/txn-mode-migration/full}

──────────────────────────────────────────────────────────────
PERFIL ATUAL DO POOL
──────────────────────────────────────────────────────────────

| Database | Pool Mode | Pool Size | cl_active | cl_waiting | sv_active | sv_idle | Utilizacao |
|----------|-----------|-----------|-----------|------------|-----------|---------|------------|
| {db} | {mode} | {size} | {n} | {n} | {n} | {n} | {%} |
```

Coletar metricas via comandos SHOW:
```sql
SHOW POOLS;
SHOW STATS;
SHOW CONFIG;
SHOW LISTS;
```

### Passo 2: Analise de Utilizacao do Pool

```
──────────────────────────────────────────────────────────────
UTILIZACAO DO POOL
──────────────────────────────────────────────────────────────

| Database | Tamanho Atual | Pico sv_active | Utilizacao Media | Recomendacao | Acao |
|----------|--------------|----------------|------------------|-------------|------|
| {db} | {size} | {peak} | {%} | {novo tamanho} | {aumentar/diminuir/manter} |

──────────────────────────────────────────────────────────────
RECOMENDACOES DE DIMENSIONAMENTO
──────────────────────────────────────────────────────────────

| Parametro | Atual | Recomendado | Impacto |
|-----------|-------|-------------|---------|
| default_pool_size | {atual} | {novo} | {descricao} |
| min_pool_size | {atual} | {novo} | {descricao} |
| reserve_pool_size | {atual} | {novo} | {descricao} |
| max_client_conn | {atual} | {novo} | {descricao} |
| max_db_connections | {atual} | {novo} | {descricao} |
```

### Passo 3: Ajuste de Timeouts

```
──────────────────────────────────────────────────────────────
ANALISE DE TIMEOUTS
──────────────────────────────────────────────────────────────

| Timeout | Atual | Recomendado | Justificativa |
|---------|-------|-------------|---------------|
| server_lifetime | {atual} | {novo} | {razao} |
| server_idle_timeout | {atual} | {novo} | {razao} |
| client_idle_timeout | {atual} | {novo} | {razao} |
| query_wait_timeout | {atual} | {novo} | {razao} |
| client_login_timeout | {atual} | {novo} | {razao} |
| server_connect_timeout | {atual} | {novo} | {razao} |
| reserve_pool_timeout | {atual} | {novo} | {razao} |
```

### Passo 4: Avaliacao de Migracao para Transaction Mode

```
──────────────────────────────────────────────────────────────
MIGRACAO PARA TRANSACTION MODE
──────────────────────────────────────────────────────────────

Mode atual: {session/transaction}

| Verificacao de Compatibilidade | Status | Detalhes |
|-------------------------------|--------|---------|
| Prepared statements | {compativel/precisa-correcao} | {detalhes} |
| Comandos SET | {compativel/precisa-correcao} | {detalhes} |
| LISTEN/NOTIFY | {compativel/incompativel} | {detalhes} |
| Temp tables | {compativel/incompativel} | {detalhes} |
| Advisory locks | {compativel/precisa-session} | {detalhes} |

Migracao possivel: {sim/nao/parcial}
Ganho estimado de multiplexacao: {x}× reducao de conexoes
server_reset_query necessario: {DISCARD ALL / customizado}
```

### Passo 5: Estatisticas de Desempenho

```
──────────────────────────────────────────────────────────────
METRICAS DE DESEMPENHO
──────────────────────────────────────────────────────────────

| Metrica | Atual | Meta | Status |
|---------|-------|------|--------|
| avg_wait_time | {ms} | < 100ms | {ok/alto} |
| avg_xact_time | {ms} | < 500ms | {ok/alto} |
| avg_query_time | {ms} | < 100ms | {ok/alto} |
| Throughput xact/s | {n} | {meta} | {ok/baixo} |
| Proporcao de reuso de conexao | {x}:1 | > 10:1 | {ok/baixo} |
```

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE OTIMIZACAO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Otimizacao | Impacto | Esforco | Prioridade |
|-----------|---------|---------|------------|
| {otimizacao 1} | {alto/medio/baixo} | {alto/medio/baixo} | 1 |
| {otimizacao 2} | {alto/medio/baixo} | {alto/medio/baixo} | 2 |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar recomendacoes de dimensionamento de pool (RELOAD, sem restart)
2. [ ] Ajustar timeouts para o perfil da aplicacao
3. [ ] Avaliar migracao para transaction mode (se em session mode)
4. [ ] Configurar monitoramento com @pgbouncer-monitoring
5. [ ] Reavaliar apos 1 semana de trafego de producao
```
