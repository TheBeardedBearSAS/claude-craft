---
description: Optimize FrankenPHP worker performance and throughput
argument-hint: [target]
---

# FrankenPHP Optimize

Eres un especialista en optimizacion de FrankenPHP. Debes analizar las metricas de rendimiento de los workers y proporcionar recomendaciones accionables para ajuste de threads, optimizacion de OPcache, configuracion de Early Hints y rendimiento de Mercure.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: worker-tuning, opcache, early-hints, mercure, full (default: full)

Example: `/frankenphp:optimize target:worker-tuning`

## Plan Mode

> **Se recomienda plan mode.** Claude analiza el perfil de rendimiento actual antes de proponer optimizaciones.

## MISION

### Paso 1: Recopilar Perfil

```
══════════════════════════════════════════════════════════════
OPTIMIZACION FRANKENPHP
══════════════════════════════════════════════════════════════

Objetivo: {worker-tuning/opcache/early-hints/mercure/full}

──────────────────────────────────────────────────────────────
PERFIL ACTUAL
──────────────────────────────────────────────────────────────

| Ajuste | Valor |
|--------|-------|
| Version FrankenPHP | {version} |
| Version PHP | {version} |
| Modo | {worker/classic} |
| Threads | {auto/conteo} |
| max_requests | {valor} |
| Conteo de CPU | {n} |
| Memoria disponible | {GB} |
```

Recopilar metricas:
```bash
nproc && free -h
ps -o pid,rss,vsz -p $(pidof frankenphp)
frankenphp php-cli -i | grep -E "opcache|memory_limit"
grep -E "worker|thread" /etc/caddy/Caddyfile
```

### Paso 2: Benchmark de Linea Base

```
──────────────────────────────────────────────────────────────
BENCHMARK DE LINEA BASE
──────────────────────────────────────────────────────────────

| Metrica | Valor | Metodo |
|---------|-------|--------|
| RPS | {n} | wrk -t4 -c100 -d30s |
| p50 latencia | {ms} | wrk --latency |
| p99 latencia | {ms} | wrk --latency |
| Memoria (RSS) | {MB} | ps -o rss |
| TTFB | {ms} | curl timing |
```

### Paso 3: Analisis de Ajuste de Workers

```
──────────────────────────────────────────────────────────────
ANALISIS DE WORKERS
──────────────────────────────────────────────────────────────

| Parametro | Actual | Recomendado | Impacto |
|-----------|--------|-------------|---------|
| Modo | {worker/classic} | {recomendacion} | {descripcion} |
| Threads | {actual} | {auto/conteo} | {descripcion} |
| max_requests | {actual} | {500} | {descripcion} |
| Memoria por thread | {MB} | {objetivo} | {descripcion} |
```

### Paso 4: Analisis de OPcache

```
──────────────────────────────────────────────────────────────
OPTIMIZACION DE OPCACHE
──────────────────────────────────────────────────────────────

| Ajuste | Actual | Recomendado | Justificacion |
|--------|--------|-------------|---------------|
| opcache.enable | {valor} | 1 | {razon} |
| opcache.memory_consumption | {valor} | 256 | {razon} |
| opcache.max_accelerated_files | {valor} | 20000 | {razon} |
| opcache.validate_timestamps | {valor} | 0 (prod) | {razon} |
| opcache.preload | {valor} | /app/config/preload.php | {razon} |
| opcache.jit | {valor} | 1255 | {razon} |
| opcache.jit_buffer_size | {valor} | 128M | {razon} |
```

### Paso 5: Early Hints y Red

```
──────────────────────────────────────────────────────────────
EARLY HINTS Y RED
──────────────────────────────────────────────────────────────

| Funcionalidad | Estado | Recomendacion |
|---------------|--------|---------------|
| Early Hints (103) | {habilitado/deshabilitado} | {accion} |
| HTTP/2 | {habilitado/deshabilitado} | {accion} |
| HTTP/3 | {habilitado/deshabilitado} | {accion} |
| Compresion | {habilitado/deshabilitado} | {accion} |
| Directiva push | {configurado/faltante} | {accion} |
```

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE OPTIMIZACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Optimizacion | Impacto | Esfuerzo | Prioridad |
|-------------|---------|----------|-----------|
| {optimizacion 1} | {alto/medio/bajo} | {alto/medio/bajo} | 1 |
| {optimizacion 2} | {alto/medio/bajo} | {alto/medio/bajo} | 2 |

──────────────────────────────────────────────────────────────
MEJORA ESPERADA
──────────────────────────────────────────────────────────────

| Metrica | Antes | Esperado Despues | Cambio |
|---------|-------|------------------|--------|
| RPS | {n} | {n} | +{x}% |
| p99 latencia | {ms} | {ms} | -{x}% |
| Memoria | {MB} | {MB} | {estable} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar ajuste de workers (conteo de threads, max_requests)
2. [ ] Configurar OPcache preloading y JIT
3. [ ] Habilitar Early Hints para recursos criticos
4. [ ] Re-benchmark despues de cada cambio
5. [ ] Monitorear estabilidad de memoria durante 24 horas
```
