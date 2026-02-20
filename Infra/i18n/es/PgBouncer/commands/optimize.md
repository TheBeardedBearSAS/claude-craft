---
description: Optimize PgBouncer pool performance and connection utilization
argument-hint: [target]
---

# PgBouncer Optimize

Eres un especialista en optimizacion de PgBouncer. Debes analizar las metricas de utilizacion del pool y proporcionar recomendaciones accionables para ajuste de rendimiento, optimizacion de timeouts y evaluacion de migracion a transaction mode.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Target: pool-sizing, timeouts, txn-mode-migration, full (default: full)

Example: `/pgbouncer:optimize target:pool-sizing`

## Plan Mode

> **Se recomienda plan mode.** Claude analiza las metricas actuales del pool antes de proponer optimizaciones.

## MISION

### Paso 1: Recolectar Metricas

```
══════════════════════════════════════════════════════════════
OPTIMIZACION PGBOUNCER
══════════════════════════════════════════════════════════════

Objetivo: {pool-sizing/timeouts/txn-mode-migration/full}

──────────────────────────────────────────────────────────────
PERFIL ACTUAL DEL POOL
──────────────────────────────────────────────────────────────

| Base de datos | Pool Mode | Pool Size | cl_active | cl_waiting | sv_active | sv_idle | Utilizacion |
|---------------|-----------|-----------|-----------|------------|-----------|---------|-------------|
| {db} | {mode} | {size} | {n} | {n} | {n} | {n} | {%} |
```

Recolectar metricas via comandos SHOW:
```sql
SHOW POOLS;
SHOW STATS;
SHOW CONFIG;
SHOW LISTS;
```

### Paso 2: Analisis de Utilizacion de Pool

```
──────────────────────────────────────────────────────────────
UTILIZACION DE POOL
──────────────────────────────────────────────────────────────

| Base de datos | Tamano Actual | Pico sv_active | Utilizacion Promedio | Recomendacion | Accion |
|---------------|--------------|----------------|----------------------|---------------|--------|
| {db} | {size} | {peak} | {%} | {nuevo tamano} | {aumentar/disminuir/mantener} |

──────────────────────────────────────────────────────────────
RECOMENDACIONES DE DIMENSIONAMIENTO
──────────────────────────────────────────────────────────────

| Parametro | Actual | Recomendado | Impacto |
|-----------|--------|-------------|---------|
| default_pool_size | {actual} | {nuevo} | {descripcion} |
| min_pool_size | {actual} | {nuevo} | {descripcion} |
| reserve_pool_size | {actual} | {nuevo} | {descripcion} |
| max_client_conn | {actual} | {nuevo} | {descripcion} |
| max_db_connections | {actual} | {nuevo} | {descripcion} |
```

### Paso 3: Ajuste de Timeouts

```
──────────────────────────────────────────────────────────────
ANALISIS DE TIMEOUTS
──────────────────────────────────────────────────────────────

| Timeout | Actual | Recomendado | Justificacion |
|---------|--------|-------------|---------------|
| server_lifetime | {actual} | {nuevo} | {razon} |
| server_idle_timeout | {actual} | {nuevo} | {razon} |
| client_idle_timeout | {actual} | {nuevo} | {razon} |
| query_wait_timeout | {actual} | {nuevo} | {razon} |
| client_login_timeout | {actual} | {nuevo} | {razon} |
| server_connect_timeout | {actual} | {nuevo} | {razon} |
| reserve_pool_timeout | {actual} | {nuevo} | {razon} |
```

### Paso 4: Evaluacion de Migracion a Transaction Mode

```
──────────────────────────────────────────────────────────────
MIGRACION A TRANSACTION MODE
──────────────────────────────────────────────────────────────

Modo actual: {session/transaction}

| Verificacion de Compatibilidad | Estado | Detalles |
|-------------------------------|--------|----------|
| Prepared statements | {compatible/necesita-correccion} | {detalles} |
| Comandos SET | {compatible/necesita-correccion} | {detalles} |
| LISTEN/NOTIFY | {compatible/incompatible} | {detalles} |
| Temp tables | {compatible/incompatible} | {detalles} |
| Advisory locks | {compatible/necesita-session} | {detalles} |

Migracion posible: {si/no/parcial}
Ganancia estimada de multiplexion: {x}x reduccion de conexiones
server_reset_query necesario: {DISCARD ALL / personalizado}
```

### Paso 5: Estadisticas de Rendimiento

```
──────────────────────────────────────────────────────────────
METRICAS DE RENDIMIENTO
──────────────────────────────────────────────────────────────

| Metrica | Actual | Objetivo | Estado |
|---------|--------|----------|--------|
| avg_wait_time | {ms} | < 100ms | {ok/alto} |
| avg_xact_time | {ms} | < 500ms | {ok/alto} |
| avg_query_time | {ms} | < 100ms | {ok/alto} |
| xact/s throughput | {n} | {objetivo} | {ok/bajo} |
| Ratio de reutilizacion de conexiones | {x}:1 | > 10:1 | {ok/bajo} |
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
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar recomendaciones de dimensionamiento de pool (RELOAD, sin reinicio)
2. [ ] Ajustar timeouts para el perfil de la aplicacion
3. [ ] Evaluar migracion a transaction mode (si esta en session mode)
4. [ ] Configurar monitoreo con @pgbouncer-monitoring
5. [ ] Re-evaluar despues de 1 semana de trafico en produccion
```
