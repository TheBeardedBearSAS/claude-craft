---
description: Descomponer User Stories en Tareas
argument-hint: [arguments]
---

# Descomponer User Stories en Tareas

Eres un Tech Lead y Scrum Master experimentado. Debes descomponer las User Stories del sprint en tareas técnicas detalladas para el equipo de desarrollo.

Este paso corresponde al **Sprint Planning Parte 2 - "El Cómo"** en SCRUM.

## Argumentos
$ARGUMENTS - Número de sprint (ej., 001, 002)

Si no hay argumento, preguntar qué sprint descomponer.

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## STACK TECNOLÓGICO

| Capa | Tecnología | Tareas Típicas |
|--------|-------------|-----------------|
| 🗄️ DB | PostgreSQL + Doctrine | Entity, Migration, Repository, Fixtures |
| ⚙️ API | API Platform | Resource, DTO, Processor, Voter |
| 🌐 Web | Symfony UX + Turbo | Controller, Twig Template, Stimulus, Live Component |
| 📱 Mobile | Flutter | Widget, Screen, Provider/Bloc, Repository |
| 🧪 Tests | PHPUnit + Flutter Test | Unit, Integration, Functional, E2E |
| 📝 Doc | PHPDoc + DartDoc | Documentation, README, OpenAPI |
| 🐳 Ops | Docker | Config, CI/CD |

## MISIÓN

### PASO 1: Leer Sprint
Leer archivos del sprint `project-management/sprints/sprint-$ARGUMENTS-*/`:
- sprint-goal.md
- sprint-dependencies.md
- Todas las USs referenciadas en backlog/user-stories/

### PASO 2: Crear estructura de tareas

```
project-management/sprints/sprint-$ARGUMENTS-{slug}/
├── sprint-goal.md
├── sprint-dependencies.md
├── board.md                         # Tablero Kanban (archivo único)
└── tasks/
    ├── README.md                    # Resumen: tareas agrupadas por US
    ├── TASK-001.md                  # Un archivo por tarea (.claude/templates/project/task.md)
    └── ...
```

### PASO 3: Reglas de descomposición

#### Características de buenas tareas (SMART)
| Criterio | Descripción | Ejemplo |
|---------|-------------|---------|
| **S**pecific (Específico) | Acción clara y precisa | "Crear entidad User" |
| **M**easurable (Medible) | Saber cuándo está terminada | "Migration ejecutada" |
| **A**ssignable (Asignable) | Un solo responsable | "Asignado a Backend Dev" |
| **R**ealistic (Realista) | Alcanzable en el tiempo | "4h estimadas" |
| **T**ime-bound (Limitado en tiempo) | Duración estimada | "Máximo 8h" |

#### Reglas de tamaño
- **Mínimo**: 30 minutos
- **Máximo**: 8 horas (1 día)
- **Ideal**: 2-4 horas
- Si > 8h → dividir en subtareas

#### Tipos de tareas
| Tipo | Prefijo | Ejemplos |
|------|---------|----------|
| Base de datos | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Móvil | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, API, Widget, E2E |
| Documentación | `[DOC]` | PHPDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisión | `[REV]` | Code review |

### PASO 4: Plantilla de descomposición de US

Para cada US, añadir una sección a `tasks/README.md` con la plantilla siguiente, y crear un archivo `tasks/TASK-{ID}.md` por cada fila de tarea a partir de `.claude/templates/project/task.md` (los IDs continúan tras el último `TASK-*` existente, como hace `/project:add-task`):

````markdown
# Tareas - US-XXX: [Título]

## Información de la US
- **Epic**: EPIC-XXX
- **Persona**: P-XXX - [Nombre]
- **Story Points**: [X]
- **Sprint**: sprint-$ARGUMENTS-{slug}

## Resumen de la US
**Como** [persona]
**Quiero** [acción]
**Para** [beneficio]

## Resumen de Tareas

| ID | Tipo | Tarea | Estimación | Depende de | Estado |
|----|------|-------|------------|-----------|--------|
| TASK-001 | [DB] | Crear entidad [Nombre] | 2h | - | 🔲 |
| TASK-002 | [DB] | Migration | 1h | TASK-001 | 🔲 |
| TASK-003 | [BE] | Recurso API Platform | 3h | TASK-001 | 🔲 |
| TASK-004 | [BE] | Servicio de negocio | 4h | TASK-003 | 🔲 |
| TASK-005 | [FE-WEB] | Controller Symfony | 2h | TASK-003 | 🔲 |
| TASK-006 | [FE-WEB] | Templates Twig | 3h | TASK-005 | 🔲 |
| TASK-007 | [FE-WEB] | Controller Stimulus | 2h | TASK-006 | 🔲 |
| TASK-008 | [FE-MOB] | Modelo Dart | 1h | TASK-003 | 🔲 |
| TASK-009 | [FE-MOB] | Repositorio Flutter | 2h | TASK-008 | 🔲 |
| TASK-010 | [FE-MOB] | Bloc/Provider | 3h | TASK-009 | 🔲 |
| TASK-011 | [FE-MOB] | Pantalla Flutter | 4h | TASK-010 | 🔲 |
| TASK-012 | [TEST] | Tests unitarios backend | 2h | TASK-004 | 🔲 |
| TASK-013 | [TEST] | Tests API | 2h | TASK-003 | 🔲 |
| TASK-014 | [TEST] | Tests de Widget | 2h | TASK-011 | 🔲 |
| TASK-015 | [TEST] | Tests E2E | 3h | TASK-007, TASK-011 | 🔲 |
| TASK-016 | [DOC] | Documentación | 1h | TASK-015 | 🔲 |
| TASK-017 | [REV] | Code Review | 2h | TASK-016 | 🔲 |

**Total estimado**: XXh

---

## Detalles de Tareas

### Capa Base de Datos [DB]

#### TASK-001: Crear entidad [Nombre] con Doctrine
- **Tipo**: [DB]
- **Estimación**: 2h
- **Depende de**: -

**Descripción**:
Crear entidad Doctrine con todos los campos, relaciones y anotaciones.

**Archivos a crear/modificar**:
- `src/Entity/[Nombre].php`
- `src/Repository/[Nombre]Repository.php`

**Criterios de validación**:
- [ ] Entidad creada con todos los campos
- [ ] Anotaciones/atributos Doctrine correctos
- [ ] Relaciones configuradas
- [ ] Repositorio con métodos personalizados

**Comandos**:
```bash
php bin/console make:entity [Nombre]
```

---

#### TASK-002: Migration para [Nombre]
- **Tipo**: [DB]
- **Estimación**: 1h
- **Depende de**: TASK-001

**Archivos**:
- `migrations/VersionXXXX.php`

**Criterios**:
- [ ] Migration generada
- [ ] Probada (up/down)
- [ ] Índices creados

**Comandos**:
```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

---

### Capa API [BE]

#### TASK-003: Recurso API Platform [Nombre]
- **Tipo**: [BE]
- **Estimación**: 3h
- **Depende de**: TASK-001

**Archivos**:
- `src/Entity/[Nombre].php` (atributos ApiResource)
- `src/Dto/[Nombre]Input.php`
- `src/Dto/[Nombre]Output.php`

**Configuración**:
```php
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_USER')"),
        new Put(security: "object.owner == user"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['[nombre]:read']],
    denormalizationContext: ['groups' => ['[nombre]:write']],
)]
```

**Criterios**:
- [ ] Endpoints REST funcionales
- [ ] Grupos de serialización
- [ ] Constraints de validación
- [ ] Security/Voters
- [ ] OpenAPI generado

---

#### TASK-004: Servicio de negocio [Nombre]Service
- **Tipo**: [BE]
- **Estimación**: 4h
- **Depende de**: TASK-003

**Archivos**:
- `src/Service/[Nombre]Service.php`

**Criterios**:
- [ ] Servicio creado e inyectado
- [ ] Lógica de negocio implementada
- [ ] Excepciones de negocio
- [ ] Logs agregados

---

### Capa Frontend Web [FE-WEB]

#### TASK-005: Controller Symfony [Nombre]
- **Tipo**: [FE-WEB]
- **Estimación**: 2h
- **Depende de**: TASK-003

**Archivos**:
- `src/Controller/[Nombre]Controller.php`

**Rutas**:
| Ruta | Método | Acción |
|-------|---------|--------|
| `/[nombre]` | GET | index |
| `/[nombre]/{id}` | GET | show |
| `/[nombre]/new` | GET/POST | new |
| `/[nombre]/{id}/edit` | GET/POST | edit |

**Criterios**:
- [ ] Rutas funcionales
- [ ] IsGranted configurado
- [ ] Flash messages

---

#### TASK-006: Templates Twig [Nombre]
- **Tipo**: [FE-WEB]
- **Estimación**: 3h
- **Depende de**: TASK-005

**Archivos**:
- `templates/[nombre]/index.html.twig`
- `templates/[nombre]/show.html.twig`
- `templates/[nombre]/new.html.twig`
- `templates/[nombre]/edit.html.twig`
- `templates/[nombre]/_form.html.twig`

**Criterios**:
- [ ] Turbo Frames/Streams
- [ ] Responsive
- [ ] WCAG 2.1 AA

---

#### TASK-007: Controller Stimulus
- **Tipo**: [FE-WEB]
- **Estimación**: 2h
- **Depende de**: TASK-006

**Archivos**:
- `assets/controllers/[nombre]_controller.js`

**Criterios**:
- [ ] Sin JS inline
- [ ] UX fluida

---

### Capa Frontend Móvil [FE-MOB]

#### TASK-008: Modelo Dart [Nombre]
- **Tipo**: [FE-MOB]
- **Estimación**: 1h
- **Depende de**: TASK-003

**Archivos**:
- `lib/models/[nombre].dart`

```dart
@JsonSerializable()
class [Nombre] {
  final int id;
  // ...
  factory [Nombre].fromJson(Map<String, dynamic> json) => _$[Nombre]FromJson(json);
}
```

**Criterios**:
- [ ] Serialización JSON
- [ ] Tipos nullable
- [ ] Equivalente a API

---

#### TASK-009: Repositorio Flutter [Nombre]
- **Tipo**: [FE-MOB]
- **Estimación**: 2h
- **Depende de**: TASK-008

**Archivos**:
- `lib/repositories/[nombre]_repository.dart`

**Criterios**:
- [ ] CRUD completo
- [ ] Manejo de errores HTTP
- [ ] Headers de autenticación

---

#### TASK-010: Provider/Bloc [Nombre]
- **Tipo**: [FE-MOB]
- **Estimación**: 3h
- **Depende de**: TASK-009

**Archivos**:
- `lib/providers/[nombre]_provider.dart`
- o `lib/blocs/[nombre]_bloc.dart`

**Estados**:
- Initial, Loading, Loaded, Error

---

#### TASK-011: Pantalla Flutter [Nombre]
- **Tipo**: [FE-MOB]
- **Estimación**: 4h
- **Depende de**: TASK-010

**Archivos**:
- `lib/screens/[nombre]/[nombre]_list_screen.dart`
- `lib/screens/[nombre]/[nombre]_detail_screen.dart`
- `lib/widgets/[nombre]/[nombre]_card.dart`

**Criterios**:
- [ ] Material/Cupertino
- [ ] Pull-to-refresh
- [ ] Estados de carga
- [ ] Manejo de errores
- [ ] Navegación

---

### Capa de Tests [TEST]

#### TASK-012: Tests unitarios backend
- **Tipo**: [TEST]
- **Estimación**: 2h
- **Depende de**: TASK-004

**Archivos**:
- `tests/Unit/Service/[Nombre]ServiceTest.php`

**Criterios**:
- [ ] Cobertura > 80%
- [ ] Mocks correctos

---

#### TASK-013: Tests de API
- **Tipo**: [TEST]
- **Estimación**: 2h
- **Depende de**: TASK-003

**Archivos**:
- `tests/Functional/Api/[Nombre]Test.php`

**Endpoints a probar**:
| Método | Caso nominal | Caso error |
|---------|-------------|------------|
| GET | 200 | 401, 404 |
| POST | 201 | 422 |
| PUT | 200 | 403, 404 |
| DELETE | 204 | 403, 404 |

---

#### TASK-014: Tests de Widget Flutter
- **Tipo**: [TEST]
- **Estimación**: 2h
- **Depende de**: TASK-011

**Archivos**:
- `test/widgets/[nombre]_card_test.dart`

---

#### TASK-015: Tests E2E
- **Tipo**: [TEST]
- **Estimación**: 3h
- **Depende de**: TASK-007, TASK-011

**Archivos**:
- `tests/E2E/[Nombre]FlowTest.php`
- `integration_test/[nombre]_flow_test.dart`

**Criterios**:
- [ ] Web Y Móvil
- [ ] < 2 min

---

### Documentación y Revisión

#### TASK-016: Documentación
- **Tipo**: [DOC]
- **Estimación**: 1h
- **Depende de**: TASK-015

**Criterios**:
- [ ] PHPDoc/DartDoc
- [ ] OpenAPI actualizado

---

#### TASK-017: Code Review
- **Tipo**: [REV]
- **Estimación**: 2h
- **Depende de**: TASK-016

**Checklist**:
- [ ] Código legible
- [ ] Tests pasando
- [ ] PHPStan/Dart analyzer OK
- [ ] Seguridad verificada

---

## Grafo de Dependencias

```mermaid
graph TD
    T01[TASK-001: Entity] --> T02[TASK-002: Migration]
    T01 --> T03[TASK-003: API Resource]
    T03 --> T04[TASK-004: Service]
    T03 --> T05[TASK-005: Controller]
    T05 --> T06[TASK-006: Templates]
    T06 --> T07[TASK-007: Stimulus]
    T03 --> T08[TASK-008: Model Dart]
    T08 --> T09[TASK-009: Repository]
    T09 --> T10[TASK-010: Bloc]
    T10 --> T11[TASK-011: Screen]
    T04 --> T12[TASK-012: Unit Tests]
    T03 --> T13[TASK-013: API Tests]
    T11 --> T14[TASK-014: Widget Tests]
    T07 --> T15[TASK-015: E2E Tests]
    T11 --> T15
    T15 --> T16[TASK-016: Doc]
    T16 --> T17[TASK-017: Review]
```

## Resumen

| Capa | # Tareas | Horas |
|--------|-----------|--------|
| [DB] | 2 | 3h |
| [BE] | 2 | 7h |
| [FE-WEB] | 3 | 7h |
| [FE-MOB] | 4 | 10h |
| [TEST] | 4 | 9h |
| [DOC] | 1 | 1h |
| [REV] | 1 | 2h |
| **TOTAL** | **17** | **39h** |
````

### PASO 5: Crear Tablero de Tareas

Crear `board.md` (plantilla `.claude/templates/project/board.md`):

```markdown
# Tablero de Tareas - Sprint $ARGUMENTS

## Leyenda
- 🔲 To Do
- 🔄 In Progress
- 👀 In Review
- ✅ Done
- 🚫 Blocked

## 🔲 To Do
| ID | US | Tarea | Estimación | Asignado |
|----|-----|-------|------------|---------|

## 🔄 In Progress
| ID | US | Tarea | Iniciado | Asignado |
|----|-----|-------|---------|---------|

## 👀 In Review
| ID | US | Tarea | Revisor |
|----|-----|-------|----------|

## ✅ Done
| ID | US | Tarea | Real | Completado |
|----|-----|-------|------|---------|

## 🚫 Blocked
| ID | US | Razón | Acción |
|----|-----|--------|--------|

## Métricas
- **Tareas**: X total | X completadas (X%)
- **Horas**: Xh estimadas | Xh gastadas | Xh restantes
```

### PASO 6: Crear README de tareas

Crear `tasks/README.md`:

```markdown
# Tareas - Sprint $ARGUMENTS

## Resumen

| US | Título | Puntos | Tareas | Horas | Estado |
|----|-------|--------|--------|--------|--------|

**Total**: X tareas | Xh

## Desglose por tipo

| Tipo | Tareas | Horas | % |
|------|--------|--------|---|
| [DB] | X | Xh | X% |
| [BE] | X | Xh | X% |
| [FE-WEB] | X | Xh | X% |
| [FE-MOB] | X | Xh | X% |
| [TEST] | X | Xh | X% |

## Archivos
- [TASK-001 - Título](./TASK-001.md)

## Convenciones
- **ID**: TASK-[NNN] (ej., TASK-005); la US padre figura en los metadatos de la tarea
- **Tamaño**: 0.5h - 8h máx
- **Estados**: 🔲 🔄 👀 ✅ 🚫
```

### PASO 7: Tareas técnicas transversales

Añadir una sección «Tareas técnicas transversales» a `tasks/README.md` y crear un `tasks/TASK-{ID}.md` por tarea (US: ninguna):

```markdown
# Tareas Técnicas Transversales - Sprint $ARGUMENTS

## Infraestructura

### TASK-018: Configuración de entorno
- **Tipo**: [OPS]
- **Estimación**: 2h

### TASK-019: Actualización de dependencias
- **Tipo**: [OPS]
- **Estimación**: 1h

## Refactoring

### TASK-020: [Refactoring identificado]
- **Tipo**: [BE]
- **Estimación**: Xh
- **Razón**: Deuda técnica

## CI/CD

### TASK-021: Pipeline CI
- **Tipo**: [OPS]
- **Estimación**: 2h
```

## MAPEO US → TAREAS

| Tipo de US | Tareas BE | Tareas FE | Tareas Test | Total ~|
|------------|-----------|-----------|--------------|--------|
| CRUD Simple | 4 | 7 | 4 | ~15 |
| Funcionalidad de negocio | 5 | 8 | 5 | ~18 |
| Solo UI | 1 | 7 | 3 | ~11 |

## REGLAS

1. **Estimación en horas** (no en puntos)
2. **Una tarea = un responsable**
3. **Máx 2 tareas en progreso por persona**
4. **Dependencias explícitas** con Mermaid
5. **Slicing vertical**: Symfony + Flutter + API + DB

---
Ejecutar descomposición del sprint $ARGUMENTS ahora.
