---
description: Optimize FrankenPHP worker performance and throughput
argument-hint: [target]
---

# Otimizacao FrankenPHP

Voce e um especialista em otimizacao FrankenPHP. Voce deve analisar metricas de performance dos workers e fornecer recomendacoes acionaveis para ajuste de threads, otimizacao de OPcache, configuracao de Early Hints e performance do Mercure.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Alvo: worker-tuning, opcache, early-hints, mercure, full (padrao: full)

Exemplo: `/frankenphp:optimize target:worker-tuning`

## Plan Mode

> **Plan mode e recomendado.** Claude analisa o perfil de performance atual antes de propor otimizacoes.

## MISSAO

### Passo 1: Coletar Perfil

```
══════════════════════════════════════════════════════════════
OTIMIZACAO FRANKENPHP
══════════════════════════════════════════════════════════════

Alvo: {worker-tuning/opcache/early-hints/mercure/full}

──────────────────────────────────────────────────────────────
PERFIL ATUAL
──────────────────────────────────────────────────────────────

| Configuracao | Valor |
|-------------|-------|
| Versao FrankenPHP | {versao} |
| Versao PHP | {versao} |
| Modo | {worker/classic} |
| Threads | {auto/contagem} |
| max_requests | {valor} |
| Contagem de CPUs | {n} |
| Memoria disponivel | {GB} |
```

Coletar metricas:
```bash
nproc && free -h
ps -o pid,rss,vsz -p $(pidof frankenphp)
frankenphp php-cli -i | grep -E "opcache|memory_limit"
grep -E "worker|thread" /etc/caddy/Caddyfile
```

### Passo 2: Benchmark de Baseline

```
──────────────────────────────────────────────────────────────
BENCHMARK DE BASELINE
──────────────────────────────────────────────────────────────

| Metrica | Valor | Metodo |
|---------|-------|--------|
| RPS | {n} | wrk -t4 -c100 -d30s |
| Latencia p50 | {ms} | wrk --latency |
| Latencia p99 | {ms} | wrk --latency |
| Memoria (RSS) | {MB} | ps -o rss |
| TTFB | {ms} | Timing curl |
```

### Passo 3: Analise de Ajuste de Workers

```
──────────────────────────────────────────────────────────────
ANALISE DE WORKERS
──────────────────────────────────────────────────────────────

| Parametro | Atual | Recomendado | Impacto |
|-----------|-------|-------------|---------|
| Modo | {worker/classic} | {recomendacao} | {descricao} |
| Threads | {atual} | {auto/contagem} | {descricao} |
| max_requests | {atual} | {500} | {descricao} |
| Memoria por thread | {MB} | {meta} | {descricao} |
```

### Passo 4: Analise de OPcache

```
──────────────────────────────────────────────────────────────
OTIMIZACAO OPCACHE
──────────────────────────────────────────────────────────────

| Configuracao | Atual | Recomendado | Justificativa |
|-------------|-------|-------------|---------------|
| opcache.enable | {valor} | 1 | {razao} |
| opcache.memory_consumption | {valor} | 256 | {razao} |
| opcache.max_accelerated_files | {valor} | 20000 | {razao} |
| opcache.validate_timestamps | {valor} | 0 (prod) | {razao} |
| opcache.preload | {valor} | /app/config/preload.php | {razao} |
| opcache.jit | {valor} | 1255 | {razao} |
| opcache.jit_buffer_size | {valor} | 128M | {razao} |
```

### Passo 5: Early Hints e Rede

```
──────────────────────────────────────────────────────────────
EARLY HINTS E REDE
──────────────────────────────────────────────────────────────

| Funcionalidade | Status | Recomendacao |
|---------------|--------|-------------|
| Early Hints (103) | {habilitado/desabilitado} | {acao} |
| HTTP/2 | {habilitado/desabilitado} | {acao} |
| HTTP/3 | {habilitado/desabilitado} | {acao} |
| Compressao | {habilitada/desabilitada} | {acao} |
| Diretiva push | {configurada/ausente} | {acao} |
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
MELHORIA ESPERADA
──────────────────────────────────────────────────────────────

| Metrica | Antes | Esperado Depois | Mudanca |
|---------|-------|-----------------|---------|
| RPS | {n} | {n} | +{x}% |
| Latencia p99 | {ms} | {ms} | -{x}% |
| Memoria | {MB} | {MB} | {estavel} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar ajuste de workers (contagem de threads, max_requests)
2. [ ] Configurar OPcache preloading e JIT
3. [ ] Habilitar Early Hints para recursos criticos
4. [ ] Re-benchmark apos cada mudanca
5. [ ] Monitorar estabilidade de memoria por 24 horas
```
