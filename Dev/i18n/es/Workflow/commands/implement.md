---
name: workflow-implement
description: Ejecutar la fase de Implementacion - desarrollo de sprint con TDD/BDD
arguments:
  - name: sprint
    description: Numero de sprint especifico a trabajar
    required: false
---

# /workflow:implement

## Mision

Ejecutar la fase de Implementacion del flujo de trabajo de desarrollo. Esta fase se centra en el desarrollo sprint a sprint usando practicas TDD/BDD, siguiendo el diseno tecnico establecido en fases anteriores.

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## Cuando usar

- Despues de completar `/workflow:design` (flujos Standard/Enterprise)
- Despues de `/workflow:init` para el flujo Quick Flow
- Cuando se esta listo para comenzar a programar

## Prerequisitos

Para flujos Standard/Enterprise:
- El Tech Spec existe en `project-management/tech-spec.md`
- El backlog existe en `project-management/backlog/`
- La estructura de sprints definida en `project-management/sprints/`

Para Quick Flow:
- Comprension clara del bug/funcionalidad a implementar

## Flujo de trabajo

### Paso 1: Configuracion de la implementacion

```
╔══════════════════════════════════════════════════════════╗
║           FASE DE IMPLEMENTACION - INICIANDO               ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Fase: 4 de 4 - Implementacion                             ║
║                                                           ║
║ Objetivos:                                                ║
║ • Ejecutar desarrollo de sprint con TDD/BDD               ║
║ • Implementar user stories siguiendo el tech spec         ║
║ • Mantener calidad de codigo y cobertura de tests         ║
║ • Completar Definition of Done para cada story            ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 2: Seleccion de sprint

```
╔══════════════════════════════════════════════════════════╗
║               RESUMEN DE SPRINTS                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprints disponibles:                                      ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 1: Walking Skeleton                           │  ║
║ │ Estado: Listo para iniciar                           │  ║
║ │ Stories: 5 | Puntos: 21                              │  ║
║ │ Enfoque: Infraestructura + primera feature E2E       │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 2: Funcionalidades principales                │  ║
║ │ Estado: Planificado                                  │  ║
║ │ Stories: 6 | Puntos: 28                              │  ║
║ │ Enfoque: Gestion de usuarios, autenticacion          │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 3: Integracion de pagos                       │  ║
║ │ Estado: Planificado                                  │  ║
║ │ Stories: 4 | Puntos: 24                              │  ║
║ │ Enfoque: Integracion Stripe, flujo de checkout       │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Seleccionar sprint a trabajar (por defecto: Sprint 1)     ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 3: Redirigir al desarrollo de sprint

Para ejecucion completa del sprint, este comando redirige al comando especializado sprint-dev:

```
╔══════════════════════════════════════════════════════════╗
║           INICIANDO DESARROLLO DE SPRINT                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Invocando: /sprint:dev sprint-001-walking-skeleton║
║                                                           ║
║ Funcionalidades del modo Sprint Development:              ║
║ • Modo plan obligatorio antes de cada tarea               ║
║ • Ciclo TDD: RED → GREEN → REFACTOR                       ║
║ • Actualizaciones de estado automaticas                   ║
║ • Conventional commits con referencias a stories          ║
║ • Validacion de Definition of Done                        ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 4: Guia de implementacion

Proporcionar contexto de la fase de diseno:

```
╔══════════════════════════════════════════════════════════╗
║           CONTEXTO DE IMPLEMENTACION                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Del Tech Spec:                                            ║
║ ├── Arquitectura: Clean Architecture (Hexagonal)          ║
║ ├── Estilo API: REST con JSON:API                         ║
║ ├── Auth: JWT con refresh tokens                          ║
║ ├── Base de datos: PostgreSQL con Doctrine ORM            ║
║ └── Testing: PHPUnit + Jest + Playwright                  ║
║                                                           ║
║ ADRs relevantes:                                          ║
║ ├── ADR-001: Eleccion de BD (PostgreSQL)                  ║
║ ├── ADR-002: Estilo de API (REST)                         ║
║ └── ADR-003: Autenticacion (JWT)                          ║
║                                                           ║
║ Estandares de codigo:                                     ║
║ ├── Seguir patrones existentes en el codebase             ║
║ ├── Objetivo de cobertura: 80%                            ║
║ └── Usar reglas especificas por tecnologia:               ║
║     /symfony:*, /react:*, etc.                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 5: Modo Quick Flow

Para flujo Quick Flow (correcciones de bugs, funcionalidades menores):

```
╔══════════════════════════════════════════════════════════╗
║           QUICK FLOW - IMPLEMENTACION DIRECTA             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ No se necesita estructura de sprint para Quick Flow.      ║
║                                                           ║
║ Comandos disponibles:                                     ║
║                                                           ║
║ Para correcciones de bugs:                                ║
║ • /qa:tdd        - Corregir con enfoque TDD   ║
║                                                           ║
║ Para funcionalidades menores:                             ║
║ • /{tech}:* commands         - Especificos por tecnologia  ║
║                                                           ║
║ Seguimiento:                                              ║
║ • /project:add-task          - Registrar como tarea        ║
║ • /project:move-task done    - Marcar como completada      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 6: Finalizacion del sprint

Despues de completar el sprint:

```
╔══════════════════════════════════════════════════════════╗
║           SPRINT COMPLETADO                               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprint 1: Walking Skeleton                                ║
║ Estado: ✅ Completado                                     ║
║                                                           ║
║ Metricas:                                                 ║
║ ├── Stories completadas: 5/5                              ║
║ ├── Puntos entregados: 21                                 ║
║ ├── Velocidad: 21 pts/sprint                              ║
║ ├── Cobertura de tests: 82%                               ║
║ └── Commits: 23                                           ║
║                                                           ║
║ Artefactos:                                               ║
║ ├── sprint-review.md generado                             ║
║ └── sprint-retro.md plantilla lista                       ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ SIGUIENTES ACCIONES:                                      ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ 1. /workflow:review     - Realizar revision de sprint║
║ 2. /workflow:retro      - Ejecutar retrospectiva     ║
║ 3. /workflow:implement 2     - Iniciar Sprint 2           ║
║                                                           ║
║ O verificar progreso general: /workflow:status            ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 7: Finalizacion del flujo de trabajo

Cuando todos los sprints estan completados:

```
╔══════════════════════════════════════════════════════════╗
║           FASE DE IMPLEMENTACION COMPLETADA               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Todos los sprints planificados completados!               ║
║                                                           ║
║ Resumen del proyecto:                                     ║
║ ├── Total sprints: 4                                      ║
║ ├── Total stories: 18                                     ║
║ ├── Total puntos: 89                                      ║
║ ├── Velocidad promedio: 22 pts/sprint                     ║
║ ├── Cobertura de tests: 84%                               ║
║ └── Total commits: 87                                     ║
║                                                           ║
║ Proximos pasos:                                           ║
║ • /common:release-checklist  - Preparar para release      ║
║ • /common:generate-changelog - Generar notas de version   ║
║ • Desplegar en staging/produccion                         ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║           FLUJO DE TRABAJO DEL PROYECTO COMPLETADO!       ║
║ ═══════════════════════════════════════════════════════  ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes involucrados

- **tech-lead**: Descomposicion de tareas, guia de arquitectura
- **tdd-coach**: Guia de metodologia TDD/BDD
- **{tech}-reviewer**: Revision de codigo (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD y despliegue

## Comandos relacionados

- `/workflow:design` - Fase anterior
- `/workflow:status` - Verificar progreso
- `/sprint:dev` - Modo completo de desarrollo de sprint
- `/qa:tdd` - Correcciones rapidas de bugs
- `/workflow:review` - Ceremonia de revision de sprint
- `/workflow:retro` - Retrospectiva del sprint
