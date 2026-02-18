---
description: Correccion automatizada de bugs identificados por QA Recette
argument-hint: --session=<session-id> [--dry-run|--skip-fix|--severity=<level>|--auto-commit]
---

# QA Recette Fix - Correccion Automatizada de Bugs

Complemento de `/qa:recette`. Lee un informe/sesion de recette, refina cada error para hacerlo procesable, genera documentos de gestion de proyecto (stories BMAD, backlog, sprint), luego lanza la correccion TDD para cada bug. Implementa la **Regla de Oro**: Un bug corregido NUNCA debe reaparecer.

## Argumentos

**$ARGUMENTS**

- `--session=<id>` : ID de sesion recette (ej: REC-20260130-143022) **[requerido]**
- `--dry-run` : Refinar errores y generar documentos BMAD sin corregir
- `--severity=<level>` : Filtrar por severidad minima (critical, high, medium, low)
- `--skip-fix` : Generar solo documentos, sin correccion TDD
- `--auto-commit` : Commit automatico despues de cada bug corregido

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| **Refinamiento de Errores** | Analiza la causa raiz, reproduce via Chrome si disponible |
| **Agrupamiento Inteligente** | Deduplica errores por causa raiz comun |
| **Documentos BMAD** | Genera bug stories, actualiza backlog y sprint |
| **Correccion TDD** | Workflow RED → GREEN → REFACTOR para cada bug |
| **Tests de Regresion** | Generacion automatica y actualizacion del registro |
| **Seguimiento de Progreso** | fix-state.yaml para reanudacion y monitoreo |

## Proceso en 7 Fases

```
Sesion recette (.recette/sessions/{id}/)
        |
        v
  Fase 1: Cargar la sesion y los errores
        |
        v
  Fase 2: Refinar las descripciones de errores
        |     - Reproducir via Chrome si necesario
        |     - Identificar la causa raiz
        |     - Clasificar severidad
        |
        v
  Fase 3: Agrupar por causa raiz
        |     - Deduplicacion
        |     - Priorizacion
        |
        v
  Fase 4: Generar los documentos BMAD
        |     - Bug stories (US-XXX-bug-YYY)
        |     - Actualizacion del backlog
        |     - Actualizacion de sprint-status.yaml
        |
        v
  Fase 5: Correccion TDD por bug
        |     - RED: test que reproduce el bug
        |     - GREEN: correccion minima
        |     - REFACTOR: mejora
        |
        v
  Fase 6: Verificacion
        |     - Todos los tests pasan
        |     - Tests de regresion generados
        |     - Registro de regresion actualizado
        |
        v
  Fase 7: Informe de sintesis
```

### Fase 1: Carga de la Sesion

```
┌─────────────────────────────────────────┐
│  1. load_session(session_id)            │
│     - Leer .recette/sessions/{id}/      │
│     - Cargar state.yaml                 │
│     - Extraer los errores (failed)      │
│     - Cargar screenshots/logs asociados │
└─────────────────────────────────────────┘
```

### Fase 2: Refinamiento de Errores

Para cada error detectado:

1. Releer el screenshot/log del error en la sesion
2. Si el Chrome MCP esta disponible: reproducir el error para confirmar
3. Analizar el codigo fuente para identificar la causa raiz
4. Reformular la descripcion con: comportamiento actual, comportamiento esperado, archivos afectados, causa raiz supuesta

**Matriz de severidad:**

| Tipo error | Impacto usuario | Frecuencia | Severidad |
|------------|-----------------|------------|-----------|
| security | Cualquiera | Cualquiera | critical |
| logic | Bloqueante | Cualquiera | critical |
| logic | No bloqueante | Frecuente | high |
| validation | Bloqueante | Cualquiera | high |
| validation | No bloqueante | Rara | medium |
| interaction | Cualquiera | Cualquiera | high |
| visual | Degradacion mayor | Cualquiera | medium |
| visual | Cosmetico | Cualquiera | low |
| api | Error 5xx | Cualquiera | critical |
| api | Error 4xx inesperado | Cualquiera | high |

### Fase 3: Agrupamiento por Causa Raiz

Varios errores de recette pueden tener la misma causa raiz:

- Error de validacion de formulario + error de visualizacion de mensaje = mismo componente de validacion
- Error API en 3 endpoints = mismo middleware de autenticacion

El agrupamiento crea **una sola bug story** por causa raiz en lugar de una por error.

### Fase 4: Generacion de Documentos BMAD

Para cada bug agrupado:

1. Generar la bug story desde el template `bug-story.md`
2. Agregar al `.bmad/sprint-status.yaml` con status `ready-for-dev`
3. Si hay un sprint activo: agregar al sprint actual
4. Si no: agregar al backlog

### Fase 5: Correccion TDD

Para cada bug story (por orden de severidad):

```
┌──────────────────────────────────────────────┐
│  BUG-001 (critical)                          │
│                                              │
│  1. RED   : Escribir test que reproduce el   │
│             bug → Ejecutar → DEBE fallar     │
│                                              │
│  2. GREEN : Correccion minima del codigo     │
│             → Ejecutar → DEBE pasar          │
│             → Todos los tests → no-regresion │
│                                              │
│  3. REFACTOR : Mejorar si necesario          │
│             → Generar test de regresion      │
│             → Actualizar registro            │
│             → Actualizar fix-state.yaml      │
│                                              │
│  4. COMMIT (si --auto-commit)                │
│     fix({modulo}): {desc} [recette:{session}]│
└──────────────────────────────────────────────┘
```

**Tipos de tests generados segun clasificacion:**

| Tipo error | Test unitario | Test funcional | Feature Behat |
|------------|:---:|:---:|:---:|
| logic | X | | |
| validation | X | X | |
| api | | X | |
| interaction | | | X |
| visual | | | X |
| security | X | X | |

### Fase 6: Verificacion

1. Ejecutar todos los tests del proyecto
2. Verificar que los tests de regresion generados estan en `.recette/regression/tests/`
3. Verificar que el registro `.recette/regression/registry.yaml` esta actualizado
4. Verificar que el fix-state.yaml refleja el estado correcto

### Fase 7: Informe de Sintesis

Genera un informe resumen con:

- Numero total de errores procesados
- Numero de bugs agrupados (despues de deduplicacion)
- Correcciones exitosas / fallidas / ignoradas
- Tests de regresion generados
- Commits realizados (si `--auto-commit`)

## Estado de Progreso (fix-state.yaml)

```yaml
# .recette/sessions/{id}/fix-state.yaml
session_id: "REC-20260130-143022"
started_at: "2026-01-31T10:00:00"
status: "in-progress"  # pending | in-progress | completed | paused

errors:
  total: 8
  grouped: 5
  refined: 5
  fixed: 3
  skipped: 0
  remaining: 2

bugs:
  - id: "BUG-001"
    error_ids: ["ERR-001", "ERR-003"]
    severity: critical
    title: "Autenticacion falla despues de timeout de sesion"
    story_id: "US-042-bug-001"
    status: "fixed"  # pending | refining | documented | fixing | fixed | skipped
    tdd_phase: "refactor"
    fix_commit: "abc1234"
    regression_test: "tests/Functional/Auth/SessionTimeoutTest.php"

  - id: "BUG-002"
    error_ids: ["ERR-002"]
    severity: high
    title: "Formulario de contacto no muestra errores de validacion"
    story_id: "US-042-bug-002"
    status: "fixing"
    tdd_phase: "green"
    fix_commit: null
    regression_test: null

current_bug: "BUG-002"
resume_from:
  bug_id: "BUG-002"
  phase: "green"
```

## Ejemplos

```bash
# Corregir todos los bugs de una sesion recette
/qa:recette-fix --session=REC-20260130-143022

# Dry run: refinar y documentar sin corregir
/qa:recette-fix --session=REC-20260130-143022 --dry-run

# Corregir solo bugs criticos y altos
/qa:recette-fix --session=REC-20260130-143022 --severity=high

# Generar documentos BMAD sin lanzar el TDD
/qa:recette-fix --session=REC-20260130-143022 --skip-fix

# Corregir con commit automatico
/qa:recette-fix --session=REC-20260130-143022 --auto-commit
```

## Estructura de Salida

```
.recette/sessions/{session-id}/
├── state.yaml              # Estado de la sesion recette
├── fix-state.yaml          # Estado de progreso de correcciones
├── screenshots/            # Capturas de pantalla de errores
└── logs/                   # Logs detallados

.bmad/stories/
├── US-042-bug-001.md       # Bug story BMAD
├── US-042-bug-002.md
└── ...

.recette/regression/
├── registry.yaml           # Registro actualizado
└── tests/
    ├── Unit/
    ├── Functional/
    └── Behat/
```

## Comandos Relacionados

| Comando | Descripcion |
|---------|-------------|
| `/qa:recette` | Ejecutar pruebas de aceptacion |
| `/qa:recette-status` | Mostrar estado de sesion |
| `/qa:recette-regression` | Ver tests de regresion |
| `/qa:recette-report` | Generar informe |

## Mensajes de Error

| Error | Solucion |
|-------|----------|
| "Sesion no encontrada" | Verifique el ID de sesion en `.recette/sessions/` |
| "Sin errores en la sesion" | La sesion no tiene errores a corregir |
| "sprint-status.yaml no encontrado" | Inicialice BMAD con `/bmad:init` |
| "Test RED no falla" | El bug puede que ya no exista, verificar manualmente |

## Mejores Practicas

1. **Comenzar con dry-run** : Verificar errores refinados y documentos antes de corregir
2. **Priorizar por severidad** : Comenzar por los bugs criticos
3. **Validar agrupamientos** : Verificar que los errores agrupados comparten la misma causa
4. **Revisar stories** : Verificar las bug stories generadas antes de lanzar el TDD
5. **Usar auto-commit** : Para mantener un historial limpio de correcciones

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Re-testear después de las correcciones                ║
║                                                          ║
║  Ver también:                                            ║
║  • /qa:regression — Verificar tests de regresión         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
