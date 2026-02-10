---
name: workflow-status
description: Mostrar el progreso actual del flujo de trabajo y las siguientes acciones recomendadas
arguments:
  - name: verbose
    description: Mostrar estado detallado con todos los artefactos
    required: false
---

# /workflow:status

## Mision

Mostrar el estado actual del flujo de trabajo de desarrollo, incluyendo fases completadas, progreso actual y siguientes acciones recomendadas.

## Uso

```bash
/workflow:status           # Vista de estado estandar
/workflow:status --verbose # Vista detallada con todos los artefactos
```

## Formato de salida

### Vista estandar

```
╔══════════════════════════════════════════════════════════════════╗
║                    ESTADO DEL FLUJO DE TRABAJO                    ║
╠══════════════════════════════════════════════════════════════════╣
║ Proyecto: mi-aplicacion                                           ║
║ Track: STANDARD                                                   ║
║ Iniciado: 2026-01-07                                              ║
║ Fase actual: Diseno ████████████░░░░ 75%                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Fase 1: Analisis                                                 ║
║  └── ⏭️  Omitido (track Standard)                                 ║
║                                                                   ║
║  Fase 2: Planificacion                                            ║
║  └── ✅ Completado                                                ║
║      ├── PRD: ✅ Completado                                       ║
║      ├── Personas: ✅ 3 definidas                                 ║
║      └── Backlog: ✅ 18 stories (89 pts)                          ║
║                                                                   ║
║  Fase 3: Diseno                                                   ║
║  └── 🔄 En progreso                                               ║
║      ├── Tech Spec: ✅ Completado                                 ║
║      ├── Arquitectura: ✅ Diagramas C4 creados                    ║
║      ├── Diseno API: 🔄 En progreso (18/24 endpoints)             ║
║      └── ADRs: ✅ 3 creados                                       ║
║                                                                   ║
║  Fase 4: Implementacion                                           ║
║  └── ⏳ Pendiente                                                 ║
║      └── Sprint 1: Listo para iniciar (21 pts)                    ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ SIGUIENTE ACCION: Completar diseno de API                         ║
║ COMANDO: /workflow:design --continue                              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Vista detallada (--verbose)

```
╔══════════════════════════════════════════════════════════════════╗
║              ESTADO DEL FLUJO DE TRABAJO (DETALLADO)              ║
╠══════════════════════════════════════════════════════════════════╣
║ Proyecto: mi-aplicacion                                           ║
║ Track: STANDARD                                                   ║
║ Iniciado: 2026-01-07T10:00:00Z                                    ║
║ Ultima actualizacion: 2026-01-07T15:30:00Z                        ║
║ Archivo de estado: project-management/workflow-status.yaml        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ FASE 2: PLANIFICACION (Completada)                                ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ PRD: project-management/prd.md                                    ║
║ ├── Version: 1.0                                                  ║
║ ├── Requisitos funcionales: 12                                    ║
║ ├── Requisitos no funcionales: 8                                  ║
║ ├── Metricas de exito: 5 KPIs definidos                           ║
║ └── Ultima modificacion: 2026-01-07T11:00:00Z                     ║
║                                                                   ║
║ Personas: project-management/personas.md                          ║
║ ├── Principal: Dueno de negocio, Freelancer                       ║
║ └── Secundaria: Contable                                          ║
║                                                                   ║
║ Backlog: project-management/backlog/                              ║
║ ├── EPICs: 4                                                      ║
║ │   ├── EPIC-001: Gestion de usuarios (21 pts)                    ║
║ │   ├── EPIC-002: Integracion de pagos (24 pts)                   ║
║ │   ├── EPIC-003: Reportes (23 pts)                               ║
║ │   └── EPIC-004: Notificaciones (21 pts)                         ║
║ ├── User Stories: 18                                              ║
║ │   ├── P0 (Imprescindible): 8 stories                            ║
║ │   ├── P1 (Deseable): 6 stories                                  ║
║ │   └── P2 (Opcional): 4 stories                                  ║
║ └── Total Story Points: 89                                        ║
║                                                                   ║
║ Sprints planificados:                                             ║
║ ├── Sprint 1: Walking Skeleton (21 pts) - 5 stories               ║
║ ├── Sprint 2: Funcionalidades principales (28 pts) - 6 stories    ║
║ ├── Sprint 3: Pagos (24 pts) - 4 stories                          ║
║ └── Sprint 4: Pulido (16 pts) - 3 stories                         ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ FASE 3: DISENO (En progreso - 75%)                                ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Tech Spec: project-management/tech-spec.md ✅                     ║
║ ├── Version: 1.0                                                  ║
║ ├── Arquitectura: Clean Architecture (Hexagonal)                  ║
║ ├── Stack: Symfony 7.x + React 18 + PostgreSQL 16                 ║
║ └── Integraciones: Stripe, SendGrid, AWS S3                       ║
║                                                                   ║
║ Arquitectura: project-management/architecture/ ✅                 ║
║ ├── c4-context.md - Diagrama de contexto del sistema              ║
║ ├── c4-container.md - Diagrama de contenedores                    ║
║ ├── c4-component.md - Diagrama de componentes                     ║
║ └── erd.md - Diagrama Entidad-Relacion (8 entidades)              ║
║                                                                   ║
║ Diseno API: project-management/architecture/api.md 🔄             ║
║ ├── Disenados: 18 endpoints                                       ║
║ ├── Pendientes: 6 endpoints                                       ║
║ └── Auth: JWT con refresh tokens                                  ║
║                                                                   ║
║ ADRs: docs/adr/ ✅                                                ║
║ ├── ADR-001: Base de datos (PostgreSQL)                            ║
║ ├── ADR-002: Estilo de API (REST)                                  ║
║ └── ADR-003: Autenticacion (JWT)                                   ║
║                                                                   ║
║ Seguridad: project-management/architecture/security.md ⏳         ║
║ └── Estado: Pendiente                                             ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ FASE 4: IMPLEMENTACION (Pendiente)                                ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Sprint 1: sprint-001-walking-skeleton                             ║
║ ├── Estado: Listo para iniciar                                    ║
║ ├── Stories: 5                                                    ║
║ ├── Puntos: 21                                                    ║
║ └── Tareas: 0 (aun no descompuestas)                              ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ SALUD DEL FLUJO DE TRABAJO                                        ║
╠══════════════════════════════════════════════════════════════════╣
║ ✅ PRD alineado con backlog                                       ║
║ ✅ Tech spec cubre todos los requisitos                            ║
║ ✅ Arquitectura documentada                                        ║
║ ⚠️  Diseno de API incompleto (6 endpoints pendientes)              ║
║ ⚠️  Revision de seguridad pendiente                                ║
╠══════════════════════════════════════════════════════════════════╣
║ SIGUIENTES ACCIONES                                               ║
╠══════════════════════════════════════════════════════════════════╣
║ 1. Completar diseno de API (6 endpoints pendientes)               ║
║    Comando: /workflow:design --continue                           ║
║                                                                   ║
║ 2. Completar revision de seguridad                                ║
║    Comando: (incluido en fase de diseno)                          ║
║                                                                   ║
║ 3. Luego iniciar implementacion                                   ║
║    Comando: /workflow:implement                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Sin flujo de trabajo inicializado

```
╔══════════════════════════════════════════════════════════════════╗
║                    ESTADO DEL FLUJO DE TRABAJO                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  No hay flujo de trabajo inicializado para este proyecto      ║
║                                                                   ║
║  Para comenzar, ejecutar:                                         ║
║                                                                   ║
║    /workflow:init                                                 ║
║                                                                   ║
║  Esto:                                                            ║
║  • Analizara el contexto de tu proyecto                           ║
║  • Recomendara el track apropiado (Quick/Standard/Enterprise)     ║
║  • Inicializara el seguimiento del flujo de trabajo               ║
║  • Te guiara a traves de las fases de desarrollo                  ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Estado Quick Flow

```
╔══════════════════════════════════════════════════════════════════╗
║                    ESTADO DEL FLUJO DE TRABAJO                    ║
╠══════════════════════════════════════════════════════════════════╣
║ Proyecto: mi-aplicacion                                           ║
║ Track: QUICK FLOW                                                 ║
║ Iniciado: 2026-01-07                                              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Quick Flow - Implementacion directa                              ║
║  └── 🔄 En progreso                                               ║
║                                                                   ║
║  No se requieren fases para Quick Flow.                           ║
║  Trabajando directamente en implementacion.                       ║
║                                                                   ║
║  Tarea actual (si registrada):                                    ║
║  └── TASK-042: Corregir bug de validacion de login                ║
║      Estado: En progreso                                          ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ COMANDOS DISPONIBLES                                              ║
╠══════════════════════════════════════════════════════════════════╣
║ • /common:fix-bug-tdd     - Continuar con enfoque TDD             ║
║ • /project:move-task done - Marcar tarea como completada          ║
║ • /workflow:init          - Iniciar nuevo flujo de trabajo        ║
╚══════════════════════════════════════════════════════════════════╝
```

## Estructura del archivo de estado

El estado se lee desde `project-management/workflow-status.yaml`:

```yaml
project: mi-aplicacion
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Standard track - analisis no requerido"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      personas:
        status: complete
        path: project-management/personas.md
        count: 3
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    started_at: 2026-01-07T12:00:00Z
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      architecture:
        status: complete
        path: project-management/architecture/
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
      adrs:
        status: complete
        count: 3
        path: docs/adr/
      security:
        status: pending
  implementation:
    status: pending
    sprints:
      - name: sprint-001-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Completar diseno de API"
next_command: "/workflow:design --continue"
```

## Comandos relacionados

- `/workflow:init` - Inicializar nuevo flujo de trabajo
- `/workflow:analyze` - Fase de analisis
- `/workflow:plan` - Fase de planificacion
- `/workflow:design` - Fase de diseno
- `/workflow:implement` - Fase de implementacion
