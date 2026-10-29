---
name: workflow-plan
description: "Ejecutar la fase de Planificación - investigación (--research), PRD (--only=prd) y backlog SCRUM (--only=backlog)"
argument-hint: "[--research] [--only=prd|backlog] [--continue]"
arguments:
  - name: research
    description: "Ejecutar primero la etapa de investigación (antiguo /workflow:plan --research): dominio, mercado, investigación técnica, restricciones, riesgos"
    required: false
  - name: only
    description: "Ejecutar una sola etapa: prd (PRD + personas) o backlog (personas, DoD, epics, user stories, sprints)"
    required: false
  - name: continue
    description: Continuar desde donde se quedó
    required: false
---

# /workflow:plan

## Misión

Ejecutar la fase de Planificación del workflow de desarrollo: investigación opcional, Product Requirements Document (PRD), personas y backlog SCRUM (epics, user stories, carpetas de sprint). Este comando contiene toda la lógica de generación; ya no hay un generador de PRD o de backlog independiente al que llamar.

## Usage

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/workflow:plan` | Fase completa: PRD y luego backlog (añadir `--research` para empezar por la investigación) | - |
| `/workflow:plan --research` | Investigación, exploración, restricciones y riesgos, antes del PRD. Escribe `project-management/analysis/` | `/workflow:plan --research` |
| `/workflow:plan --only=prd` | Solo PRD + personas. Escribe `project-management/prd.md` | `/workflow:plan --only=prd` |
| `/workflow:plan --only=backlog` | Solo backlog: lee `project-management/prd.md` (+ `project-management/tech-spec.md` si existe), escribe personas, DoD, epics, user stories con `**Implements**`, carpetas de sprint `sprint-{N}-{slug}`, y registra las stories en `.bmad/sprint-status.yaml` con estado `backlog` | `/workflow:plan --only=backlog` |
| `/workflow:plan --continue` | Reanudar una ejecución interrumpida | - |

`--research` puede combinarse con `--only=prd` (investigación y luego PRD).

## Orden canónico

Los documentos se producen en este orden: **PRD, luego tech spec, luego backlog, luego sprint**.

- **Track Quick**: `/workflow:plan` (sin opciones) genera PRD + backlog de una vez.
- **Standard / Enterprise (recomendado)**: `/workflow:plan --only=prd`, luego `/workflow:design`, luego `/workflow:plan --only=backlog`. El backlog lee entonces `project-management/prd.md` y `project-management/tech-spec.md`: las stories llevan la arquitectura real y `**Implements**` apunta a los `FR-xxx` del PRD.
- **Enterprise**: empezar con `/workflow:plan --research --only=prd`.

Sin PRD, `--only=backlog` recurre a las especificaciones de `./docs/` (ARCHITECTURE_TECHNIQUE*.md, CAHIER_DES_CHARGES*.md u otro archivo de especificación) y avisa de que la trazabilidad queda degradada.

## Cuándo usar

- Tracks **Standard** y **Enterprise**, después de `/workflow:init`
- Al empezar la planificación de funcionalidades, o cuando hay que regenerar el PRD o el backlog

## Plan Mode

> **El Plan Mode es obligatorio.** Claude activa el plan mode para estructurar el enfoque, identificar dependencias y presentar una estrategia de generación antes de crear los artefactos.

## Workflow

### Paso 1: Preparación y artefactos existentes

Mostrar el track y la fase (Planificación = fase 2 de 4), y luego revisar `project-management/`: `prd.md`, `personas.md`, `backlog/`, `analysis/` (constraints.md, research-summary.md). Los archivos existentes nunca se sobrescriben en silencio: preguntar si actualizar, fusionar u omitir.

### Paso 2 (`--research`): Fase de investigación

Antiguo `/workflow:plan --research`. Investigación, exploración y restricciones antes del PRD.

**Preguntas guiadas**

| Área | Preguntas |
|------|-----------|
| Dominio | ¿Qué problema? ¿Qué partes interesadas? ¿Motores de negocio? ¿Cómo es el éxito? |
| Mercado | ¿Soluciones existentes? ¿Competidores? ¿Buenas prácticas del sector? ¿Tendencias emergentes? |
| Técnica | ¿Tecnologías candidatas? ¿Integraciones? ¿Escalabilidad? ¿Seguridad / cumplimiento? |

Si el MCP Context7 está configurado, usarlo para documentación técnica actualizada (`/deep-research` para una investigación web profunda; fuera de claude.ai, el agente `@research-assistant`).

**Restricciones**: documentar las restricciones técnicas (backend existente, base de datos), de negocio (presupuesto, plazos, retrocompatibilidad), regulatorias (RGPD, PCI DSS) y de recursos (tamaño del equipo, sin DevOps).

**Riesgos y oportunidades**: tabla de riesgos (riesgo, impacto, probabilidad, mitigación) y oportunidades.

**Artefactos**

```
project-management/analysis/
├── research-summary.md      # Hallazgos principales
├── constraints.md           # Todas las restricciones identificadas
├── risks-opportunities.md   # Registro de riesgos y oportunidades
└── technical-options.md     # Evaluación de tecnologías
```

Agentes: **research-assistant** (investigación técnica), **product-owner** (contexto de negocio). Siguiente: PRD (el análisis lo alimenta).

### Paso 3 (`--only=prd` o ejecución completa): Generación del PRD

Escribe `project-management/prd.md` y `project-management/personas.md`.

**Fase 1 - Descubrimiento del contexto**: leer `README.md`, revisar `./docs/` en busca de especificaciones, leer `project-management/personas.md` y `project-management/analysis/` si existen, analizar el código para conocer el stack técnico, revisar la conversación. Listar las fuentes encontradas.

**Fase 2 - Clarificación interactiva** (preguntar solo lo que falta):

| Tema | Preguntas |
|------|-----------|
| Problema y oportunidad | ¿Qué problema? ¿Quién lo sufre más? ¿Coste de no resolverlo? ¿Oportunidad de negocio? |
| Usuarios objetivo | ¿Usuarios principales (rol, perfil)? ¿Objetivos? ¿Frustraciones con las soluciones actuales? ¿Usuarios secundarios? |
| Objetivos y métricas | ¿Objetivos de negocio? ¿KPIs con valores objetivo y plazos? ¿Cómo es el éxito del MVP? |
| Alcance y restricciones | ¿Funcionalidades imprescindibles (P0)? ¿Qué queda explícitamente fuera? ¿Restricciones técnicas, de presupuesto, plazos, cumplimiento? |

**Fase 3 - Generación**: cargar la plantilla de PRD (`.claude/templates/project/prd.md` si existe), completar todas las secciones, crear personas detalladas, organizar los requisitos en P0/P1/P2 con IDs estables `FR-001`, `FR-002`... (funcionales) y `NFR-001`... (no funcionales) para que las stories puedan trazarse a ellos, identificar riesgos a partir de restricciones y dependencias.

**Fase 4 - Revisión e iteración**: mostrar una checklist de secciones (Executive Summary, Problem Statement, Goals & Metrics, Target Users, Functional Requirements, Non-Functional Requirements, Scope & Constraints, Timeline, Risks & Mitigations), señalar las incompletas y luego ofrecer ampliar una sección, detallar las personas o ajustar la priorización.

```
project-management/
├── prd.md                    # PRD generado (FR-xxx / NFR-xxx)
├── personas.md               # Personas extraídas/creadas
└── analysis/discovery-notes.md
```

### Paso 4 (`--only=backlog` o ejecución completa): Generación del backlog

Actúe como un Product Owner y Scrum Master con experiencia. El backlog debe respetar los 3 pilares de Scrum (transparencia, inspección, adaptación) y los valores Agile.

**Entradas, por orden de prioridad**

1. `project-management/prd.md`: fuente principal. Sus IDs `FR-xxx` alimentan el campo `**Implements**` de cada user story.
2. `project-management/tech-spec.md` si existe (ver `/workflow:design`): arquitectura, entidades, endpoints usados en las notas técnicas.
3. Alternativa sin PRD: especificaciones en `./docs/`.

**Vertical slicing (obligatorio)**: cada user story atraviesa todas las capas del stack del proyecto (UI, API, persistencia). Ninguna story «solo backend» o «solo frontend». Detectar el stack a partir de la tech spec o del código y adaptar la DoD y los criterios técnicos en consecuencia.

**Estructura creada**

```
project-management/
├── README.md                 # Visión general, personas, epics, métricas, roadmap
├── personas.md
├── definition-of-done.md
├── dependencies-matrix.md
├── backlog/
│   ├── epics/EPIC-XXX-name.md
│   └── user-stories/US-XXX-name.md
└── sprints/sprint-{N}-{slug}/   # p. ej. sprint-1-walking_skeleton
    ├── sprint-goal.md
    └── sprint-dependencies.md
```

**personas.md**: mínimo 3 personas (IDs P-001, P-002...; 1 principal, 2+ secundarias). Cada una: identidad, cita representativa, contexto, 3 objetivos, al menos 3 frustraciones, motivaciones, comportamientos, escenarios de uso (Contexto, Necesidad, Acción, Resultado), criterios de decisión. Añadir una matriz personas/funcionalidades (3 estrellas crítico, 2 importante, 1 útil) y anti-personas.

**definition-of-done.md**: código (revisión aprobada, convenciones, SOLID), tests (80 % unitarios, integración, E2E, CI en verde), criterios por capa (UI, API, paridad entre clientes), documentación, calidad (análisis estático nivel máximo, API por debajo de 200 ms), despliegue (migraciones, staging, validación del PO).

**Epics** (`EPIC-XXX-name.md`): descripción (valor de negocio), tabla de stories asociadas (ID, título, puntos, prioridad, depende de), dependencias (prerrequisitos y dependientes), Minimum Marketable Feature (MMF) con las stories incluidas, estimación (tamaño S/M/L/XL, sprints estimados).

**User stories** (`US-XXX-name.md`), a partir de `.claude/templates/project/user-story.md`:

- **INVEST** (obligatorio): Independent, Negotiable, Valuable, Estimable, Sized (8 puntos máx.), Testable.
- **3 C** (obligatorio): Card («Como [P-XXX]... quiero... para...»), Conversation (preguntas abiertas), Confirmation (criterios de aceptación).
- **Criterios de aceptación** en Gherkin SMART: 1 escenario nominal, al menos 2 alternativos, al menos 2 escenarios de error.
- Epic padre, persona asociada, criterios por capa, notas técnicas, estimación (puntos Fibonacci, MoSCoW), dependencias (bloqueantes y bloqueadas), sprint asignado.
- **Trazabilidad**: completar la sección `## Traceability` con `**Implements**: {FR-001, FR-003}` (IDs de los requisitos del PRD que entrega la story). Una story sin `FR-xxx` se señala.

**dependencies-matrix.md**: grafo Mermaid entre epics, tabla de dependencias, ruta crítica, dependencias entre stories.

**Sprints** (`sprint-{N}-{slug}/`): `sprint-goal.md` (objetivo en una frase, ceremonias, stories seleccionadas y total de puntos, orden de ejecución, grafo de dependencias Mermaid, incremento entregable, directiva de retrospectiva y formato Starfish) y `sprint-dependencies.md`.

**Registro en `.bmad/sprint-status.yaml`**: para cada story, añadir una entrada con `status: backlog` (esquema: `Project/templates/sprint-status.yaml.template`): `title`, `story_points`, `epic_id`, `tasks` (total 0), `acceptance_criteria.total` y una entrada `history` «Story created». `.bmad/sprint-status.yaml` es la fuente única de verdad del estado; los archivos markdown solo contienen contenido, nunca un estado. Crear el archivo desde la plantilla si falta, nunca sobrescribir entradas existentes.

**Reglas Scrum**: sprints de 2 semanas, velocidad 20-40 puntos, 8 puntos máx. por story (si no, dividir), escala de Fibonacci (1, 2, 3, 5, 8, 13, 21), Sprint 1 = Walking Skeleton (infraestructura + un flujo completo).

### Paso 5: Validación

Ejecutar `/gate:check backlog` (o comprobar en línea):

| Control | Criterios |
|---------|-----------|
| INVEST | Los 6 criterios por story; 8 puntos máx. (13+ debe dividirse) |
| 3 C | Card, Conversation, Confirmation presentes |
| Gherkin | Formato válido; 1 nominal + 2 alternativos + 2 errores |
| Personas | Al menos 3, matriz presente |
| Epics | MMF identificado, dependencias Mermaid |
| Sprints | Sprint 1 = Walking Skeleton, objetivo en una frase, grafo de dependencias |
| Trazabilidad | Cada story tiene `**Implements**`; cada `FR-xxx` P0 está cubierto por al menos una story |
| Estado | Cada story está registrada en `.bmad/sprint-status.yaml` como `backlog` |

Señalar las advertencias (por ejemplo «US-012: 21 puntos - debe dividirse») y corregirlas antes de terminar.

### Paso 6: Fin de fase

Resumir los artefactos (PRD, personas, epics, número de stories, total de puntos, alcance del Sprint 1, sprints estimados) y recomendar el siguiente paso: tras `--only=prd`, `/workflow:design` y luego `/workflow:plan --only=backlog`; tras el backlog, `/workflow:design` (si aún no hay tech spec) o `/workflow:start 1`.

## Agentes involucrados

- **product-owner**: creación del PRD, personas, priorización, backlog
- **tech-lead**: revisión de viabilidad técnica, ayuda con la estimación
- **research-assistant**: investigación (`--research`)

## Archivos generados

| Archivo | Propósito | Modo |
|---------|-----------|------|
| `analysis/*.md` | Investigación, restricciones, riesgos | `--research` |
| `prd.md`, `personas.md` | PRD con `FR-xxx` / `NFR-xxx`, personas | `--only=prd` |
| `definition-of-done.md`, `dependencies-matrix.md`, `README.md` | Marco del backlog | `--only=backlog` |
| `backlog/epics/`, `backlog/user-stories/` | Epics y stories (`**Implements**`) | `--only=backlog` |
| `sprints/sprint-{N}-{slug}/` | Carpetas de sprint | `--only=backlog` |
| `.bmad/sprint-status.yaml` | Stories registradas como `backlog` | `--only=backlog` |

## Opción de reanudación

Si se interrumpe, `/workflow:plan --continue` detecta lo que existe (PRD completo, backlog en 12/18 stories) y reanuda en el siguiente elemento que falta.

## Comandos relacionados

- `/workflow:init` - Inicializar el workflow
- `/workflow:design` - Tech spec (entre el PRD y el backlog)
- `/workflow:start` - Iniciar un sprint desde el backlog
- `/workflow:status` - Comprobar el progreso
- `/project:backlog` - Añadir, listar, editar y mover stories después
- `/gate:check` - Validar el backlog
