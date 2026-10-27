---
name: workflow-design
description: "Ejecutar la fase de Diseño (Solutioning) - generar la especificación técnica (por defecto) o la constitución del proyecto (--constitution)"
argument-hint: "[--constitution] [--continue]"
arguments:
  - name: constitution
    description: Generar la constitución del proyecto (project-management/constitution.md) en lugar de la especificación técnica
    required: false
  - name: continue
    description: Continuar donde se quedó
    required: false
---

# /workflow:design

## Misión

Ejecutar la fase de Diseño (Solutioning): convertir el PRD en una Especificación Técnica, diagramas de arquitectura, modelo de datos, diseño de API y ADR. Con `--constitution`, registrar en su lugar las decisiones inmutables del proyecto en una Constitución del proyecto.

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/workflow:design` | Lee `project-management/prd.md`, escribe `project-management/tech-spec.md` + archivos de arquitectura + ADR | `/workflow:design` |
| `/workflow:design --constitution` | Escribe `project-management/constitution.md` (decisiones inmutables, usada por `/gate:check alignment`) | `/workflow:design --constitution` |
| `/workflow:design --continue` | Reanuda una sesión de diseño interrumpida | - |

Orden canónico de los documentos: PRD → spec técnica → backlog → sprint.

## Cuándo usarlo

- Tracks **Standard** y **Enterprise**
- Después de `/workflow:plan --only=prd`
- `--constitution`: al inicio del proyecto (o cuando haya que fijar decisiones)

## Requisitos previos

- El PRD existe en `project-management/prd.md` (`--constitution`: solo fuentes opcionales, ver más abajo)
- Stack tecnológico identificado (se pregunta de forma interactiva en proyectos nuevos)

## Plan Mode

> **El plan mode es obligatorio.** Claude activa el plan mode para analizar el código afectado, proponer una estrategia de generación y esperar su validación antes de crear artefactos.

## Workflow: Spec técnica (por defecto)

### Paso 1: Análisis del PRD

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE DISEÑO - INICIO                        ║
║ Track: Standard | Fase: 3 de 4 - Design (Solutioning)     ║
║ Cargando project-management/prd.md ...                    ║
║ ├── Requisitos funcionales: 12                            ║
║ ├── Requisitos no funcionales: 8                          ║
║ └── Integraciones requeridas: 2                           ║
╚══════════════════════════════════════════════════════════╝
```

Extraer del PRD: requisitos funcionales (`FR-xxx`), requisitos no funcionales (rendimiento, seguridad, escalabilidad), personas y recorridos, restricciones y supuestos, integraciones. Si existe `project-management/analysis/constraints.md` (Enterprise), cargarlo también.

### Paso 2: Análisis del código base

Código base existente: detectar el stack (backend, frontend, base de datos, caché, infraestructura) y los patrones existentes (arquitectura, estilo de API, auth, tests) y mantener la coherencia con ellos.

Proyecto nuevo: hacer las preguntas tecnológicas.

```
┌─────────────────────────────────────────────────────────┐
│ PREGUNTAS - Stack tecnológico                            │
├─────────────────────────────────────────────────────────┤
│ 1. ¿Framework backend preferido? (Symfony/Laravel/Node)  │
│ 2. ¿Framework frontend? (React/Vue/Angular/Ninguno)      │
│ 3. ¿Base de datos preferida? (PostgreSQL/MySQL/MongoDB)  │
│ 4. ¿Destino de despliegue? (Docker/K8s/Serverless/VPS)   │
│ 5. ¿Integraciones existentes a considerar?               │
└─────────────────────────────────────────────────────────┘
```

### Paso 3: Preguntas de arquitectura

```
┌─────────────────────────────────────────────────────────┐
│ PREGUNTAS - Decisiones de arquitectura                   │
├─────────────────────────────────────────────────────────┤
│ 1. ¿Monolito o microservicios?                           │
│ 2. ¿Estilo de API preferido? (REST/GraphQL/gRPC)         │
│ 3. ¿Escala esperada? (usuarios, peticiones/s)            │
│ 4. ¿Funcionalidades en tiempo real? (WebSockets/SSE)     │
│ 5. ¿Necesidades de almacenamiento? (S3/local/CDN)        │
│ 6. ¿Necesidades de jobs en segundo plano?                │
│ 7. ¿Integraciones de terceros? (pagos, email, etc.)      │
└─────────────────────────────────────────────────────────┘
```

### Paso 4: Tareas de diseño

Ejecutar en orden:

| # | Tarea | Salida |
|---|-------|--------|
| 1 | Spec técnica (plantilla `.claude/templates/project/tech-spec.md`) | `project-management/tech-spec.md` |
| 2 | Diagramas C4 (contexto, contenedor, componente) | `project-management/architecture/c4-*.md` |
| 3 | Modelo de datos: ERD (Mermaid `erDiagram`) + esquemas; validar relaciones, entidades que faltan, indexación | `project-management/architecture/erd.md` |
| 4 | Diseño de API: endpoints derivados de los FR-xxx y las personas, payloads, errores, auth | `project-management/architecture/api.md` |
| 5 | Seguridad y rendimiento: mitigaciones OWASP, authN/authZ, cifrado, rate limiting, brechas RGPD | `project-management/architecture/security.md` |
| 6 | ADR para las decisiones clave (base de datos, estilo de API, autenticación) | `docs/adr/ADR-00x-*.md` |
| 7 | Estrategia de tests (objetivo de cobertura 80 %), CI/CD y despliegue, monitorización | en `tech-spec.md` |

Ejemplo de checklist de seguridad:

```
✅ Autenticación: JWT con cookies HttpOnly
✅ Autorización: RBAC con policies
✅ Cifrado de datos: AES-256 en reposo, TLS 1.3 en tránsito
✅ Validación de entradas: validación DTO + sanitización
✅ Rate limiting: 100 req/min por usuario
⚠️  Cumplimiento RGPD: falta una política de retención de datos
```

### Paso 5: Gate de revisión del diseño

- La spec técnica cubre todos los requisitos del PRD (cada `FR-xxx` es trazable)
- La arquitectura soporta los NFR (rendimiento, seguridad)
- El modelo de datos gestiona todas las entidades; el diseño de API cubre todas las user stories
- Seguridad, estrategia de tests y enfoque de despliegue documentados
- ADR completos y justificados

Ofrecer iteraciones: estrategia de caché, documentación de API ampliada, pipeline de despliegue.

### Paso 6: Finalización

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE DISEÑO COMPLETADA                      ║
║ ✅ project-management/tech-spec.md                        ║
║ ✅ project-management/architecture/ (c4, erd, api, sec.)  ║
║ ✅ docs/adr/ (3 ADR)                                      ║
║ • 24 endpoints de API • 8 entidades • 3 integraciones     ║
║                                                           ║
║ SIGUIENTE: /workflow:plan --only=backlog                  ║
║ LUEGO: /workflow:start 1                                  ║
╚══════════════════════════════════════════════════════════╝
```

El backlog lee `project-management/prd.md` y, una vez creada, `project-management/tech-spec.md`. Tras el diseño, recomendar `/workflow:plan --only=backlog` y después `/workflow:start 1`.

## Workflow: Constitución (`--constitution`)

### Fase 1: Descubrimiento del contexto

Análisis automático de: `README.md`, `project-management/prd.md`, `project-management/tech-spec.md`, estructura del código base (patrones, convenciones) y configuración `.claude/`. Listar las fuentes encontradas.

### Fase 2: Aclaración interactiva

Preguntar al usuario, por tema, para cubrir las lagunas:

| Tema | Preguntas |
|------|-----------|
| Visión y Misión | Visión en una frase; qué, para quién, por qué; objetivos no negociables; qué haría fracasar el proyecto |
| Restricciones técnicas | Tecnologías bloqueadas; patrón de arquitectura obligatorio; restricciones de infraestructura; integraciones de terceros obligatorias |
| Principios de diseño | Patrones obligatorios; patrones/prácticas prohibidos; estándares de código; estrategia de tests requerida |
| Requisitos no funcionales | Objetivos de rendimiento (latencia, carga); seguridad; cumplimiento (RGPD, SOC2); disponibilidad/uptime |
| Límites | Fuera de alcance; sistemas externos; límites de equipo y responsabilidades; quién puede enmendar la constitución |

### Fase 3: Generación

1. Cargar la plantilla `.claude/templates/project/constitution.md`
2. Completar visión, misión y objetivos no negociables
3. Bloquear el stack técnico (tecnologías y versiones)
4. Registrar los patrones obligatorios y prohibidos
5. Anotar los objetivos de rendimiento, seguridad y cumplimiento
6. Documentar exclusiones, límites de integración y el proceso de enmienda

### Fase 4: Revisión y ratificación

Salida: `project-management/constitution.md` con las secciones Visión y Misión, Restricciones técnicas, Principios de diseño, Requisitos no funcionales, Límites, Proceso de enmienda. Ofrecer ajustar las decisiones bloqueadas, añadir restricciones o afinar los límites. Las notas de descubrimiento opcionales van a `project-management/analysis/discovery-notes.md`.

La constitución es la referencia que usa `/gate:check alignment`. Siguientes pasos: `/workflow:plan --only=prd` si aún no hay PRD; si no, ejecutar el `/workflow:design` por defecto.

## Agentes implicados

- **tech-lead**: diseño técnico global y creación de ADR
- **api-designer**: diseño de API REST/GraphQL
- **database-architect**: modelo de datos y diseño del esquema
- **ui-designer**: arquitectura frontend (si aplica)
- **devops-engineer**: diseño del despliegue y la infraestructura

## Archivos de salida

| Archivo | Propósito |
|---------|-----------|
| `project-management/tech-spec.md` | Especificación técnica completa |
| `project-management/constitution.md` | Constitución del proyecto (`--constitution`) |
| `project-management/architecture/c4-*.md` | Diagramas de arquitectura C4 |
| `project-management/architecture/erd.md` | Diagrama entidad-relación |
| `project-management/architecture/api.md` | Documentación de los endpoints de API |
| `project-management/architecture/security.md` | Diseño de seguridad |
| `docs/adr/*.md` | Architecture Decision Records |

## Ejemplo de sesión

```
User: /workflow:design

Claude: Cargando project-management/prd.md: 12 FR, 8 NFR.
Detectado: Symfony + React + PostgreSQL.
❓ La API actual es REST. ¿Mantener REST o migrar a GraphQL?
> Mantener REST
[... Q&A interactivo ...]
✅ Spec técnica generada: project-management/tech-spec.md
Siguiente: /workflow:plan --only=backlog, luego /workflow:start 1
```

## Comandos relacionados

- `/workflow:plan` - Fase anterior (`--only=prd`, `--only=backlog`)
- `/workflow:start` - Iniciar el primer sprint
- `/workflow:implement` - Fase de implementación
- `/workflow:status` - Comprobar el progreso
- `/gate:check` - Quality gates (`alignment` usa la constitución)
- `/common:architecture-decision` - Crear ADR individuales
