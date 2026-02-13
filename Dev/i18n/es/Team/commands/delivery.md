---
description: Equipo de Entrega - Ciclo de vida completo del sprint (redaccion + implementacion) usando Agent Teams
argument-hint: <sprint-name|prd-path> [--phase=all|writing|implementation] [--max-workers=3]
---

# Equipo de Entrega - Ciclo de Vida Completo del Sprint (Redaccion + Implementacion)

Orquestar el ciclo completo del sprint usando Claude Code Agent Teams (v2.1.32+). La Fase 1 redacta EPICs, User Stories (INVEST+3C+Gherkin) y tareas con revision cruzada. La Fase 2 las implementa en paralelo usando el mapeo de dominios de archivo de la Fase 1. El mismo Lider de Entrega (opus) orquesta ambas fases, preservando el contexto completo a traves de la transicion.

## Argumentos

$ARGUMENTS

- `<sprint-name|prd-path>`: Nombre/ID del sprint o ruta al documento PRD
- `--phase=all`: Fase a ejecutar (por defecto: `all`). Opciones: `all`, `writing`, `implementation`
- `--max-workers=3`: Maximo de workers paralelos por fase (por defecto: 3, max: 3)
- `--overnight`: Ejecutar en modo nocturno (limitado, se detiene a las 6am)
- `--supervised`: Pausar antes de cada story para confirmacion humana
- `--max-stories=10`: Maximo de stories a procesar (por defecto: 10)
- `--timeout=16`: Tiempo maximo de ejecucion en horas (por defecto: 16)
- `--dry-run`: Mostrar composicion del equipo, estimacion de costos y asignacion de stories sin ejecutar
- `--quality-threshold=6`: Puntuacion INVEST minima para la Fase 1 (por defecto: 6/6)
- `--max-rewrites=2`: Maximo de ciclos de reescritura por artefacto en la Fase 1 (por defecto: 2)
- `--max-cost=<dollars>`: Presupuesto maximo en dolares. Si el costo paralelo estimado supera este umbral, la ejecucion se bloquea con un mensaje OVER BUDGET

## Prerequisitos

- Claude Code v2.1.32+ con soporte de Agent Teams
- Variable de entorno `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurada
- PRD o tech spec disponible (para Fase 1) o backlog de sprint BMAD con stories `ready-for-dev` (solo para Fase 2)
- Metadatos del sprint en `.bmad/sprint-status.yaml`
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible

## Proteccion Fast Mode (Confirmacion Bloqueante)

**OBLIGATORIO**: Antes de lanzar el equipo, el Lider de Entrega DEBE:

1. Detectar si el Fast Mode esta activo (indicador lightning bolt en la terminal)
2. Si el Fast Mode esta activo:
   - Mostrar el dashboard comparativo estandar vs fast via `cost-estimator.sh --fast-mode`
   - **Mostrar una advertencia bloqueante** con los costos comparados:
     ```
     ⚠️  FAST MODE DETECTADO — Costos Opus 6x mas altos!

     | Modo     | Input ($/M) | Output ($/M) | Costo estimado esta entrega |
     |----------|-------------|--------------|------------------------------|
     | Estandar | $5.00       | $25.00       | ~$X.XX                       |
     | Fast     | $30.00      | $150.00      | ~$Y.YY                       |

     ¿Desea continuar en Fast Mode? (si/no)
     Recomendacion: escriba /fast para desactivar antes de continuar.
     ```
   - **Esperar la confirmacion explicita** del usuario antes de continuar
   - Si el usuario rechaza, abortar con un mensaje sugiriendo `/fast` para desactivar

## Cuando usar (vs. Secuencial u otros equipos)

| Condicion | Usar Team Delivery | Alternativa |
|-----------|--------------------|-------------|
| Ciclo completo (planificar + programar), 3+ stories | **Si (~2.2x aceleracion)** | Demasiado lento secuencialmente |
| < 3 stories | No | `@product-owner` + `/team:sprint --sequential` |
| Una sola story | No | `/common:ralph-run` |
| 5+ stories independientes | **Si (mejor ROI)** | Posible pero lento secuencialmente |
| Solo implementacion (stories existentes) | Usar `--phase=implementation` | `/team:sprint` |
| Solo redaccion (sin programacion) | Usar `--phase=writing` | `@product-owner` manualmente |
| Presupuesto muy limitado | No (+30-40% overhead de tokens) | Flujo secuencial |
| Necesita mapeo de dominios de archivo | **Si (integrado)** | Coordinacion manual |

**Punto de equilibrio**: Rentable a partir de 3+ stories a redactar E implementar.

## Proceso

### Fase 1: Redaccion (Calidad + Fiabilidad)

#### Composicion del equipo Fase 1

```
Lider de Entrega (opus) — orquestacion, validacion, contexto compartido
  |
  +-- Redactor (sonnet)    : Crea EPICs, US (INVEST+3C+Gherkin), tareas
  +-- Revisor (haiku)      : Valida calidad (INVEST 6/6, cobertura AC, testabilidad, slicing)
  +-- Arquitecto (sonnet)  : Valida viabilidad tecnica + mapeo de dominios de archivo
```

#### Paso 1.1: Validacion de entrada

El Lider de Entrega valida la entrada:

1. Leer PRD o tech spec desde la ruta proporcionada
2. Validar el Gate PRD (>=80%) — si la puntuacion esta por debajo del umbral, abortar con mensaje claro
3. Extraer funcionalidades, requisitos y alcance de criterios de aceptacion
4. Estimar los costos via `cost-estimator.sh --task-type delivery --techs <worker_count>`
5. **Proteccion de presupuesto**: Si se especifica `--max-cost`, verificar que el costo estimado <= max_cost. Si hay exceso: mostrar `OVER BUDGET`, abortar
6. Crear equipo via `TeamCreate`

#### Paso 1.2: Lanzamiento del equipo (Fase 1)

El Lider lanza 3 workers de Fase 1 via la herramienta `Task`:

1. **Redactor** (sonnet): Instruido para crear EPICs y User Stories siguiendo el formato INVEST+3C+Gherkin
2. **Revisor** (haiku): Instruido para validar la calidad contra la tabla de verificaciones a continuacion — haiku es suficiente para esta tarea de clasificacion (12x mas economico que sonnet en output)
3. **Arquitecto** (sonnet): Instruido para validar la viabilidad tecnica y producir mapas de dominios de archivo

**Contexto lean por worker Fase 1**: Cada worker solo recibe el PRD/spec tech y la referencia tecnologica del proyecto. NO cargar las referencias de todas las tecnologias.

**Plantilla de spawn estructurada Fase 1 (TaskCreate)**: El Lider DEBE incluir en cada tarea:
```
Subject: "Redactar <artifact-type>: <titulo>"
Description:
  Proyecto: <nombre-del-proyecto>
  Tecnologia: <tech-del-proyecto>
  PRD/Spec: <contenido o referencia>
  Artefacto esperado: <EPIC|US|Tarea>
  Formato: INVEST+3C+Gherkin para US
  Criterios de exito: INVEST 6/6, ACs nominales >= 1, alternativos >= 2, error >= 2
  Referencia: @.claude/references/<tech>/CLAUDE.md
activeForm: "Redaccion <artifact-type>"
```

#### Paso 1.3: Pipeline de artefactos

El pipeline es secuencial por artefacto, pero esta **en pipeline** a traves de artefactos (multiples artefactos en vuelo en diferentes etapas simultaneamente):

```
Redactor crea → Revisor valida calidad → Arquitecto valida tech + dominios → Lider acepta/devuelve
     ^                                                                                    |
     └──────────────── Ciclo de reescritura (max 2x, feedback consolidado) ───────────────┘
```

El Lider coordina via `SendMessage`:
1. Asigna un artefacto al Redactor via tarea
2. Cuando el Redactor completa, envia el artefacto al Revisor para validacion de calidad
3. Cuando el Revisor aprueba, envia al Arquitecto para validacion tecnica + mapeo de dominios
4. Cuando el Arquitecto aprueba, el Lider marca el artefacto como aceptado
5. Si el Revisor O el Arquitecto rechazan, el Lider consolida el feedback y lo devuelve al Redactor (max `--max-rewrites` ciclos)
6. Si el artefacto sigue fallando despues del maximo de reescrituras, el Lider lo marca como `needs_human_review` y continua

#### Verificaciones de calidad del Revisor

| Verificacion | Umbral | Fuente |
|--------------|--------|--------|
| Puntuacion INVEST | 6/6 | `backlog-gate.yaml` |
| AC nominales | >= 1 | Patrones de `@product-owner` |
| AC alternativos | >= 2 | Patrones de `@product-owner` |
| AC de error | >= 2 | Patrones de `@product-owner` |
| Formato Gherkin | 100% | Validacion de gate |
| Slicing vertical | Si | Patrones de `@tech-lead` |
| Story points | 1-8 | Criterio INVEST "Small" |
| Beneficio explicito | Si | Criterio INVEST "Valuable" |

#### Salida del mapa de dominios de archivo del Arquitecto

El Arquitecto produce un mapa de dominios de archivo para cada User Story:

```yaml
US-001:
  file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  overlaps_with: []
US-002:
  file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]
  overlaps_with: []
US-003:
  file_domains: [src/Domain/User/, src/App/Auth/]
  overlaps_with: [US-001]  # → secuenciado despues de US-001 en Fase 2
```

Este mapa determina las oleadas de paralelizacion en la Fase 2.

#### Paso 1.4: Gate Sprint Ready

Cuando todos los artefactos estan procesados, el Lider valida el Gate Sprint Ready (100%):

1. Todas las stories tienen INVEST 6/6 (o estan marcadas como `needs_human_review`)
2. El mapa de dominios de archivo esta completo
3. Las oleadas de paralelizacion estan calculadas
4. El backlog del sprint esta escrito en `.bmad/sprint-status.yaml`

#### Salida de la Fase 1

```
================================================================
EQUIPO DE ENTREGA - Fase 1: Resumen de redaccion
================================================================

Sprint: <sprint-name>
Fecha: YYYY-MM-DD
Equipo: 1 lider + 3 redactores

----------------------------------------------------------------
ARTEFACTOS CREADOS
----------------------------------------------------------------

| Artefacto | Tipo | INVEST | Reescrituras | Estado |
|-----------|------|--------|--------------|--------|
| EPIC-001 | Epic | - | 0 | ACEPTADO |
| US-001 | Story | 6/6 | 0 | ACEPTADO |
| US-002 | Story | 6/6 | 1 | ACEPTADO |
| US-003 | Story | 6/6 | 0 | ACEPTADO |
| US-004 | Story | 4/6 | 2 | REVISION_HUMANA |

----------------------------------------------------------------
MAPA DE DOMINIOS DE ARCHIVO
----------------------------------------------------------------

| Story | Dominios | Solapamientos |
|-------|----------|---------------|
| US-001 | src/Domain/User/, src/App/User/ | - |
| US-002 | src/Domain/Order/, src/App/Order/ | - |
| US-003 | src/Domain/User/, src/App/Auth/ | US-001 |

----------------------------------------------------------------
OLEADAS DE PARALELIZACION
----------------------------------------------------------------

Oleada 1: [US-001, US-002] — independientes (0 solapamiento)
Oleada 2: [US-003]         — depende de archivos de US-001

----------------------------------------------------------------
METRICAS DE CALIDAD
----------------------------------------------------------------

| Metrica | Valor |
|---------|-------|
| Puntuacion INVEST promedio | 5.5/6 |
| Cobertura AC (nom/alt/err) | 100% / 95% / 90% |
| Stories aceptadas | 3/4 |
| Stories necesitando revision | 1/4 |
| Total reescrituras | 3 |
| Solapamientos de dominio de archivo | 1 |
```

### Transicion de Fase

Si `--phase=all`, el Lider realiza una transicion de equipo segura:

#### Paso T.1: Escritura del contrato de handoff

El Lider escribe un archivo `phase-handoff.yaml` en el directorio de sesion antes de cerrar la Fase 1:

```yaml
# .bmad/phase-handoff.yaml — contrato inter-fases
handoff_version: "1.0"
timestamp: "2026-02-13T10:30:00Z"
sprint: "<sprint-name>"
phase1_status: "completed"

stories_accepted:
  - id: US-001
    invest_score: 6
    file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  - id: US-002
    invest_score: 6
    file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]

stories_needs_review:
  - id: US-004
    reason: "INVEST 4/6 tras 2 reescrituras"

parallelization_waves:
  - wave: 1
    stories: [US-001, US-002]
    reason: "0 solapamiento de dominios de archivo"
  - wave: 2
    stories: [US-003]
    reason: "depende de archivos de US-001"

phase1_metrics:
  artifacts_created: 4
  rewrites_total: 3
  avg_invest_score: 5.5
  duration_minutes: 20
```

#### Paso T.2: Apagado de Fase 1 y lanzamiento de Fase 2

1. Enviar `shutdown_request` al Redactor, Revisor, Arquitecto
2. Esperar a que todos los workers se detengan (~30s)
3. El Lider conserva el contexto completo de la Fase 1 via `phase-handoff.yaml`
4. Proceder al lanzamiento de la Fase 2

#### Recuperacion tras crash

Si el Lider se reinicia entre las dos fases:
1. Verificar la existencia de `.bmad/phase-handoff.yaml`
2. Si esta presente con `phase1_status: completed`, reanudar directamente en Fase 2
3. Usar las `parallelization_waves` y `file_domains` del handoff para la asignacion
4. Si esta ausente o `phase1_status != completed`, relanzar la Fase 1

### Fase 2: Implementacion (Velocidad + Delegacion)

#### Composicion del equipo Fase 2

```
Lider de Entrega (opus) — mismo lider, contexto de Fase 1 preservado
  |
  +-- dev-worker-1 (sonnet) : US-001 (TDD)
  +-- dev-worker-2 (sonnet) : US-002 (TDD)
  +-- dev-worker-3 (sonnet) : US-003 (TDD)
```

#### Ventajas vs team-sprint solo

1. **Mapa de dominios de archivo ya calculado** — la asignacion es fiable, sin analisis heuristico en tiempo de ejecucion
2. **Stories de mayor calidad** — ACs completos, menos retrabajo durante la implementacion
3. **Lider con contexto completo** — mejores decisiones de asignacion
4. **Oleadas pre-calculadas**:
   ```
   Oleada 1: [US-001, US-002] — independientes (0 solapamiento)
   Oleada 2: [US-003]         — depende de archivos de US-001
   ```

#### Paso 2.1: Lanzamiento de workers

El Lider lanza dev workers (hasta `--max-workers`) y asigna stories por oleada:

1. Las stories de la Oleada 1 se asignan en paralelo (una story por worker)
2. Cuando la Oleada 1 se completa, se asignan las stories de la Oleada 2
3. Los workers liberados de stories completadas toman la siguiente story disponible

El Lider crea un `TaskCreate` por story:

- **Asunto**: `Implementar US-XXX: <titulo de la story>`
- **Descripcion**: Contenido completo de la story, criterios de aceptacion, referencias al tech spec, requisitos TDD, alcance del dominio de archivo
- **activeForm**: `Implementando US-XXX`

#### Paso 2.2: Ejecucion del worker (por story)

Cada dev worker sigue el ciclo TDD para su story asignada:

```
1. Leer story y criterios de aceptacion
2. RED: Escribir tests que fallen desde los criterios de aceptacion
3. GREEN: Implementar codigo minimo para pasar los tests
4. REFACTOR: Limpiar manteniendo los tests en verde
5. Ejecutar suite de tests completa (basada en Docker)
6. Escribir resumen de resultados
7. Marcar tarea como completada
```

**Comandos TDD del worker** (especificos por tecnologia):

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

#### Paso 2.3: Transicion de story

A medida que cada worker completa, el Lider:

1. Valida la Definition of Done (DoD) para la story
2. Transiciona el estado de la story: `in-progress` -> `review`
3. Asigna la siguiente story (respetando el orden de oleadas) al worker liberado
4. Repite hasta que no queden stories o se alcancen los limites

**Checklist de validacion DoD**:
- [ ] Todos los tests de criterios de aceptacion pasan
- [ ] Sin nuevos errores de linting introducidos
- [ ] Cobertura de codigo no disminuida
- [ ] Sin secretos en el codigo commiteado
- [ ] Implementacion de la story coincide con el tech spec

#### Paso 2.4: Recuperacion de errores

El Lider clasifica los errores segun el motor de recuperacion Ralph:

| Nivel | Tipo | Accion | Ejemplos |
|-------|------|--------|----------|
| 0 | Transitorio | Auto-reintento con backoff | Timeout, rate limit, red |
| 1 | Recuperable | Worker auto-corrige + reintento | Errores de lint, fallos de tests, deps |
| 2 | Degradado | Continuar con advertencia | Docs, gates opcionales, caida de cobertura |
| 3 | Bloqueado | Escalar a humano | Seguridad, arquitectura, auth |

**Deteccion de worker atascado**: Si un worker no ha actualizado su tarea en 10 minutos, el Lider envia un mensaje de verificacion de estado. Si no hay respuesta en 2 minutos, el Lider marca la story como bloqueada y la reasigna a otro worker o la pone en cola para revision humana.

**Conflicto de dominio de archivo detectado en ejecucion**: Si un worker reporta un conflicto de archivo con el alcance de otro worker, el Lider detiene al worker en conflicto, espera a que el primero complete, y luego reasigna secuencialmente.

### Integracion de gates BMAD

| Gate | Umbral | Cuando | Validado por |
|------|--------|--------|-------------|
| Gate PRD | >=80% | Antes de la Fase 1 | El Lider valida la entrada |
| Gate Backlog | INVEST 6/6 | Fase 1 — por artefacto | Revisor |
| Gate Sprint Ready | 100% | Fin de la Fase 1 | Lider |
| Gate DoD de Story | 100% | Fase 2 — por story | Lider despues del worker |

### Paso final: Finalizacion del sprint

Cuando todas las stories han sido procesadas:

1. El Lider genera el reporte de entrega completo
2. Actualiza `.bmad/sprint-status.yaml` via patron de escritor unico
3. Envia `shutdown_request` a todos los dev workers
4. Reporta metricas finales

## Salida

### Reporte de entrega completo

```
================================================================
EQUIPO DE ENTREGA - Reporte completo
================================================================

Sprint: <sprint-name>
Fecha: YYYY-MM-DD
Modo: Ciclo de vida completo (Redaccion + Implementacion)
Equipo: 1 lider + 3 redactores (Fase 1) + N dev workers (Fase 2)

================================================================
FASE 1: RESUMEN DE REDACCION
================================================================

| Artefacto | Tipo | INVEST | Reescrituras | Estado |
|-----------|------|--------|--------------|--------|
| US-001 | Story | 6/6 | 0 | ACEPTADO |
| US-002 | Story | 6/6 | 1 | ACEPTADO |
| US-003 | Story | 6/6 | 0 | ACEPTADO |

Oleadas de paralelizacion:
  Oleada 1: [US-001, US-002]
  Oleada 2: [US-003]

================================================================
FASE 2: RESUMEN DE IMPLEMENTACION
================================================================

| Story | Titulo | Worker | Oleada | Tiempo | DoD |
|-------|--------|--------|--------|--------|-----|
| US-001 | Funcionalidad de login | dev-1 | 1 | 12m | PASS |
| US-002 | Perfil de usuario | dev-2 | 1 | 18m | PASS |
| US-003 | Dashboard | dev-1 | 2 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUEADAS
----------------------------------------------------------------

| Story | Titulo | Fase | Razon | Escalamiento |
|-------|--------|------|-------|-------------|
| US-004 | Pago | Redaccion | INVEST 4/6 tras 2 reescrituras | revision_humana |

================================================================
METRICAS DE EJECUCION
================================================================

| Metrica | Valor |
|---------|-------|
| Stories redactadas | X |
| Stories implementadas | Y / Z |
| Stories bloqueadas | W |
| Tiempo Fase 1 | Xm |
| Tiempo Fase 2 | Ym |
| Tiempo total | Zm (vs ~Wm secuencial) |
| Aceleracion | ~X.Xx |
| Tokens totales | ~XK |
| Puntuacion INVEST promedio | X.X/6 |
| Workers lanzados | N (Fase 1) + M (Fase 2) |
```

## Analisis de costos

Para 1 EPIC, 5 US, ~25 tareas:

| Metrica | Secuencial | Team Delivery | Delta |
|---------|-----------|---------------|-------|
| Tokens Fase 1 | ~350K | ~475K | +36% |
| Tokens Fase 2 | ~500K | ~650K | +30% |
| Tiempo Fase 1 | ~45 min | ~20 min | -56% |
| Tiempo Fase 2 | ~75 min | ~35 min | -53% |
| **Tiempo total** | **~120 min** | **~55 min** | **~2.2x** |
| Costo total* | ~$28 | ~$17 | **-38%** |

*Ahorro de costos porque Sonnet ($3/$15/M) gestiona la mayoria del trabajo vs Opus ($15/$75/M) en modo secuencial.

## Expectativas de rendimiento

| Workers | Stories | Estimacion secuencial | Estimacion equipo | Aceleracion | Overhead de tokens |
|---------|---------|----------------------|-------------------|-------------|-------------------|
| 3 (redaccion) + 2 (impl) | 4 | ~80 min | ~40 min | ~2.0x | +30% |
| 3 (redaccion) + 2 (impl) | 6 | ~120 min | ~55 min | ~2.2x | +32% |
| 3 (redaccion) + 3 (impl) | 6 | ~120 min | ~50 min | ~2.4x | +35% |
| 3 (redaccion) + 3 (impl) | 9 | ~180 min | ~75 min | ~2.4x | +37% |

**Nota**: La aceleracion depende de la independencia de las stories y una complejidad comparable. La transicion de fase agrega ~30s de overhead.

## Manejo de errores

| Error | Recuperacion |
|-------|-------------|
| Artefacto invalido tras max reescrituras | Marcar `needs_human_review`, continuar con siguiente artefacto |
| Timeout del Arquitecto (>5min/US) | Continuar con mapa de dominios parcial, stories marcadas `sequential-only` |
| Crash de worker Fase 1 | El Lider reasigna al worker restante |
| Crash de worker Fase 2 | La story vuelve a `ready-for-dev`, otro worker la toma |
| Conflicto de dominio de archivo detectado en impl | El Lider detiene worker en conflicto, secuencia las stories |
| Conflicto en sprint-status.yaml | Patron de escritor unico (solo el Lider) |
| Falla el Gate PRD (<80%) | Abortar con mensaje claro, sugerir mejora del PRD |
| Todos los workers atascados | El Lider escala a humano |

## Limitaciones

- Maximo 5 agentes en total (1 lider + 3 por fase, transicion entre fases ~30s)
- La calidad depende de la calidad del PRD/tech spec de entrada
- El mapeo de dominios de archivo es heuristico (las utilidades compartidas pueden no detectarse)
- +30-40% overhead de tokens vs secuencial
- Requiere Agent Teams Research Preview (la API puede cambiar)
- No es adecuado para EPICs/US que requieran decisiones humanas interactivas durante el proceso
- La transicion de fase requiere apagado + relanzamiento (~30s de latencia)
