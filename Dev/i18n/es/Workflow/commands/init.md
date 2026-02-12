---
name: workflow-init
description: Analizar el contexto del proyecto y recomendar el flujo de trabajo de desarrollo optimo
arguments:
  - name: scope
    description: Indicacion de alcance opcional (bug, feature, platform, migration)
    required: false
  - name: track
    description: Forzar un track especifico (--quick, --standard, --enterprise)
    required: false
---

# /workflow:init

## Mision

Analizar el contexto actual del proyecto y recomendar el flujo de trabajo de desarrollo optimo. Inicializar el seguimiento del flujo de trabajo y guiar al usuario a traves de las fases apropiadas.

## Flujo de trabajo

### Paso 1: Descubrimiento del contexto

```
╔══════════════════════════════════════════════════════════╗
║             INICIALIZACION DEL FLUJO DE TRABAJO           ║
╠══════════════════════════════════════════════════════════╣
║ Analizando contexto del proyecto...                       ║
╚══════════════════════════════════════════════════════════╝
```

**Analizar:**

1. **Estructura del proyecto**
   - Verificar directorio `.claude/`
   - Detectar stack tecnologico desde archivos
   - Identificar framework (Symfony, Flutter, React, etc.)

2. **Documentacion existente**
   - `project-management/prd.md` - Existe PRD?
   - `project-management/tech-spec.md` - Existe Tech Spec?
   - `project-management/backlog/` - Existe Backlog?
   - `README.md` - Descripcion del proyecto

3. **Tamano del codebase**
   - Contar archivos fuente
   - Estimar complejidad
   - Identificar componentes/modulos

4. **Contexto Git**
   - Rama actual
   - Commits recientes
   - Cambios pendientes

### Paso 2: Evaluacion de complejidad

**Matriz de puntuacion:**

| Factor | Quick (1) | Standard (2) | Enterprise (3) |
|--------|-----------|--------------|----------------|
| Archivos a modificar | 1-5 | 5-50 | 50+ |
| Nuevas entidades/tablas | 0 | 1-3 | 4+ |
| Integraciones externas | 0 | 1 | 2+ |
| User stories estimadas | 1-3 | 3-15 | 15+ |
| Equipos involucrados | 1 | 1 | 2+ |
| Implicaciones de seguridad | Bajo | Medio | Alto |

**Calcular puntuacion:**
- Puntuacion 6-8: Quick Flow
- Puntuacion 9-14: Standard
- Puntuacion 15+: Enterprise

### Paso 3: Recomendacion de track

```
╔══════════════════════════════════════════════════════════╗
║               ANALISIS DEL PROYECTO COMPLETADO            ║
╠══════════════════════════════════════════════════════════╣
║ Proyecto: mi-aplicacion                                   ║
║ Stack: Symfony 7.x + React 18                             ║
║ Estado: Proyecto existente con backlog                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ EVALUACION DE COMPLEJIDAD:                                ║
║ ├── Archivos impactados:    ~25        [Standard]         ║
║ ├── Nuevas entidades:       2          [Standard]         ║
║ ├── Integraciones:          1 (Stripe) [Standard]         ║
║ ├── Stories estimadas:      8          [Standard]         ║
║ ├── Equipos:                1          [Quick]            ║
║ └── Seguridad:              Alto       [Enterprise]       ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║ TRACK RECOMENDADO: STANDARD                               ║
║ ═══════════════════════════════════════════════════════  ║
║                                                           ║
║ Justificacion:                                            ║
║ • Alcance de la feature requiere planificacion (8 stories)║
║ • Integracion externa necesita diseno tecnico             ║
║ • Implicaciones de seguridad requieren arquitectura       ║
║   cuidadosa                                               ║
║ • Un solo equipo puede gestionar sin proceso enterprise   ║
║   completo                                                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 4: Planificacion de fases

Segun el track, mostrar el flujo de trabajo:

**Quick Flow:**
```
╔══════════════════════════════════════════════════════════╗
║              FLUJO QUICK FLOW                             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────────┐                                     ║
║  │  IMPLEMENTACION  │ ← Comenzar aqui                     ║
║  └──────────────────┘                                     ║
║                                                           ║
║ No requiere documentacion. Directo a programar.           ║
║                                                           ║
║ Comandos:                                                 ║
║ • /common:fix-bug-tdd    - Corregir con TDD               ║
║ • /project:add-task      - Registrar el trabajo            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Standard:**
```
╔══════════════════════════════════════════════════════════╗
║              FLUJO STANDARD                               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────┐  ┌──────────┐  ┌──────────────┐        ║
║  │PLANIFICACION │→ │  DISENO  │→ │IMPLEMENTACION│        ║
║  └──────────────┘  └──────────┘  └──────────────┘        ║
║       ↑                                                   ║
║   Comenzar aqui                                           ║
║                                                           ║
║ Fase 1 - Planificacion:                                   ║
║ • /project:generate-prd    - Crear/actualizar PRD         ║
║ • /project:generate-backlog - Crear user stories          ║
║                                                           ║
║ Fase 2 - Diseno:                                          ║
║ • /project:generate-tech-spec - Diseno tecnico            ║
║                                                           ║
║ Fase 3 - Implementacion:                                  ║
║ • /project:sprint-dev      - Desarrollo TDD/BDD           ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Enterprise:**
```
╔══════════════════════════════════════════════════════════╗
║              FLUJO ENTERPRISE                             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐ ┌──────────────┐ ┌────────┐ ┌────────────┐ ║
║  │ ANALISIS │→│PLANIFICACION │→│ DISENO │→│IMPLEMENTAC.│ ║
║  └──────────┘ └──────────────┘ └────────┘ └────────────┘ ║
║       ↑                                                   ║
║   Comenzar aqui                                           ║
║                                                           ║
║ Fase 1 - Analisis:                                        ║
║ • /workflow:analyze        - Investigacion y exploracion  ║
║                                                           ║
║ Fase 2 - Planificacion:                                   ║
║ • /project:generate-prd    - PRD completo                 ║
║ • /project:generate-backlog - Backlog completo            ║
║                                                           ║
║ Fase 3 - Diseno:                                          ║
║ • /project:generate-tech-spec - Tech spec completo        ║
║ • /common:architecture-decision - ADRs                    ║
║                                                           ║
║ Fase 4 - Implementacion:                                  ║
║ • /project:sprint-dev      - Desarrollo sprint a sprint   ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 5: Inicializar seguimiento

Crear archivo de estado del flujo de trabajo:

```yaml
# project-management/workflow-status.yaml
project: mi-aplicacion
track: standard
initialized_at: 2026-01-07T10:00:00Z
current_phase: planning

phases:
  analysis:
    status: skipped
    reason: "Standard track - analisis no requerido"
  planning:
    status: pending
    artifacts:
      prd: pending
      personas: pending
      backlog: pending
  design:
    status: pending
    artifacts:
      tech_spec: pending
      architecture: pending
  implementation:
    status: pending

next_action: "Generar o actualizar PRD"
next_command: "/project:generate-prd"
```

### Paso 6: Indicar siguiente accion

```
╔══════════════════════════════════════════════════════════╗
║                    LISTO PARA COMENZAR                     ║
╠══════════════════════════════════════════════════════════╣
║ Flujo inicializado: track STANDARD                        ║
║ Archivo de estado: project-management/workflow-status.yaml║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ SIGUIENTE PASO: Fase de planificacion                     ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Comenzar con: /workflow:plan                              ║
║                                                           ║
║ O ir directamente a tareas especificas:                   ║
║ • /project:generate-prd     - Crear documento de          ║
║                                requisitos                  ║
║ • /project:generate-backlog - Crear user stories          ║
║                                                           ║
║ Verificar progreso en cualquier momento: /workflow:status  ║
╚══════════════════════════════════════════════════════════╝
```

## Opciones de sobreescritura

```bash
# Forzar track especifico
/workflow:init --quick          # Forzar Quick Flow
/workflow:init --standard       # Forzar Standard
/workflow:init --enterprise     # Forzar Enterprise

# Proporcionar indicacion de alcance
/workflow:init bug              # Indicacion: es una correccion de bug
/workflow:init feature          # Indicacion: nueva funcionalidad
/workflow:init platform         # Indicacion: trabajo de plataforma
```

## Comandos relacionados

- `/workflow:status` - Verificar progreso actual del flujo de trabajo
- `/workflow:plan` - Iniciar fase de planificacion
- `/workflow:design` - Iniciar fase de diseno
- `/workflow:implement` - Iniciar fase de implementacion
- `/workflow:analyze` - Iniciar fase de analisis (solo Enterprise)
