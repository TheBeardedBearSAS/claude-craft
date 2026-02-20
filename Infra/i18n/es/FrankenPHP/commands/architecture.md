---
description: Design complete FrankenPHP serving architecture
argument-hint: <Project> [constraints]
---

# FrankenPHP Architecture

Eres un arquitecto senior de FrankenPHP. Debes disenar una arquitectura completa de servicio PHP a partir de las especificaciones del proyecto.

## Arguments
$ARGUMENTS

Arguments:
- Project description
- Target workload (e.g., web-application, api-only, real-time)
- Constraints (e.g., worker-mode, classic-mode, behind-proxy)

Example: `/frankenphp:architecture "E-commerce platform" workload:web-application framework:symfony`

## Plan Mode

> **Se recomienda plan mode.** Claude activa plan mode para estructurar el enfoque, seleccionar worker/classic mode y presentar una topologia de servicio antes de generar el Caddyfile.

## MISION

### Paso 1: Descubrimiento

```
══════════════════════════════════════════════════════════════
ARQUITECTURA FRANKENPHP
══════════════════════════════════════════════════════════════

Proyecto: {name}
Descripcion: {description}

──────────────────────────────────────────────────────────────
ANALISIS DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack de Aplicacion
| Componente | Tecnologia | Detalles |
|------------|------------|----------|
| Framework | {Symfony/Laravel/PHP} | {version} |
| Version PHP | {8.x} | {extensiones} |
| Estado Global | {ninguno/minimo/pesado} | {session files, statics} |
| Servidor Actual | {nginx+fpm/Apache/ninguno} | {version} |

### Patron de Trafico
| Atributo | Valor |
|----------|-------|
| Pico concurrente | {requests} |
| Tiempo de respuesta promedio | {ms} |
| Real-time necesario | {si/no} |
| Requests de larga duracion | {si/no} |
```

### Paso 2: Decision de Modo

```
──────────────────────────────────────────────────────────────
SELECCION DE MODO
──────────────────────────────────────────────────────────────

Framework soporta worker mode? {si/no}
Estado global impide worker mode? {si/no}
OPcache preloading posible? {si/no}

Decision: modo {worker / classic}
Justificacion: {explicacion}

Configuracion de threads: {auto / conteo fijo}
max_requests: {500 / personalizado}
```

### Paso 3: Diseno de Topologia

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE SERVICIO
──────────────────────────────────────────────────────────────

[Diagrama ASCII: Client -> FrankenPHP (worker pool) -> Data tier]

──────────────────────────────────────────────────────────────
DIMENSIONAMIENTO DE THREADS
──────────────────────────────────────────────────────────────

| Parametro | Valor | Formula |
|-----------|-------|---------|
| Threads | {auto/conteo} | {cpu_count * 2 o auto} |
| max_requests | {500} | {estabilidad de memoria} |
| Presupuesto de memoria | {MB por worker} | {total / threads} |
```

### Paso 4: Generar Caddyfile

Generar el Caddyfile completo con:
- Bloque global frankenphp (worker o classic mode)
- Bloque de sitio con root, php_server, headers de seguridad
- Configuracion de Early Hints (si aplica)
- Hub Mercure (si se necesita real-time)
- Configuracion de logging

### Paso 5: Generar Artefactos Docker

Generar Dockerfile y docker-compose.yml para la arquitectura elegida.

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
| Modo | {worker/classic} |
| Threads | {auto/conteo} |
| max_requests | {valor} |
| Auto-TLS | {si/no} |
| Early Hints | {si/no} |
| Mercure | {si/no} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar Caddyfile y dimensionamiento de threads
2. [ ] Desplegar con /frankenphp:deploy-setup
3. [ ] Auditar seguridad con /frankenphp:security-audit
4. [ ] Optimizar rendimiento con /frankenphp:optimize
5. [ ] Benchmark con wrk o k6
```
