---
name: workflow-design
description: Ejecutar la fase de Diseno (Solucion) - especificacion tecnica y arquitectura
arguments:
  - name: continue
    description: Continuar desde donde se dejo
    required: false
---

# /workflow:design

## Mision

Ejecutar la fase de Diseno (Solucion) del flujo de trabajo de desarrollo. Esta fase se centra en crear la Especificacion Tecnica, disenar la arquitectura y documentar las decisiones tecnicas clave.

## Cuando usar

- Flujos **Standard** y **Enterprise**
- Despues de completar `/workflow:plan`
- Cuando el PRD y el backlog estan listos

## Prerequisitos

- El PRD existe en `project-management/prd.md`
- El backlog existe en `project-management/backlog/`

## Flujo de trabajo

### Paso 1: Configuracion del diseno

```
╔══════════════════════════════════════════════════════════╗
║              FASE DE DISENO - INICIANDO                    ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Fase: 3 de 4 - Diseno (Solucion)                          ║
║                                                           ║
║ Objetivos:                                                ║
║ • Crear Especificacion Tecnica desde el PRD               ║
║ • Disenar arquitectura del sistema (diagramas C4)         ║
║ • Definir modelo de datos y diseno de API                 ║
║ • Documentar Architecture Decision Records (ADRs)         ║
║ • Planificar estrategia de testing                        ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 2: Cargar artefactos de planificacion

```
╔══════════════════════════════════════════════════════════╗
║              CARGANDO ARTEFACTOS DE PLANIFICACION         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Analisis del PRD:                                         ║
║ ├── ✅ prd.md cargado                                     ║
║ ├── Requisitos funcionales: 12                            ║
║ ├── Requisitos no funcionales: 8                          ║
║ └── Integraciones requeridas: 2                           ║
║                                                           ║
║ Resumen del backlog:                                      ║
║ ├── ✅ backlog/ cargado                                   ║
║ ├── EPICs: 4                                              ║
║ ├── User Stories: 18                                      ║
║ └── Story Points totales: 89                              ║
║                                                           ║
║ Restricciones (si Enterprise):                            ║
║ └── ✅ analysis/constraints.md disponible                 ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 3: Tareas de diseno

Ejecutar las tareas de diseno en orden:

```
╔══════════════════════════════════════════════════════════╗
║                 TAREAS DE DISENO                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Tarea 1: Generar Tech Spec                              ║
║   Comando: /project:generate-tech-spec                    ║
║   Salida: project-management/tech-spec.md                 ║
║                                                           ║
║ □ Tarea 2: Diseno de arquitectura                         ║
║   Crear diagramas C4 (contexto, contenedor, componente)   ║
║   Salida: project-management/architecture/                ║
║                                                           ║
║ □ Tarea 3: Diseno del modelo de datos                     ║
║   ERD y esquema de base de datos                          ║
║   Salida: project-management/architecture/erd.md          ║
║                                                           ║
║ □ Tarea 4: Diseno de API                                  ║
║   Endpoints, payloads, autenticacion                      ║
║   Salida: project-management/architecture/api.md          ║
║                                                           ║
║ □ Tarea 5: Crear ADRs                                     ║
║   Documentar decisiones tecnicas clave                    ║
║   Salida: docs/adr/                                       ║
║                                                           ║
║ □ Tarea 6: Revision de seguridad                          ║
║   Checklist OWASP, estrategia de autenticacion            ║
║   Salida: project-management/architecture/security.md     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 4: Ejecutar generacion del Tech Spec

```
Iniciando /project:generate-tech-spec...

Analizando requisitos del PRD...
Detectando patrones existentes en el codebase...

[Flujo de generacion del Tech Spec con Q&A interactivo]

✅ Tech Spec creado: project-management/tech-spec.md
```

### Paso 5: Diagramas de arquitectura

Generar diagramas de arquitectura C4:

```
╔══════════════════════════════════════════════════════════╗
║             DIAGRAMAS DE ARQUITECTURA                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ C4 Nivel 1 - Contexto del sistema:                        ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [Usuario] ─────► [Nuestro Sistema] ─────► [Stripe] │  ║
║ │                         │                           │  ║
║ │                         ▼                           │  ║
║ │                    [SendGrid]                       │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ C4 Nivel 2 - Contenedor:                                  ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [React SPA] ──► [Symfony API] ──► [PostgreSQL]    │  ║
║ │                       │                             │  ║
║ │                       ▼                             │  ║
║ │                    [Redis]                          │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Archivos creados:                                         ║
║ ├── architecture/c4-context.md                            ║
║ ├── architecture/c4-container.md                          ║
║ └── architecture/c4-component.md                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 6: Creacion de ADRs

Documentar decisiones clave de arquitectura:

```
╔══════════════════════════════════════════════════════════╗
║        ARCHITECTURE DECISION RECORDS (ADRs)               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ ADRs creados:                                             ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-001: Eleccion de base de datos                  │  ║
║ │ Decision: PostgreSQL                                 │  ║
║ │ Justificacion: Cumplimiento ACID, soporte JSON,      │  ║
║ │ existente                                            │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-002: Estilo de API                              │  ║
║ │ Decision: REST con JSON:API                          │  ║
║ │ Justificacion: Experiencia del equipo, cache,        │  ║
║ │ simplicidad                                          │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-003: Autenticacion                              │  ║
║ │ Decision: JWT con refresh tokens                     │  ║
║ │ Justificacion: Sin estado, compatible con movil,     │  ║
║ │ estandar                                             │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Archivos: docs/adr/ADR-001.md, ADR-002.md, ADR-003.md    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 7: Gate de revision de diseno

```
╔══════════════════════════════════════════════════════════╗
║              GATE DE REVISION DE DISENO                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checklist:                                                ║
║ ✅ Tech Spec cubre todos los requisitos del PRD           ║
║ ✅ Arquitectura soporta NFRs (rendimiento, seguridad)     ║
║ ✅ Modelo de datos maneja todas las entidades              ║
║ ✅ Diseno de API cubre todas las user stories              ║
║ ✅ Consideraciones de seguridad documentadas               ║
║ ✅ Estrategia de testing definida                          ║
║ ✅ Enfoque de despliegue documentado                       ║
║                                                           ║
║ Preguntas de revision:                                    ║
║ 1. Es la arquitectura apropiada para la escala?           ║
║ 2. Faltan integraciones?                                  ║
║ 3. Es suficiente el enfoque de seguridad?                 ║
║ 4. Estan los ADRs completos y justificados?               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 8: Finalizacion de la fase

```
╔══════════════════════════════════════════════════════════╗
║              FASE DE DISENO COMPLETADA                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefactos creados:                                       ║
║ ✅ tech-spec.md            Especificacion Tecnica         ║
║ ✅ architecture/                                          ║
║    ├── c4-context.md       Diagrama de contexto           ║
║    ├── c4-container.md     Diagrama de contenedores       ║
║    ├── c4-component.md     Diagrama de componentes        ║
║    ├── erd.md              Diagrama Entidad-Relacion      ║
║    ├── api.md              Diseno de API                  ║
║    └── security.md         Consideraciones de seguridad   ║
║ ✅ docs/adr/               3 Architecture Decision Records║
║                                                           ║
║ Resumen:                                                  ║
║ • 24 endpoints de API disenados                           ║
║ • 8 entidades de base de datos definidas                  ║
║ • 3 integraciones externas especificadas                  ║
║ • Objetivo de cobertura de tests del 80%                  ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ SIGUIENTE FASE: Implementacion                            ║
║ Comando: /workflow:implement                              ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Listo para comenzar el desarrollo del Sprint 1!           ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes involucrados

- **tech-lead**: Diseno tecnico general y creacion de ADRs
- **api-designer**: Diseno de API REST/GraphQL
- **database-architect**: Modelo de datos y diseno de esquema
- **ui-designer**: Arquitectura frontend (si aplica)
- **devops-engineer**: Diseno de despliegue e infraestructura

## Archivos de salida

| Archivo | Proposito |
|---------|-----------|
| `tech-spec.md` | Especificacion Tecnica completa |
| `architecture/c4-*.md` | Diagramas de arquitectura C4 |
| `architecture/erd.md` | Diagrama Entidad-Relacion |
| `architecture/api.md` | Documentacion de endpoints API |
| `architecture/security.md` | Diseno de seguridad |
| `docs/adr/*.md` | Architecture Decision Records |

## Comandos relacionados

- `/workflow:plan` - Fase anterior
- `/workflow:implement` - Siguiente fase
- `/workflow:status` - Verificar progreso
- `/project:generate-tech-spec` - Generacion directa del tech spec
- `/common:architecture-decision` - Crear ADRs individuales
