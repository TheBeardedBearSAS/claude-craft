---
description: "Mostrar el estado y progreso de las sesiones QA Recette, o generar informes (--report)"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>] [--report] [--format=<md|html|json>] [--output=<path>] [--compare=<id>]"
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
- `--report`: Modo informe (antiguo `/qa:status --report`): generar un informe a partir de una sesión; requiere `--session=<id>`
- `--format=<type>`: con `--report`: md, html, json (defecto: md)
- `--output=<path>`: con `--report`: ruta de salida personalizada (defecto: `.recette/reports/`)
- `--include-screenshots`: con `--report`: incrustar las capturas de pantalla en el informe HTML
- `--compare=<id>`: con `--report`: comparar con otra sesión para obtener un diferencial de regresión

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

## Uso

| Modo / opción | Qué hace | Reemplaza |
|---|---|---|
| `/qa:status --all` / `--session=<id>` | Listar las sesiones o mostrar el detalle de una sesión | — |
| `/qa:status --report --session=<id>` | Generar un informe Markdown/HTML/JSON (`--format`, `--output`, `--include-screenshots`) | `/qa:status --report` |
| `/qa:status --report --session=<id> --compare=<id>` | Comparar dos sesiones para detectar regresiones | `/qa:status --report --compare` |

## Modo Informe (--report)

Genera informes detallados a partir de los datos de la sesión. Salida multiformato (Markdown, HTML, JSON), sección de cumplimiento de la Golden Rule, incrustación de capturas de pantalla, trazabilidad de los criterios de aceptación a los pruebas y métricas de éxito/fallo. Sin `--format`, el informe es Markdown.

### Proceso del Informe

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
├─────────────────────────────────────────┤
│  2. generate_report(format)             │
│     - Build summary, test results,      │
│       error details, regression tests   │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### Estructura del Informe

```markdown
# QA Recette Report — REC-20260130-143022

## Summary
| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Duration | 14m 48s |
| Passed / Failed / Skipped | 12 (80%) / 2 (13%) / 1 (7%) |

## Test Results
### Failed Tests (2)
- TC-008: Login validation error display ✗ (ERR-001)

## Error Details
### ERR-001: Login validation not displayed
- Type: visual · Severity: medium · Screenshot: screenshots/err-001.png

## Regression Tests Generated
| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |

## Golden Rule Compliance
All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### Comparación (--compare)

Compara dos ejecuciones: diferencias de métricas, errores resueltos, errores nuevos y violaciones de la Golden Rule.

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |

### Resolved Errors / New Errors / Regression Status
```

### Fuentes de datos del informe

| Fuente | Ruta | Descripción |
|---|---|---|
| Registro | `.recette/regression/registry.yaml` | Registro de pruebas de regresión |
| Plantilla | `Tools/Recette/templates/report.md.template` | Plantilla de informe |

### Errores del informe

| Error | Solución |
|---|---|
| "Template not found" | Verificar que `Tools/Recette/templates/` existe |
| "Compare session not found" | Verificar el ID de la sesión a comparar |
| "No test results" | La sesión no tiene pruebas completadas sobre las que informar |

### Ejemplos de Informe

```bash
# Generar un informe Markdown (por defecto)
/qa:status --report --session=REC-20260130-143022

# Generar un informe HTML con capturas de pantalla
/qa:status --report --session=REC-20260130-143022 --format=html --include-screenshots

# Generar un informe JSON para la integración CI
/qa:status --report --session=REC-20260130-143022 --format=json

# Ruta de salida personalizada
/qa:status --report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparar dos sesiones
/qa:status --report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

### Estructura de Salida del Informe

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
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
/qa:status --all

# Mostrar estado detallado de una sesion
/qa:status --session=REC-20260130-143022

# Filtrar sesiones en curso
/qa:status --all --status=running

# Filtrar por alcance
/qa:status --all --scope=sprint

# Monitoreo en vivo de una sesion
/qa:status --session=REC-20260130-143022 --watch

# Salida en YAML
/qa:status --session=REC-20260130-143022 --format=yaml

# Salida en JSON (para scripting)
/qa:status --all --format=json
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
| `/qa:fix` | Corregir bugs de una sesion |
| `/qa:regression` | Ver tests de regresion |
| `/qa:status --report` | Generar informe (`--report`) |

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
║  → /qa:status --report                                   ║
║    Generar el informe de recette                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
