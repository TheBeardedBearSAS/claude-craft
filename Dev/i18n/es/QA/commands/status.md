---
description: "Mostrar el estado y progreso de las sesiones QA Recette"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>]"
---

# QA Recette Status - Estado y Progreso de Sesiones

Muestra el estado y progreso de las sesiones QA Recette. Consulte los detalles de una sesion individual o liste todas las sesiones con filtrado.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : Mostrar estado detallado de una sesion especifica (ej: REC-20260130-143022)
- `--all` : Listar todas las sesiones con resumen
- `--scope=<type>` : Filtrar por alcance (story, sprint)
- `--status=<status>` : Filtrar por estado (running, completed, paused, failed)
- `--format=<type>` : Formato de salida (table, yaml, json) — defecto: table
- `--watch` : Modo de actualizacion en vivo (cada 5 segundos)

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Lista de Sesiones** | Listar todas las sesiones con estado, progreso y fechas |
| **Vista Detallada** | Sesion individual con desglose de tests, errores, tiempos |
| **Barras de Progreso** | Indicadores visuales de progreso para sesiones en curso |
| **Filtrado** | Filtrar por alcance, estado o rango de fechas |
| **Modo en Vivo** | Modo watch para monitoreo en tiempo real |
| **Estado de Correccion** | Muestra el estado fix-state.yaml si recette-fix fue ejecutado |

## Processus

### 1. Descubrimiento de Sesiones

```
┌─────────────────────────────────────────┐
│  1. scan_sessions()                     │
│     - Leer .recette/sessions/           │
│     - Cargar state.yaml por sesion      │
│     - Cargar fix-state.yaml si presente │
│     - Aplicar filtros                   │
└─────────────────────────────────────────┘
```

### 2. Lista de Sesiones (--all)

Muestra una tabla resumen:

```
┌──────────────────────┬────────┬──────────┬───────────┬──────────┬────────────┐
│ ID Sesion            │ Scope  │ Objetivo │ Estado    │ Progreso │ Fecha      │
├──────────────────────┼────────┼──────────┼───────────┼──────────┼────────────┤
│ REC-20260130-143022  │ story  │ US-001   │ completed │ 15/15    │ 2026-01-30 │
│ REC-20260131-091500  │ sprint │ Sprint-3 │ paused    │ 8/23     │ 2026-01-31 │
│ REC-20260201-140000  │ story  │ US-005   │ running   │ 3/10     │ 2026-02-01 │
└──────────────────────┴────────┴──────────┴───────────┴──────────┴────────────┘
```

### 3. Detalle de una Sesion (--session=<id>)

Muestra informacion completa:

```
Sesion:  REC-20260130-143022
Estado:  completed
Scope:   story → US-001
Inicio:  2026-01-30 14:30:22
Fin:     2026-01-30 14:45:10
Duracion: 14m 48s

Tests:
  Total:    15
  Exitosos: 12  ████████████░░░  80%
  Fallidos:  2  ██░░░░░░░░░░░░░  13%
  Omitidos:  1  █░░░░░░░░░░░░░░   7%

Errores:
  - ERR-001: Validacion de formulario login no mostrada (visual)
  - ERR-002: Timeout API en /api/users (api)

Tests de Regresion Generados: 3
Estado de Correccion: completed (2/2 bugs corregidos)
```

## Fuentes de Datos

| Fuente | Ruta | Descripcion |
|--------|------|-------------|
| Estado de sesion | `.recette/sessions/{id}/state.yaml` | Progreso y resultados |
| Estado de correccion | `.recette/sessions/{id}/fix-state.yaml` | Progreso de correcciones |
| Capturas de pantalla | `.recette/sessions/{id}/screenshots/` | Capturas de errores |
| Logs | `.recette/sessions/{id}/logs/` | Logs de ejecucion detallados |

## Ejemplos

```bash
# Listar todas las sesiones
/qa:recette-status --all

# Mostrar estado detallado de una sesion
/qa:recette-status --session=REC-20260130-143022

# Filtrar sesiones en curso
/qa:recette-status --all --status=running

# Filtrar por alcance
/qa:recette-status --all --scope=sprint

# Monitoreo en vivo de una sesion
/qa:recette-status --session=REC-20260130-143022 --watch

# Salida en YAML
/qa:recette-status --session=REC-20260130-143022 --format=yaml

# Salida en JSON (para scripting)
/qa:recette-status --all --format=json
```

## Estructura de Salida

```
.recette/
├── sessions/
│   ├── REC-20260130-143022/
│   │   ├── state.yaml          # Estado de sesion (leido por este comando)
│   │   ├── fix-state.yaml      # Progreso de correcciones (si recette-fix ejecutado)
│   │   ├── screenshots/
│   │   ├── checkpoints/
│   │   └── logs/
│   └── REC-20260131-091500/
│       ├── state.yaml
│       └── ...
```

## Comandos Relacionados

| Comando | Descripcion |
|---------|-------------|
| `/qa:recette` | Ejecutar pruebas de aceptacion |
| `/qa:recette-fix` | Corregir bugs de una sesion |
| `/qa:recette-regression` | Ver tests de regresion |
| `/qa:recette-report` | Generar informe |

## Mensajes de Error

| Error | Solucion |
|-------|----------|
| "No se encontraron sesiones" | Ejecute `/qa:recette` primero para crear una sesion |
| "Sesion no encontrada" | Verifique el ID de sesion en `.recette/sessions/` |
| "Ninguna sesion coincide con el filtro" | Ajuste los criterios de filtrado |

## Mejores Practicas

1. **Use --all primero** : Obtenga una vision general antes de revisar una sesion especifica
2. **Monitoree con --watch** : Use el modo en vivo para sesiones en curso
3. **Verifique el estado de correccion** : Confirme que los bugs fueron corregidos tras recette-fix
4. **Use JSON para automatizacion** : Dirija la salida JSON a otras herramientas
5. **Filtre por estado** : Concentrese en sesiones pausadas/fallidas que requieren atencion

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si la sesión tiene fallos:                              ║
║  → /qa:fix                                               ║
║    Corregir los bugs identificados                       ║
║                                                          ║
║  Si la sesión está completa:                             ║
║  → /qa:report                                            ║
║    Generar el informe de recette                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
