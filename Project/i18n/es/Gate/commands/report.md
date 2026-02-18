---
description: Mostrar el informe completo de los quality gates
argument-hint: [--detailed]
---

# Informe Quality Gates

Generar un informe completo de todos los quality gates BMAD.

## Argumentos

$ARGUMENTS (format: [--detailed])
- **--detailed** (opcional): Incluir los detalles de validacion para cada gate

## Proceso

### Paso 1: Identificar los gates aplicables

Determinar cuales gates se aplican segun el estado del proyecto:
- Gate PRD: Si existe archivo PRD
- Gate Tech Spec: Si existe archivo tech spec
- Gate Backlog: Si existen stories
- Gate Sprint Ready: Si existen metadatos de sprint
- Gates Story: Para cada story in-progress/review

### Paso 2: Ejecutar las validaciones

Ejecutar cada validador de gate aplicable.

### Paso 3: Agregar los resultados

Compilar los resultados en un informe resumido.

### Paso 4: Generar las recomendaciones

Basado en los fallos, sugerir acciones prioritarias.

## Formato de Salida

```
═══════════════════════════════════════════════════════
            Informe Quality Gates BMAD
═══════════════════════════════════════════════════════

Proyecto: claude-craft
Sprint: sprint-3 - Gestion de Usuarios
Generado: 2026-01-29 10:00:00

Resumen de Gates:
══════════════════════════════════════════════════════
| Gate | Umbral | Puntuacion | Estado |
|------|--------|------------|--------|
| PRD | 80% | 90% | ✅ APROBADO |
| Tech Spec | 90% | 92% | ✅ APROBADO |
| Backlog | 6/6 | 5.8/6 prom | ⚠️ ADVERT |
| Sprint Ready | 100% | 100% | ✅ APROBADO |
| Story DoD | 100% | variable | 📊 |

Estado DoD por Story:
──────────────────────────────────────────────────────
| Story | Estado | Puntuacion DoD | Gate |
|-------|--------|----------------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Salud Global: 🟢 Buena
──────────────────────────────────────────────────────
4/5 gates aprobados
8/10 stories en buen camino
Sin bloqueadores criticos

Recomendaciones:
──────────────────────────────────────────────────────
1. ⚠️ US-002 carece de story points (INVEST: E)
   Ejecutar: /project:update-story US-002 --points 3

2. ⚠️ US-012 requiere una revision de codigo para completarse
   Crear una PR y solicitar una revision

Comandos:
  /gate:validate-prd       Relanzar gate PRD
  /gate:validate-backlog   Relanzar gate backlog
  /gate:validate-story US-012  Verificar story especifica
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:report
/gate:report --detailed
```

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Ejecutar la gate específica que necesita atención:      ║
║                                                          ║
║  • /gate:validate-prd      — Gate calidad PRD            ║
║  • /gate:validate-techspec — Gate spec técnica           ║
║  • /gate:validate-backlog  — Gate backlog                ║
║  • /gate:validate-sprint   — Gate preparación sprint     ║
║  • /gate:validate-story    — Gate DoD story              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
