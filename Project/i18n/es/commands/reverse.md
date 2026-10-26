---
description: "Pipeline de ingeniería inversa brownfield: escanear el código y derivar un PRD borrador, historias de usuario y un análisis de brechas spec vs código"
argument-hint: "[scan|prd|stories|gaps|all] [--scope=<scope>] [--module=<name>] [--output=<path>]"
---

# /project:reverse

## Misión

Reconstruir especificaciones a partir de un código existente (proyectos brownfield). Un único comando cubre todo el pipeline: inventariar el código (`scan`), inferir un PRD borrador (`prd`), inferir historias de usuario (`stories`) y comparar las especificaciones con el código (`gaps`). `all` ejecuta los cuatro en orden.

## Uso

| Comando | Qué hace | Reemplaza |
|---------|----------|-----------|
| `/project:reverse scan` | Inventario de módulos, endpoints, modelos, servicios, tests, infraestructura | `/project:reverse scan` |
| `/project:reverse prd` | PRD BORRADOR inferido del código | `/project:reverse prd` |
| `/project:reverse stories` | Historias de usuario BORRADOR inferidas del código y los tests | `/project:reverse stories` |
| `/project:reverse gaps` | Análisis de brechas spec vs código, clasificado por severidad | `/project:reverse gaps` |
| `/project:reverse all` | `scan` -> `prd` -> `stories` -> `gaps`, en este orden | los cuatro |

## Argumentos

Analizar `$ARGUMENTS`: primer token = subcomando (`scan`, `prd`, `stories`, `gaps`, `all`). Sin subcomando, preguntar cuál (recomendar `all` en la primera ejecución). Flags:

| Flag | Se aplica a | Descripción |
|------|------------|-------------|
| `--scope=<scope>` | `scan`: all, backend, frontend, api, tests / `stories`: all, module, endpoint / `gaps`: full, requirements, stories, code | Limita el análisis |
| `--module=<name>` | `stories` | Genera las historias de un solo módulo |
| `--output=<path>` | `scan`, `prd` | Ruta de salida (valores por defecto más abajo) |

## Reglas comunes

**El modo plan es obligatorio.** Antes de ejecutar, activar el modo plan, proponer el plan y esperar la validación antes de modificar cualquier archivo. Con `all`, un único plan cubre los cuatro pasos.

**Reglas de inferencia de personas (usadas por `prd` y `stories`):**

| Patrón de autenticación | Persona inferida |
|-------------------------|------------------|
| `ROLE_ADMIN` + rutas de administración | Administrador |
| `ROLE_USER` + rutas autenticadas | Usuario registrado |
| `ROLE_MANAGER` + rutas de gestión | Gerente / supervisor |
| Endpoints públicos (sin auth) | Visitante / anónimo |
| Autenticación por clave de API | Sistema externo |

**Todo lo inferido es un BORRADOR.** El código muestra lo que el sistema hace, no lo que debería hacer. Marcar cada artefacto inferido como `INFERRED` y exigir validación humana antes de tratarlo como autoritativo. Marcador a insertar en cada sección o historia inferida:

```
> INFERRED -- Generado analizando el código existente.
> Se requiere validación humana antes de tratarlo como autoritativo.
```

**Regla de estado:** `.bmad/sprint-status.yaml` es la única fuente de verdad del ESTADO de historias/tareas. Las historias generadas contienen solo contenido (sin campo de estado); registrarlas en `.bmad/sprint-status.yaml` (esquema: `.claude/templates/project/sprint-status.md`) una vez validadas.

**Rutas por defecto:**

```
project-management/
+-- scan-report.md                  # scan
+-- prd.md                          # prd (BORRADOR)
+-- backlog/user-stories/US-*.md    # stories
+-- analysis/
    +-- reverse-engineering.md      # prd: notas de análisis y niveles de confianza
    +-- gap-analysis.md             # gaps
```

**Requisitos previos:** código fuente accesible; `README.md`, `docker-compose.yml`, `./docs/` opcionales. `prd`, `stories` y `gaps` necesitan `project-management/scan-report.md` -- si falta, ejecutar `scan` primero (automático con `all`). `gaps` también necesita un PRD (`project-management/prd.md`, de `/workflow:plan --only=prd` o de `prd`); `stories` y `gaps` lo usan para la trazabilidad FR-xxx cuando existe.

**Convención de salida:** cada paso muestra un banner de progreso enmarcado, termina con un breve resumen y propone los siguientes pasos (validar de forma interactiva, ejecutar el siguiente subcomando). Con `all`, hacer una pausa de validación humana tras `prd` y `stories` antes de continuar con `gaps`.

## scan

Punto de entrada del pipeline: un inventario estructurado del código.

**1. Detección del stack.** Examinar la raíz en busca de marcadores de framework, leer el manifiesto (`composer.json`, `package.json`, `pubspec.yaml`, `*.csproj`, `pyproject.toml`), identificar la versión del framework y las dependencias clave, detectar la infraestructura (Docker, CI/CD, Redis, colas) y elegir el agente reviewer adecuado (`@symfony-reviewer`, `@react-reviewer`...).

| Patrón de archivo | Stack |
|-------------------|-------|
| `*.php` + `symfony.lock` | Symfony |
| `*.php` + `artisan` | Laravel |
| `*.php` + `composer.json` | PHP (genérico) |
| `*.dart` + `pubspec.yaml` | Flutter |
| `*.tsx` / `*.jsx` + `next.config.*` | React (Next.js) |
| `*.tsx` / `*.jsx` + `package.json` | React |
| `*.vue` + `package.json` | Vue.js |
| `angular.json` | Angular |
| `*.cs` + `*.csproj` | .NET / C# |
| `*.py` + `pyproject.toml` | Python |
| `Dockerfile` / `docker-compose.yml` | Docker (infra) |

**2. Escaneo de la estructura.** Clasificar los archivos en:
1. Módulos / dominios (bounded contexts, módulos compartidos, namespaces)
2. Endpoints (rutas, controladores, métodos HTTP, rutas de acceso, middlewares/guards)
3. Modelos / entidades (campos, tipos, relaciones, migraciones)
4. Servicios (servicios, casos de uso, handlers de comandos/consultas, listeners, subscribers)
5. Tests (unitarios / integración / E2E, correspondencia test-fuente, frameworks)
6. Infraestructura (Docker, CI/CD, configuración de entorno, integraciones de terceros)

**3. Análisis del código.** Estimar las LOC por módulo; identificar el patrón de arquitectura (MVC, Clean Architecture, DDD...); detectar las herramientas de calidad (linting, análisis estático); mapear el grafo de dependencias entre módulos; señalar marcadores de deuda técnica; usar el reviewer específico del stack para obtener información especializada.

**4. Informe** en `project-management/scan-report.md`, con las secciones: cabecera (proyecto, stack, tamaño, módulos), Technology Stack, Modules / Bounded Contexts (archivos, LOC, tests, cobertura), Endpoints (método, ruta, controlador, auth), Models / Entities (campos, relaciones, migraciones), Services (dependencias, tipo), Tests (tipo, cantidad, framework), Infrastructure (componente, archivo de config, notas) y un Complexity Summary.

```
| Module   | Files | LOC   | Tests | Coverage |
| User     | 24    | 1,800 | 12    | ~65%     |
| Method | Path        | Controller     | Auth |
| GET    | /api/users  | UserController | JWT  |
```

Métricas del Complexity Summary: LOC total, total de archivos, bounded contexts, endpoints de API, entidades de base de datos, archivos de test, cobertura de tests estimada, patrón de arquitectura.

## prd

Contraparte brownfield de `/workflow:plan --only=prd`: un PRD BORRADOR inferido del código.

**1. Cargar** el informe de escaneo (y `./docs/`, `README.md`); analizar stack, módulos, endpoints, entidades, servicios.

**2. Análisis de la lógica de negocio**, para cada módulo: eventos de dominio (payloads, listeners, workflows), casos de uso / comandos / consultas, reglas de validación (entidad, petición, aserciones de negocio), máquinas de estados (enums de estado, configuración de workflow, guards), integraciones externas (pagos, correo, almacenamiento, API de terceros).

**3. Inferencia de requisitos.**

| Patrón de código | Requisito inferido |
|------------------|--------------------|
| Middleware de auth / JWT | Autenticación de usuario requerida |
| Guards por rol | Autorización con roles |
| Controladores CRUD | Funcionalidades de gestión de datos |
| Handlers de subida de archivos | Gestión de documentos/medios |
| Servicios de correo | Sistema de notificaciones |
| Pasarela de pago | Procesamiento de pagos |
| Endpoints de exportación | Funcionalidades de reporting/exportación |
| Lógica de búsqueda/filtro | Búsqueda y filtrado |
| Paginación | Manejo de grandes volúmenes de datos |
| Capas de caché | Requisitos de rendimiento |
| Workers de colas | Requisitos de procesamiento asíncrono |
| Rate limiting | Requisitos de protección de la API |

| Infraestructura | NFR inferido |
|-----------------|--------------|
| Docker / Kubernetes | Escalabilidad, contenerización |
| Redis / Memcached | Caché de rendimiento |
| Sistema de colas (RabbitMQ...) | Procesamiento asíncrono, fiabilidad |
| Pipelines CI/CD | Automatización del despliegue |
| Config de balanceador de carga | Alta disponibilidad |
| Configuración SSL/TLS | Seguridad |
| Stack de logs (ELK...) | Monitorización |

Las personas provienen de la tabla común anterior.

**4. Generar** `project-management/prd.md` con ocho secciones: Executive Summary (INFERRED), Problem Statement (INFERRED), Goals & Metrics (**PLACEHOLDER** -- no se puede inferir, requiere aportación humana), Target Users / Personas (INFERRED, cada una en borrador), Functional Requirements (INFERRED, uno por grupo de funcionalidades/endpoints, priorizado por complejidad y uso, etiquetado con el módulo de origen), Non-Functional Requirements (INFERRED), Scope & Constraints (INFERRED), Risks & Mitigations (INFERRED: deuda, zonas sin tests, riesgos de dependencias). Escribir las notas de análisis y la confianza por sección (HIGH / MEDIUM / LOW) en `project-management/analysis/reverse-engineering.md`; la cabecera del PRD muestra `Status: DRAFT - Requires human validation` y la tabla de confianza.

**5. Validación humana.** Mostrar un resumen de las secciones inferidas, destacar las de baja confianza y las que no pudieron inferirse (Goals, Metrics), pedir al usuario que valide / corrija / amplíe cada una, e iterar hasta que quede satisfecho.

## stories

Historias de usuario BORRADOR inferidas de endpoints, servicios, entidades y tests.

**1. Cargar** el informe de escaneo y el PRD si existe (para la trazabilidad FR-xxx); determinar el alcance (all, un `--module`, un endpoint).

**2. Extracción de funcionalidades**, por endpoint/funcionalidad: controlador/handler (método, ruta, validación de la petición, respuesta y códigos de estado, autorización), servicio/caso de uso (flujo de negocio, efectos secundarios, llamadas externas, rutas de error), entidad/modelo (campos y restricciones, relaciones, transiciones de estado, soft delete/timestamps), tests (nombres de métodos, aserciones, fixtures, casos límite).

**3. Generación de historias.**

| Ruta | Acción inferida |
|------|-----------------|
| `POST /api/resources` | crear un recurso |
| `GET /api/resources` | listar recursos |
| `GET /api/resources/{id}` | consultar un recurso |
| `PUT /api/resources/{id}` | actualizar un recurso |
| `DELETE /api/resources/{id}` | eliminar un recurso |
| acción personalizada | según el nombre del método y la lógica de negocio |

Inferencia del beneficio: CRUD -> «para poder gestionar los datos de {resource}»; búsqueda/filtro -> «encontrar rápidamente los {resources} relevantes»; exportación -> «usar los datos de {resource} externamente»; notificaciones -> «estar informado de {event}»; auth -> «que mis datos estén seguros y solo yo pueda acceder a ellos». Los criterios de aceptación provienen de los tests: fixtures -> Given, acciones -> When, resultados esperados -> Then.

```markdown
# US-XXX: [Título inferido]

> INFERRED -- generada analizando el código. Se requiere validación humana.

## Source
- Módulo / Endpoint ({method} {path}) / Controlador / Implements: FR-XXX (si hay PRD)

## User Story
As [persona inferida] I want [acción inferida] So that [beneficio inferido]
Conversation: [ ] persona  [ ] la acción coincide con la intención  [ ] el beneficio coincide con los objetivos de negocio
INVEST: [ ] Independent / Negotiable / Valuable / Estimable / Sized / Testable

## Acceptance Criteria (Gherkin)
Scenario: nominal (desde el caso feliz)   Given / When / Then
Scenario: error (desde la validación)     Given / When / Then

## Technical Notes
Entidad, reglas de validación, requisitos de auth, eventos despachados

## Estimation
Story Points (según complejidad), MoSCoW (según patrones de uso)
```

**4. Trazabilidad** (si existe `project-management/prd.md`): asociar cada historia a una FR-xxx (añadir `implements: FR-xxx`), listar las historias sin requisito (código sin spec) y los requisitos sin historia (spec sin código).

**5. Salida y validación.** Guardar en `project-management/backlog/user-stories/US-001-create-user.md`, `US-002-...`, generar un índice resumen agrupado por módulo (título, puntos, MoSCoW, número de historias vinculadas al PRD, número de no vinculadas), y pedir al usuario que valide, corrija o rechace cada historia.

## gaps

Comparar las especificaciones (PRD, historias, spec técnica) con el código real.

**1. Cargar las specs:** `project-management/prd.md`, `project-management/backlog/user-stories/`, `project-management/tech-spec.md` (si existe), el informe de escaneo (refrescarlo ejecutando `scan` si falta o está desactualizado). Analizar FR-xxx, NFR-xxx y US-xxx.

**2. Escanear el código:** catalogar endpoints, lógica de negocio, modelos de datos, tests e infraestructura en un inventario de funcionalidades indexado por módulo.

**3. Comparación a cuatro bandas:**

| Categoría | Verificaciones |
|-----------|----------------|
| **Spec sin código** (no implementado) | FR-xxx sin endpoint correspondiente; US-xxx sin funcionalidad correspondiente; NFR-xxx sin configuración correspondiente |
| **Código sin spec** (sin documentar) | Endpoints sin referencia FR; servicios sin referencia US; entidades no cubiertas por las specs |
| **Discrepancia spec-código** (inconsistente) | Diferencias de campos, flujo de estados, auth, validación y formato de respuesta |
| **Brechas de tests** (sin probar) | Funcionalidades sin tests unitarios / de integración; criterios de aceptación sin tests E2E; rutas de error sin tests |

**4. Clasificar por severidad:**

| Severidad | Criterios | Acción |
|-----------|-----------|--------|
| **Critical** | Funcionalidad central ausente o rota; vulnerabilidad de seguridad; riesgo de integridad de datos | Corrección inmediata |
| **Major** | Brecha de funcionalidad importante; discrepancia significativa; faltan tests críticos | Sprint actual |
| **Minor** | Brecha de documentación; discrepancia no crítica; faltan tests de casos límite | Próximo sprint |
| **Info** | Inconsistencia de estilo; funcionalidad opcional; mejora | Backlog |

Reglas: spec sin código + P0 = Critical, + P1 = Major, + P2 = Minor; código sin spec + auth = Major, + CRUD = Minor; discrepancia + integridad de datos = Critical, + UI/UX = Minor; brecha de tests + lógica de negocio = Major, + caso límite = Minor.

**5. Informe** en `project-management/analysis/gap-analysis.md`: cabecera (proyecto, fecha, alcance), porcentajes de cobertura de spec / código / tests, número de brechas por severidad, las cuatro tablas por categoría con evidencias (rutas de archivos, referencias de línea) y una lista de remediación ordenada por prioridad con esfuerzo (S < 2h, M 2-8h, L > 8h).

```
| # | Action                              | Severity | Effort |
| 1 | Implement FR-005 (password reset)   | Critical | M      |
| 2 | Add integration tests for payment   | Critical | S      |
```

Después, ofrecer: crear historias para las funcionalidades ausentes, generar tareas para los elementos de remediación, o centrarse en una categoría de brechas.

## all

Ejecutar `scan` -> `prd` -> `stories` -> `gaps` en orden, reutilizando cada salida como entrada del siguiente paso (sin volver a escanear). Hacer una pausa de validación humana tras `prd` y `stories`. Terminar con un resumen: archivos escritos, número de personas / requisitos / historias inferidos, número de brechas por severidad y las 3 acciones principales.

## Comandos relacionados

- `/workflow:plan --only=prd` - Generar un PRD de forma interactiva (greenfield)
- `/workflow:plan --only=backlog` - Crear un backlog SCRUM a partir del PRD
- `/workflow:design` - Generar una especificación técnica
- `/project:backlog` - Gestionar epics, historias y tareas
