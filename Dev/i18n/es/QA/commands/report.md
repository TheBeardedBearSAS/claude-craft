---
description: Generar informes QA Recette a partir de datos de sesion
argument-hint: --session=<session-id> [--format=<md|html|json>] [--output=<path>]
---

# QA Recette Report - Generacion de Informes

Genera informes detallados a partir de los datos de sesion QA Recette. Soporta multiples formatos de salida y comparacion de sesiones.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : ID de sesion para generar el informe **[requerido]**
- `--format=<type>` : Formato de salida (md, html, json) — defecto: md
- `--output=<path>` : Ruta de salida personalizada (defecto: `.recette/reports/`)
- `--include-screenshots` : Integrar capturas de pantalla en el informe HTML
- `--compare=<id>` : Comparar con otra sesion para informe de diferencias

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Multi-Formato** | Generar informes Markdown, HTML o JSON |
| **Comparacion de Sesiones** | Comparar dos ejecuciones para detectar regresiones |
| **Seccion Regla de Oro** | Seccion dedicada de cumplimiento en informes |
| **Integracion de Capturas** | Integrar capturas de errores en informes HTML |
| **Trazabilidad de Tests** | Trazabilidad completa de AC a resultados de tests |
| **Resumen de Metricas** | Tasas de exito/fallo, tiempos, clasificacion de errores |

## Proceso

### 1. Recopilacion de Datos

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Leer .recette/sessions/{id}/      │
│     - Cargar state.yaml                 │
│     - Cargar fix-state.yaml si presente │
│     - Recopilar capturas y logs         │
│     - Cargar registro de regresion      │
└─────────────────────────────────────────┘
```

### 2. Generacion del Informe

```
┌─────────────────────────────────────────┐
│  2. generate_report(format)             │
│     - Construir seccion resumen         │
│     - Construir resultados de tests     │
│     - Construir detalles de errores     │
│     - Construir tests de regresion      │
│     - Construir declaracion Regla de Oro│
│     - Aplicar template de formato       │
│     - Escribir en ruta de salida        │
└─────────────────────────────────────────┘
```

### 3. Modo Comparacion (--compare)

Compara dos sesiones:

```
## Comparacion: REC-20260130-143022 vs REC-20260201-140000

| Metrica  | Sesion 1  | Sesion 2  | Delta   |
|----------|-----------|-----------|---------|
| Tests    | 15        | 15        | =       |
| Exitosos | 12        | 14        | +2      |
| Fallidos | 2         | 0         | -2      |
| Duracion | 14m 48s   | 12m 15s   | -2m 33s |

### Errores Resueltos
- ERR-001: Validacion login — CORREGIDO
- ERR-002: Timeout API — CORREGIDO

### Nuevos Errores
(ninguno)

### Estado de Regresion
No se detectaron violaciones de la Regla de Oro.
```

## Fuentes de Datos

| Fuente | Ruta | Descripcion |
|--------|------|-------------|
| Estado de sesion | `.recette/sessions/{id}/state.yaml` | Resultados y progreso |
| Estado de correccion | `.recette/sessions/{id}/fix-state.yaml` | Estado de correcciones |
| Capturas de pantalla | `.recette/sessions/{id}/screenshots/` | Capturas de errores |
| Logs | `.recette/sessions/{id}/logs/` | Logs de ejecucion |
| Registro | `.recette/regression/registry.yaml` | Registro de regresion |
| Template | `Tools/Recette/templates/report.md.template` | Template de informe |

## Ejemplos

```bash
# Generar informe Markdown (defecto)
/qa:recette-report --session=REC-20260130-143022

# Generar informe HTML con capturas
/qa:recette-report --session=REC-20260130-143022 --format=html --include-screenshots

# Generar informe JSON para integracion CI
/qa:recette-report --session=REC-20260130-143022 --format=json

# Ruta de salida personalizada
/qa:recette-report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Comparar dos sesiones
/qa:recette-report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

## Estructura de Salida

```
.recette/reports/
├── REC-20260130-143022-report.md       # Informe Markdown
├── REC-20260130-143022-report.html     # Informe HTML (si --format=html)
├── REC-20260130-143022-report.json     # Informe JSON (si --format=json)
└── REC-20260201-vs-20260130-diff.md    # Informe de comparacion (si --compare)
```

## Comandos Relacionados

| Comando | Descripcion |
|---------|-------------|
| `/qa:recette` | Ejecutar pruebas de aceptacion |
| `/qa:recette-fix` | Corregir bugs de una sesion |
| `/qa:recette-status` | Mostrar estado de sesion |
| `/qa:recette-regression` | Ver tests de regresion |

## Mensajes de Error

| Error | Solucion |
|-------|----------|
| "Sesion no encontrada" | Verifique el ID de sesion en `.recette/sessions/` |
| "Sin resultados de tests" | La sesion no tiene tests completados para reportar |
| "Template no encontrado" | Verifique que `Tools/Recette/templates/` existe |
| "Sesion de comparacion no encontrada" | Verifique el ID de la sesion de comparacion |

## Mejores Practicas

1. **Genere despues de cada ejecucion** : Cree un informe inmediatamente despues de la recette
2. **Use HTML para stakeholders** : El formato HTML con capturas es ideal para compartir
3. **Use JSON para CI** : Integre informes JSON en su pipeline CI/CD
4. **Compare ejecuciones** : Use --compare para seguir el progreso entre iteraciones
5. **Archive informes** : Conserve los informes en control de versiones para pista de auditoria

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /workflow:review                                      ║
║    Preparar la sprint review                             ║
║                                                          ║
║  Ver también:                                            ║
║  • /sprint:status — Ver métricas del sprint              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
