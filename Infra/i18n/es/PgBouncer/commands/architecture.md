---
description: Design complete PgBouncer connection pooling architecture
argument-hint: <Project> [constraints]
---

# PgBouncer Architecture

Eres un arquitecto senior de PgBouncer. Debes disenar una arquitectura completa de connection pooling a partir de las especificaciones del proyecto.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target workload (e.g., web-application, microservices, multi-tenant)
- Constraints (e.g., pool-mode, max-connections, ha-required)

Example: `/pgbouncer:architecture "E-commerce platform" workload:web-application pg-max-conn:100`

## Plan Mode

> **Se recomienda plan mode.** Claude activa plan mode para estructurar el enfoque, seleccionar el pool mode y presentar una topologia antes de generar pgbouncer.ini.

## MISION

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA PGBOUNCER
══════════════════════════════════════════════════════════════

Proyecto: {name}
Descripcion: {description}

──────────────────────────────────────────────────────────────
ANALISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack de Aplicacion
| Componente | Tecnologia | Conexiones |
|------------|------------|------------|
| Servidor App | {framework} | {conn por instancia} |
| Instancias | {count} | {total conexiones} |
| Funcionalidades ORM | {prepared stmts, temp tables} | {compatibilidad} |

### Configuracion de PostgreSQL
| Atributo | Valor |
|----------|-------|
| max_connections | {value} |
| Bases de datos | {count} |
| Replicacion | {primary-only / primary+replica} |
| Metodo auth | {scram-sha-256 / md5} |
```

### Paso 2: Decision de Pool Mode

```
──────────────────────────────────────────────────────────────
SELECCION DE POOL MODE
──────────────────────────────────────────────────────────────

Application uses prepared statements? {yes/no}
Application uses SET/session variables? {yes/no}
Application uses LISTEN/NOTIFY? {yes/no}
Application uses temp tables across queries? {yes/no}

Decision: {transaction / session} mode
Rationale: {explanation}

server_reset_query: {DISCARD ALL / empty}
```

### Paso 3: Diseno de Topologia

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE POOL
──────────────────────────────────────────────────────────────

[ASCII diagram: App instances -> PgBouncer -> PostgreSQL]

──────────────────────────────────────────────────────────────
CALCULO DE DIMENSIONAMIENTO
──────────────────────────────────────────────────────────────

| Parametro | Valor | Formula |
|-----------|-------|---------|
| max_client_conn | {value} | {instancias x conn + 20% margen} |
| default_pool_size | {value} | {PG max_conn / pools x 0.8} |
| min_pool_size | {value} | {50% del default} |
| reserve_pool_size | {value} | {25% del default} |
| reserve_pool_timeout | {value} | {segundos} |
```

### Paso 4: Generar pgbouncer.ini

Generar el archivo de configuracion completo `pgbouncer.ini` con:
- Seccion [databases] con todas las entradas de base de datos
- Seccion [pgbouncer] con todos los ajustes de pool
- Configuracion de autenticacion (auth_type, auth_file o auth_query)
- Ajustes de timeout (server_lifetime, server_idle_timeout, query_wait_timeout)
- Configuracion de logging
- Usuarios admin y stats

### Paso 5: Generar userlist.txt

Generar el archivo de autenticacion o la funcion SQL de auth_query.

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
ARQUITECTURA GENERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN DE CONFIGURACION
──────────────────────────────────────────────────────────────

| Ajuste | Valor |
|--------|-------|
| Pool mode | {transaction/session} |
| max_client_conn | {value} |
| default_pool_size | {value} |
| Bases de datos | {count} |
| HA | {si/no} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar dimensionamiento del pool contra trafico real
2. [ ] Desplegar con /pgbouncer:deploy-setup
3. [ ] Auditar seguridad con /pgbouncer:security-audit
4. [ ] Configurar monitoreo con @pgbouncer-monitoring
5. [ ] Prueba de carga para validar dimensionamiento del pool
```
