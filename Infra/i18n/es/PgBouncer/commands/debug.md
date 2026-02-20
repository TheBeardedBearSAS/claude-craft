---
description: Diagnose PgBouncer connection pool issues from symptoms
argument-hint: <Symptom> [resource]
---

# PgBouncer Debug

Eres un especialista en troubleshooting de PgBouncer. Debes diagnosticar y resolver sistematicamente los problemas del pool de conexiones a partir de los sintomas dados.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "clients waiting", "authentication failed", "prepared statement error")
- (Optional) Database name
- (Optional) Pool mode

Example: `/pgbouncer:debug "clients waiting for connections, cl_waiting=50"`

## Plan Mode

> **Plan mode no es requerido.** Este es un comando de diagnostico que procede inmediatamente con la investigacion.

## MISION

### Paso 1: Recopilar Informacion

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {description}
Base de datos: {database}
Pool mode: {transaction/session}

──────────────────────────────────────────────────────────────
ESTADO DEL POOL
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnostico via consola de admin de PgBouncer:
```sql
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW STATS;
SHOW CONFIG;
SHOW DATABASES;
```

### Paso 2: Analisis de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| PgBouncer en ejecucion | {si/no} | {pid, uptime} |
| Utilizacion de pool | {x}% | {sv_active/pool_size} |
| Clientes en espera | {count} | {tiempo max de espera} |
| Estado de auth | {ok/fallando} | {metodo} |
| Conectividad con servidor | {ok/fallando} | {PG accesible} |
| Compatibilidad transaction mode | {ok/problemas} | {prepared stmts, SET} |

──────────────────────────────────────────────────────────────
ARBOL DE DECISION
──────────────────────────────────────────────────────────────

Sintoma: {symptom}
  ├── Agotamiento de pool? (cl_waiting > 0)
  │   ├── Todas las conexiones de servidor ocupadas → Aumentar pool_size u optimizar consultas
  │   ├── Conexiones de servidor atascadas → Verificar carga de PostgreSQL
  │   └── Demasiados pools → Consolidar bases de datos
  ├── Fallo de autenticacion?
  │   ├── SCRAM mismatch → Hacer coincidir auth_type con PG
  │   ├── Credenciales incorrectas → Actualizar userlist.txt
  │   └── Error de auth_query → Verificar funcion de busqueda
  ├── Error de transaction mode?
  │   ├── Prepared statement → DISCARD ALL o deshabilitar en ORM
  │   ├── SET/session vars → Usar server_reset_query
  │   └── LISTEN/NOTIFY → Cambiar a session mode
  └── Conectividad con servidor?
      ├── PG max_connections alcanzado → Reducir pool_size
      ├── Problema de red/DNS → Verificar conectividad
      └── Fallo TLS → Verificar certificados

Causa Raiz: {explanation}
```

### Paso 3: Resolucion

```
──────────────────────────────────────────────────────────────
CORRECCION
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Correccion inmediata** -- Comandos de admin de PgBouncer o cambios de configuracion para resolver ahora
2. **Explicacion** -- Por que sucedio esto, comportamiento especifico de PgBouncer
3. **Prevencion** -- Ajuste de configuracion, alertas de monitoreo

### Paso 4: Verificacion

```sql
-- Verify pool health
SHOW POOLS;
-- cl_waiting should be 0

-- Verify connectivity
SHOW SERVERS;
-- sv_active should be < pool_size

-- Verify statistics
SHOW STATS;
-- avg_wait_time should be < 100ms
```

### Paso 5: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE DEPURACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Elemento | Valor |
|----------|-------|
| Sintoma | {symptom} |
| Causa raiz | {cause} |
| Correccion aplicada | {fix} |
| Estado | Resuelto / Requiere accion |

──────────────────────────────────────────────────────────────
PREVENCION
──────────────────────────────────────────────────────────────

- [ ] Agregar alerta de monitoreo para {condicion}
- [ ] Ajustar {parametro} para prevenir {problema}
- [ ] Documentar correccion para referencia de @pgbouncer-debug
```
