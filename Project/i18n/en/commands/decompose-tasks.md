---
description: Decompose User Stories into Tasks
argument-hint: [arguments]
---

# Decompose User Stories into Tasks

You are an experienced Tech Lead and Scrum Master. You must decompose sprint User Stories into detailed technical tasks for the development team.

This step corresponds to **Sprint Planning Part 2 - "The How"** in Scrum.

## Arguments
$ARGUMENTS - Sprint number (e.g., 001, 002)

If no argument, ask which sprint to decompose.

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## TECH STACK

| Layer | Technology | Typical Tasks |
|--------|-------------|-----------------|
| 🗄️ DB | PostgreSQL + Doctrine | Entity, Migration, Repository, Fixtures |
| ⚙️ API | API Platform | Resource, DTO, Processor, Voter |
| 🌐 Web | Symfony UX + Turbo | Controller, Twig Template, Stimulus, Live Component |
| 📱 Mobile | Flutter | Widget, Screen, Provider/Bloc, Repository |
| 🧪 Tests | PHPUnit + Flutter Test | Unit, Integration, Functional, E2E |
| 📝 Doc | PHPDoc + DartDoc | Documentation, README, OpenAPI |
| 🐳 Ops | Docker | Config, CI/CD |

## MISSION

### STEP 1: Read Sprint
Read sprint files `project-management/sprints/sprint-$ARGUMENTS-*/`:
- sprint-goal.md
- sprint-dependencies.md
- All referenced USs in backlog/user-stories/

### STEP 2: Create task structure

```
project-management/sprints/sprint-$ARGUMENTS-{slug}/
├── sprint-goal.md
├── sprint-dependencies.md
├── board.md                         # Kanban board (single board file)
└── tasks/
    ├── README.md                    # Overview: tasks grouped by US
    ├── TASK-001.md                  # One file per task (.claude/templates/project/task.md)
    └── ...
```

> **Status is not written in markdown.** Task files, `README.md` and `board.md` hold content only. Statuses live in `.bmad/sprint-status.yaml` (schema: `.claude/templates/project/sprint-status.md`); see STEP 8.

### STEP 3: Decomposition rules

#### Good task characteristics (SMART)
| Criteria | Description | Example |
|---------|-------------|---------|
| **S**pecific | Clear and precise action | "Create User entity" |
| **M**easurable | Know when it's done | "Migration executed" |
| **A**ssignable | Single owner | "Assigned to Backend Dev" |
| **R**ealistic | Achievable in time | "4h estimated" |
| **T**ime-bound | Estimated duration | "Max 8h" |

#### Size rules
- **Minimum**: 30 minutes
- **Maximum**: 8 hours (1 day)
- **Ideal**: 2-4 hours
- If > 8h → split into subtasks

#### Task types
| Type | Prefix | Examples |
|------|---------|----------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, API, Widget, E2E |
| Documentation | `[DOC]` | PHPDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code review |

### STEP 4: US decomposition template

For each US, add one section to `tasks/README.md` using the template below, and create one `tasks/TASK-{ID}.md` file per task row from `.claude/templates/project/task.md` (IDs continue after the last existing `TASK-*`, as `/project:add-task` does):

````markdown
# Tasks - US-XXX: [Title]

## US Information
- **Epic**: EPIC-XXX
- **Persona**: P-XXX - [Name]
- **Story Points**: [X]
- **Sprint**: sprint-$ARGUMENTS-{slug}

## US Summary
**As** [persona]
**I want** [action]
**So that** [benefit]

## Task Overview

| ID | Type | Task | Estimation | Depends on |
|----|------|-------|------------|-----------|
| TASK-001 | [DB] | Create [Name] entity | 2h | - |
| TASK-002 | [DB] | Migration | 1h | TASK-001 |
| TASK-003 | [BE] | API Platform resource | 3h | TASK-001 |
| TASK-004 | [BE] | Business service | 4h | TASK-003 |
| TASK-005 | [FE-WEB] | Symfony controller | 2h | TASK-003 |
| TASK-006 | [FE-WEB] | Twig templates | 3h | TASK-005 |
| TASK-007 | [FE-WEB] | Stimulus controller | 2h | TASK-006 |
| TASK-008 | [FE-MOB] | Dart model | 1h | TASK-003 |
| TASK-009 | [FE-MOB] | Flutter repository | 2h | TASK-008 |
| TASK-010 | [FE-MOB] | Bloc/Provider | 3h | TASK-009 |
| TASK-011 | [FE-MOB] | Flutter screen | 4h | TASK-010 |
| TASK-012 | [TEST] | Backend unit tests | 2h | TASK-004 |
| TASK-013 | [TEST] | API tests | 2h | TASK-003 |
| TASK-014 | [TEST] | Widget tests | 2h | TASK-011 |
| TASK-015 | [TEST] | E2E tests | 3h | TASK-007, TASK-011 |
| TASK-016 | [DOC] | Documentation | 1h | TASK-015 |
| TASK-017 | [REV] | Code Review | 2h | TASK-016 |

**Total estimated**: XXh

---

## Task Details

### Database Layer [DB]

#### TASK-001: Create [Name] entity with Doctrine
- **Type**: [DB]
- **Estimation**: 2h
- **Depends on**: -

**Description**:
Create Doctrine entity with all fields, relations and annotations.

**Files to create/modify**:
- `src/Entity/[Name].php`
- `src/Repository/[Name]Repository.php`

**Validation criteria**:
- [ ] Entity created with all fields
- [ ] Correct Doctrine annotations/attributes
- [ ] Relations configured
- [ ] Repository with custom methods

**Commands**:
```bash
php bin/console make:entity [Name]
```

---

#### TASK-002: Migration for [Name]
- **Type**: [DB]
- **Estimation**: 1h
- **Depends on**: TASK-001

**Files**:
- `migrations/VersionXXXX.php`

**Criteria**:
- [ ] Migration generated
- [ ] Tested (up/down)
- [ ] Indexes created

**Commands**:
```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

---

### API Layer [BE]

#### TASK-003: API Platform [Name] resource
- **Type**: [BE]
- **Estimation**: 3h
- **Depends on**: TASK-001

**Files**:
- `src/Entity/[Name].php` (ApiResource attributes)
- `src/Dto/[Name]Input.php`
- `src/Dto/[Name]Output.php`

**Configuration**:
```php
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_USER')"),
        new Put(security: "object.owner == user"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['[name]:read']],
    denormalizationContext: ['groups' => ['[name]:write']],
)]
```

**Criteria**:
- [ ] REST endpoints functional
- [ ] Serialization groups
- [ ] Validation constraints
- [ ] Security/Voters
- [ ] OpenAPI generated

---

#### TASK-004: [Name]Service business service
- **Type**: [BE]
- **Estimation**: 4h
- **Depends on**: TASK-003

**Files**:
- `src/Service/[Name]Service.php`

**Criteria**:
- [ ] Service created and injected
- [ ] Business logic implemented
- [ ] Business exceptions
- [ ] Logs added

---

### Web Frontend Layer [FE-WEB]

#### TASK-005: Symfony [Name] controller
- **Type**: [FE-WEB]
- **Estimation**: 2h
- **Depends on**: TASK-003

**Files**:
- `src/Controller/[Name]Controller.php`

**Routes**:
| Route | Method | Action |
|-------|---------|--------|
| `/[name]` | GET | index |
| `/[name]/{id}` | GET | show |
| `/[name]/new` | GET/POST | new |
| `/[name]/{id}/edit` | GET/POST | edit |

**Criteria**:
- [ ] Routes functional
- [ ] IsGranted configured
- [ ] Flash messages

---

#### TASK-006: Twig [Name] templates
- **Type**: [FE-WEB]
- **Estimation**: 3h
- **Depends on**: TASK-005

**Files**:
- `templates/[name]/index.html.twig`
- `templates/[name]/show.html.twig`
- `templates/[name]/new.html.twig`
- `templates/[name]/edit.html.twig`
- `templates/[name]/_form.html.twig`

**Criteria**:
- [ ] Turbo Frames/Streams
- [ ] Responsive
- [ ] WCAG 2.1 AA

---

#### TASK-007: Stimulus controller
- **Type**: [FE-WEB]
- **Estimation**: 2h
- **Depends on**: TASK-006

**Files**:
- `assets/controllers/[name]_controller.js`

**Criteria**:
- [ ] No inline JS
- [ ] Smooth UX

---

### Mobile Frontend Layer [FE-MOB]

#### TASK-008: Dart [Name] model
- **Type**: [FE-MOB]
- **Estimation**: 1h
- **Depends on**: TASK-003

**Files**:
- `lib/models/[name].dart`

```dart
@JsonSerializable()
class [Name] {
  final int id;
  // ...
  factory [Name].fromJson(Map<String, dynamic> json) => _$[Name]FromJson(json);
}
```

**Criteria**:
- [ ] JSON serialization
- [ ] Nullable types
- [ ] Equivalent to API

---

#### TASK-009: Flutter [Name] repository
- **Type**: [FE-MOB]
- **Estimation**: 2h
- **Depends on**: TASK-008

**Files**:
- `lib/repositories/[name]_repository.dart`

**Criteria**:
- [ ] Complete CRUD
- [ ] HTTP error handling
- [ ] Auth headers

---

#### TASK-010: [Name] Provider/Bloc
- **Type**: [FE-MOB]
- **Estimation**: 3h
- **Depends on**: TASK-009

**Files**:
- `lib/providers/[name]_provider.dart`
- or `lib/blocs/[name]_bloc.dart`

**States**:
- Initial, Loading, Loaded, Error

---

#### TASK-011: Flutter [Name] screen
- **Type**: [FE-MOB]
- **Estimation**: 4h
- **Depends on**: TASK-010

**Files**:
- `lib/screens/[name]/[name]_list_screen.dart`
- `lib/screens/[name]/[name]_detail_screen.dart`
- `lib/widgets/[name]/[name]_card.dart`

**Criteria**:
- [ ] Material/Cupertino
- [ ] Pull-to-refresh
- [ ] Loading states
- [ ] Error handling
- [ ] Navigation

---

### Tests Layer [TEST]

#### TASK-012: Backend unit tests
- **Type**: [TEST]
- **Estimation**: 2h
- **Depends on**: TASK-004

**Files**:
- `tests/Unit/Service/[Name]ServiceTest.php`

**Criteria**:
- [ ] Coverage > 80%
- [ ] Correct mocks

---

#### TASK-013: API tests
- **Type**: [TEST]
- **Estimation**: 2h
- **Depends on**: TASK-003

**Files**:
- `tests/Functional/Api/[Name]Test.php`

**Endpoints to test**:
| Method | Nominal case | Error case |
|---------|-------------|------------|
| GET | 200 | 401, 404 |
| POST | 201 | 422 |
| PUT | 200 | 403, 404 |
| DELETE | 204 | 403, 404 |

---

#### TASK-014: Flutter widget tests
- **Type**: [TEST]
- **Estimation**: 2h
- **Depends on**: TASK-011

**Files**:
- `test/widgets/[name]_card_test.dart`

---

#### TASK-015: E2E tests
- **Type**: [TEST]
- **Estimation**: 3h
- **Depends on**: TASK-007, TASK-011

**Files**:
- `tests/E2E/[Name]FlowTest.php`
- `integration_test/[name]_flow_test.dart`

**Criteria**:
- [ ] Web AND Mobile
- [ ] < 2 min

---

### Documentation & Review

#### TASK-016: Documentation
- **Type**: [DOC]
- **Estimation**: 1h
- **Depends on**: TASK-015

**Criteria**:
- [ ] PHPDoc/DartDoc
- [ ] OpenAPI up to date

---

#### TASK-017: Code Review
- **Type**: [REV]
- **Estimation**: 2h
- **Depends on**: TASK-016

**Checklist**:
- [ ] Readable code
- [ ] Tests passing
- [ ] PHPStan/Dart analyzer OK
- [ ] Security verified

---

## Dependency Graph

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

## Summary

| Layer | # Tasks | Hours |
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

### STEP 5: Create Task Board

Create `board.md` (template `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint $ARGUMENTS

> Generated view: regenerated from `.bmad/sprint-status.yaml` by `/project:board`. Do not edit by hand.

## to-do
| ID | US | Task | Estimation | Assigned |
|----|-----|-------|------------|---------|

## in-progress
| ID | US | Task | Started | Assigned |
|----|-----|-------|---------|---------|

## review
| ID | US | Task | Reviewer |
|----|-----|-------|----------|

## done
| ID | US | Task | Actual | Completed |
|----|-----|-------|------|---------|

## blocked
| ID | US | Reason | Action |
|----|-----|--------|--------|

## Metrics
- **Tasks**: X total | X completed (X%)
- **Hours**: Xh estimated | Xh spent | Xh remaining
```

### STEP 6: Create tasks README

Create `tasks/README.md`:

```markdown
# Tasks - Sprint $ARGUMENTS

## Overview

| US | Title | Points | Tasks | Hours |
|----|-------|--------|--------|--------|

**Total**: X tasks | Xh

## Breakdown by type

| Type | Tasks | Hours | % |
|------|--------|--------|---|
| [DB] | X | Xh | X% |
| [BE] | X | Xh | X% |
| [FE-WEB] | X | Xh | X% |
| [FE-MOB] | X | Xh | X% |
| [TEST] | X | Xh | X% |

## Files
- [TASK-001 - Title](./TASK-001.md)

## Conventions
- **ID**: TASK-[NNN] (e.g., TASK-005); the parent US is in the task metadata
- **Size**: 0.5h - 8h max
- **Statuses**: tracked in `.bmad/sprint-status.yaml` (`to-do | in-progress | done | blocked`), never in markdown
```

### STEP 7: Cross-cutting technical tasks

Add a "Cross-cutting technical tasks" section to `tasks/README.md` and create one `tasks/TASK-{ID}.md` per task (US: none):

```markdown
# Cross-cutting Technical Tasks - Sprint $ARGUMENTS

## Infrastructure

### TASK-018: Environment configuration
- **Type**: [OPS]
- **Estimation**: 2h

### TASK-019: Dependency updates
- **Type**: [OPS]
- **Estimation**: 1h

## Refactoring

### TASK-020: [Identified refactoring]
- **Type**: [BE]
- **Estimation**: Xh
- **Reason**: Technical debt

## CI/CD

### TASK-021: CI Pipeline
- **Type**: [OPS]
- **Estimation**: 2h
```

### STEP 8: Register statuses in `.bmad/sprint-status.yaml`

For every created task (US tasks and cross-cutting tasks), following `.claude/templates/project/sprint-status.md`:

1. Create `.bmad/sprint-status.yaml` from the `/workflow:init` skeleton if missing
2. Append the TASK ids to `stories.<US>.tasks.list`
3. Set `stories.<US>.tasks.status.<TASK>: to-do`
4. Update `stories.<US>.tasks.total` (`completed` stays the number of `done` tasks)

## US → TASKS MAPPING

| US Type | BE Tasks | FE Tasks | Test Tasks | Total ~|
|------------|-----------|-----------|--------------|--------|
| Simple CRUD | 4 | 7 | 4 | ~15 |
| Business feature | 5 | 8 | 5 | ~18 |
| UI only | 1 | 7 | 3 | ~11 |

## RULES

1. **Estimation in hours** (not points)
2. **One task = one owner**
3. **Max 2 tasks in progress per person**
4. **Explicit dependencies** with Mermaid
5. **Vertical slicing**: Symfony + Flutter + API + DB

---
Execute sprint $ARGUMENTS decomposition now.
