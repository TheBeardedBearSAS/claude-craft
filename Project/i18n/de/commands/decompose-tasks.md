---
description: User Stories in Aufgaben zerlegen
argument-hint: [arguments]
---

# User Stories in Aufgaben zerlegen

Sie sind ein erfahrener Tech Lead und Scrum Master. Sie müssen Sprint User Stories in detaillierte technische Aufgaben für das Entwicklungsteam zerlegen.

Dieser Schritt entspricht **Sprint Planning Teil 2 - "Das Wie"** in Scrum.

## Argumente
$ARGUMENTS - Sprint-Nummer (z.B. 001, 002)

Falls kein Argument, fragen, welcher Sprint zerlegt werden soll.

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## TECH STACK

| Schicht | Technologie | Typische Aufgaben |
|--------|-------------|-----------------|
| 🗄️ DB | PostgreSQL + Doctrine | Entity, Migration, Repository, Fixtures |
| ⚙️ API | API Platform | Resource, DTO, Processor, Voter |
| 🌐 Web | Symfony UX + Turbo | Controller, Twig Template, Stimulus, Live Component |
| 📱 Mobile | Flutter | Widget, Screen, Provider/Bloc, Repository |
| 🧪 Tests | PHPUnit + Flutter Test | Unit, Integration, Functional, E2E |
| 📝 Doc | PHPDoc + DartDoc | Documentation, README, OpenAPI |
| 🐳 Ops | Docker | Config, CI/CD |

## MISSION

### SCHRITT 1: Sprint lesen
Sprint-Dateien `project-management/sprints/sprint-$ARGUMENTS-*/` lesen:
- sprint-goal.md
- sprint-dependencies.md
- Alle referenzierten USs in backlog/user-stories/

### SCHRITT 2: Aufgabenstruktur erstellen

```
project-management/sprints/sprint-$ARGUMENTS-{slug}/
├── sprint-goal.md
├── sprint-dependencies.md
├── board.md                         # Kanban-Board (einzelne Board-Datei)
└── tasks/
    ├── README.md                    # Übersicht: Aufgaben nach US gruppiert
    ├── TASK-001.md                  # Eine Datei pro Aufgabe (templates/task.md)
    └── ...
```

### SCHRITT 3: Zerlegungsregeln

#### Gute Aufgabenmerkmale (SMART)
| Kriterium | Beschreibung | Beispiel |
|---------|-------------|---------|
| **S**pezifisch | Klare und präzise Aktion | "User-Entity erstellen" |
| **M**essbar | Wissen, wann es fertig ist | "Migration ausgeführt" |
| **A**ssignable | Einzelner Verantwortlicher | "Backend Dev zugewiesen" |
| **R**ealistisch | In der Zeit erreichbar | "4h geschätzt" |
| **T**ime-bound | Geschätzte Dauer | "Max 8h" |

#### Größenregeln
- **Minimum**: 30 Minuten
- **Maximum**: 8 Stunden (1 Tag)
- **Ideal**: 2-4 Stunden
- Falls > 8h → in Teilaufgaben aufteilen

#### Aufgabentypen
| Typ | Präfix | Beispiele |
|------|---------|----------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, API, Widget, E2E |
| Documentation | `[DOC]` | PHPDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

### SCHRITT 4: US-Zerlegungsvorlage

Für jede US einen Abschnitt in `tasks/README.md` nach der folgenden Vorlage hinzufügen und pro Aufgabenzeile eine Datei `tasks/TASK-{ID}.md` aus `templates/task.md` erstellen (IDs setzen nach dem letzten vorhandenen `TASK-*` fort, wie bei `/project:add-task`):

````markdown
# Aufgaben - US-XXX: [Titel]

## US-Informationen
- **Epic**: EPIC-XXX
- **Persona**: P-XXX - [Name]
- **Story Points**: [X]
- **Sprint**: sprint-$ARGUMENTS-{slug}

## US-Zusammenfassung
**Als** [persona]
**möchte ich** [Aktion]
**damit** [Nutzen]

## Aufgabenübersicht

| ID | Typ | Aufgabe | Schätzung | Abhängig von | Status |
|----|------|-------|------------|-----------|--------|
| TASK-001 | [DB] | [Name]-Entity erstellen | 2h | - | 🔲 |
| TASK-002 | [DB] | Migration | 1h | TASK-001 | 🔲 |
| TASK-003 | [BE] | API Platform Resource | 3h | TASK-001 | 🔲 |
| TASK-004 | [BE] | Business Service | 4h | TASK-003 | 🔲 |
| TASK-005 | [FE-WEB] | Symfony Controller | 2h | TASK-003 | 🔲 |
| TASK-006 | [FE-WEB] | Twig Templates | 3h | TASK-005 | 🔲 |
| TASK-007 | [FE-WEB] | Stimulus Controller | 2h | TASK-006 | 🔲 |
| TASK-008 | [FE-MOB] | Dart Model | 1h | TASK-003 | 🔲 |
| TASK-009 | [FE-MOB] | Flutter Repository | 2h | TASK-008 | 🔲 |
| TASK-010 | [FE-MOB] | Bloc/Provider | 3h | TASK-009 | 🔲 |
| TASK-011 | [FE-MOB] | Flutter Screen | 4h | TASK-010 | 🔲 |
| TASK-012 | [TEST] | Backend Unit Tests | 2h | TASK-004 | 🔲 |
| TASK-013 | [TEST] | API Tests | 2h | TASK-003 | 🔲 |
| TASK-014 | [TEST] | Widget Tests | 2h | TASK-011 | 🔲 |
| TASK-015 | [TEST] | E2E Tests | 3h | TASK-007, TASK-011 | 🔲 |
| TASK-016 | [DOC] | Documentation | 1h | TASK-015 | 🔲 |
| TASK-017 | [REV] | Code Review | 2h | TASK-016 | 🔲 |

**Gesamt geschätzt**: XXh

---

## Aufgabendetails

### Database-Schicht [DB]

#### TASK-001: [Name]-Entity mit Doctrine erstellen
- **Typ**: [DB]
- **Schätzung**: 2h
- **Abhängig von**: -

**Beschreibung**:
Doctrine Entity mit allen Feldern, Beziehungen und Annotationen erstellen.

**Zu erstellende/ändernde Dateien**:
- `src/Entity/[Name].php`
- `src/Repository/[Name]Repository.php`

**Validierungskriterien**:
- [ ] Entity mit allen Feldern erstellt
- [ ] Korrekte Doctrine Annotations/Attributes
- [ ] Beziehungen konfiguriert
- [ ] Repository mit benutzerdefinierten Methoden

**Befehle**:
```bash
php bin/console make:entity [Name]
```

---

#### TASK-002: Migration für [Name]
- **Typ**: [DB]
- **Schätzung**: 1h
- **Abhängig von**: TASK-001

**Dateien**:
- `migrations/VersionXXXX.php`

**Kriterien**:
- [ ] Migration generiert
- [ ] Getestet (up/down)
- [ ] Indizes erstellt

**Befehle**:
```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

---

### API-Schicht [BE]

#### TASK-003: API Platform [Name] Resource
- **Typ**: [BE]
- **Schätzung**: 3h
- **Abhängig von**: TASK-001

**Dateien**:
- `src/Entity/[Name].php` (ApiResource Attributes)
- `src/Dto/[Name]Input.php`
- `src/Dto/[Name]Output.php`

**Konfiguration**:
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

**Kriterien**:
- [ ] REST-Endpunkte funktionsfähig
- [ ] Serialisierungsgruppen
- [ ] Validierungs-Constraints
- [ ] Security/Voters
- [ ] OpenAPI generiert

---

#### TASK-004: [Name]Service Business Service
- **Typ**: [BE]
- **Schätzung**: 4h
- **Abhängig von**: TASK-003

**Dateien**:
- `src/Service/[Name]Service.php`

**Kriterien**:
- [ ] Service erstellt und injiziert
- [ ] Business-Logik implementiert
- [ ] Business-Exceptions
- [ ] Logs hinzugefügt

---

### Web Frontend-Schicht [FE-WEB]

#### TASK-005: Symfony [Name] Controller
- **Typ**: [FE-WEB]
- **Schätzung**: 2h
- **Abhängig von**: TASK-003

**Dateien**:
- `src/Controller/[Name]Controller.php`

**Routen**:
| Route | Methode | Aktion |
|-------|---------|--------|
| `/[name]` | GET | index |
| `/[name]/{id}` | GET | show |
| `/[name]/new` | GET/POST | new |
| `/[name]/{id}/edit` | GET/POST | edit |

**Kriterien**:
- [ ] Routen funktionsfähig
- [ ] IsGranted konfiguriert
- [ ] Flash Messages

---

#### TASK-006: Twig [Name] Templates
- **Typ**: [FE-WEB]
- **Schätzung**: 3h
- **Abhängig von**: TASK-005

**Dateien**:
- `templates/[name]/index.html.twig`
- `templates/[name]/show.html.twig`
- `templates/[name]/new.html.twig`
- `templates/[name]/edit.html.twig`
- `templates/[name]/_form.html.twig`

**Kriterien**:
- [ ] Turbo Frames/Streams
- [ ] Responsive
- [ ] WCAG 2.1 AA

---

#### TASK-007: Stimulus Controller
- **Typ**: [FE-WEB]
- **Schätzung**: 2h
- **Abhängig von**: TASK-006

**Dateien**:
- `assets/controllers/[name]_controller.js`

**Kriterien**:
- [ ] Kein Inline-JS
- [ ] Flüssige UX

---

### Mobile Frontend-Schicht [FE-MOB]

#### TASK-008: Dart [Name] Model
- **Typ**: [FE-MOB]
- **Schätzung**: 1h
- **Abhängig von**: TASK-003

**Dateien**:
- `lib/models/[name].dart`

```dart
@JsonSerializable()
class [Name] {
  final int id;
  // ...
  factory [Name].fromJson(Map<String, dynamic> json) => _$[Name]FromJson(json);
}
```

**Kriterien**:
- [ ] JSON-Serialisierung
- [ ] Nullable-Typen
- [ ] Äquivalent zur API

---

#### TASK-009: Flutter [Name] Repository
- **Typ**: [FE-MOB]
- **Schätzung**: 2h
- **Abhängig von**: TASK-008

**Dateien**:
- `lib/repositories/[name]_repository.dart`

**Kriterien**:
- [ ] Vollständiges CRUD
- [ ] HTTP-Fehlerbehandlung
- [ ] Auth-Header

---

#### TASK-010: [Name] Provider/Bloc
- **Typ**: [FE-MOB]
- **Schätzung**: 3h
- **Abhängig von**: TASK-009

**Dateien**:
- `lib/providers/[name]_provider.dart`
- oder `lib/blocs/[name]_bloc.dart`

**States**:
- Initial, Loading, Loaded, Error

---

#### TASK-011: Flutter [Name] Screen
- **Typ**: [FE-MOB]
- **Schätzung**: 4h
- **Abhängig von**: TASK-010

**Dateien**:
- `lib/screens/[name]/[name]_list_screen.dart`
- `lib/screens/[name]/[name]_detail_screen.dart`
- `lib/widgets/[name]/[name]_card.dart`

**Kriterien**:
- [ ] Material/Cupertino
- [ ] Pull-to-refresh
- [ ] Loading-States
- [ ] Fehlerbehandlung
- [ ] Navigation

---

### Test-Schicht [TEST]

#### TASK-012: Backend Unit Tests
- **Typ**: [TEST]
- **Schätzung**: 2h
- **Abhängig von**: TASK-004

**Dateien**:
- `tests/Unit/Service/[Name]ServiceTest.php`

**Kriterien**:
- [ ] Abdeckung > 80%
- [ ] Korrekte Mocks

---

#### TASK-013: API Tests
- **Typ**: [TEST]
- **Schätzung**: 2h
- **Abhängig von**: TASK-003

**Dateien**:
- `tests/Functional/Api/[Name]Test.php`

**Zu testende Endpunkte**:
| Methode | Nominalfall | Fehlerfall |
|---------|-------------|------------|
| GET | 200 | 401, 404 |
| POST | 201 | 422 |
| PUT | 200 | 403, 404 |
| DELETE | 204 | 403, 404 |

---

#### TASK-014: Flutter Widget Tests
- **Typ**: [TEST]
- **Schätzung**: 2h
- **Abhängig von**: TASK-011

**Dateien**:
- `test/widgets/[name]_card_test.dart`

---

#### TASK-015: E2E Tests
- **Typ**: [TEST]
- **Schätzung**: 3h
- **Abhängig von**: TASK-007, TASK-011

**Dateien**:
- `tests/E2E/[Name]FlowTest.php`
- `integration_test/[name]_flow_test.dart`

**Kriterien**:
- [ ] Web UND Mobile
- [ ] < 2 min

---

### Documentation & Review

#### TASK-016: Documentation
- **Typ**: [DOC]
- **Schätzung**: 1h
- **Abhängig von**: TASK-015

**Kriterien**:
- [ ] PHPDoc/DartDoc
- [ ] OpenAPI aktuell

---

#### TASK-017: Code Review
- **Typ**: [REV]
- **Schätzung**: 2h
- **Abhängig von**: TASK-016

**Checkliste**:
- [ ] Lesbarer Code
- [ ] Tests bestanden
- [ ] PHPStan/Dart Analyzer OK
- [ ] Sicherheit überprüft

---

## Abhängigkeitsgraph

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

## Zusammenfassung

| Schicht | # Aufgaben | Stunden |
|--------|-----------|--------|
| [DB] | 2 | 3h |
| [BE] | 2 | 7h |
| [FE-WEB] | 3 | 7h |
| [FE-MOB] | 4 | 10h |
| [TEST] | 4 | 9h |
| [DOC] | 1 | 1h |
| [REV] | 1 | 2h |
| **GESAMT** | **17** | **39h** |
````

### SCHRITT 5: Task Board erstellen

`board.md` erstellen (Vorlage `templates/board.md`):

```markdown
# Task Board - Sprint $ARGUMENTS

## Legende
- 🔲 To Do
- 🔄 In Progress
- 👀 In Review
- ✅ Done
- 🚫 Blocked

## 🔲 To Do
| ID | US | Aufgabe | Schätzung | Zugewiesen |
|----|-----|-------|------------|---------|

## 🔄 In Progress
| ID | US | Aufgabe | Gestartet | Zugewiesen |
|----|-----|-------|---------|---------|

## 👀 In Review
| ID | US | Aufgabe | Reviewer |
|----|-----|-------|----------|

## ✅ Done
| ID | US | Aufgabe | Tatsächlich | Abgeschlossen |
|----|-----|-------|------|---------|

## 🚫 Blocked
| ID | US | Grund | Aktion |
|----|-----|--------|--------|

## Metriken
- **Aufgaben**: X gesamt | X abgeschlossen (X%)
- **Stunden**: Xh geschätzt | Xh aufgewendet | Xh verbleibend
```

### SCHRITT 6: Tasks README erstellen

`tasks/README.md` erstellen:

```markdown
# Aufgaben - Sprint $ARGUMENTS

## Übersicht

| US | Titel | Punkte | Aufgaben | Stunden | Status |
|----|-------|--------|--------|--------|--------|

**Gesamt**: X Aufgaben | Xh

## Aufschlüsselung nach Typ

| Typ | Aufgaben | Stunden | % |
|------|--------|--------|---|
| [DB] | X | Xh | X% |
| [BE] | X | Xh | X% |
| [FE-WEB] | X | Xh | X% |
| [FE-MOB] | X | Xh | X% |
| [TEST] | X | Xh | X% |

## Dateien
- [TASK-001 - Titel](./TASK-001.md)

## Konventionen
- **ID**: TASK-[NNN] (z.B. TASK-005); die zugehörige US steht in den Task-Metadaten
- **Größe**: 0.5h - 8h max
- **Status**: 🔲 🔄 👀 ✅ 🚫
```

### SCHRITT 7: Übergreifende technische Aufgaben

Einen Abschnitt „Übergreifende technische Aufgaben“ in `tasks/README.md` hinzufügen und pro Aufgabe eine Datei `tasks/TASK-{ID}.md` erstellen (US: keine):

```markdown
# Übergreifende technische Aufgaben - Sprint $ARGUMENTS

## Infrastruktur

### TASK-018: Umgebungskonfiguration
- **Typ**: [OPS]
- **Schätzung**: 2h

### TASK-019: Dependency-Updates
- **Typ**: [OPS]
- **Schätzung**: 1h

## Refactoring

### TASK-020: [Identifiziertes Refactoring]
- **Typ**: [BE]
- **Schätzung**: Xh
- **Grund**: Technische Schulden

## CI/CD

### TASK-021: CI Pipeline
- **Typ**: [OPS]
- **Schätzung**: 2h
```

## US → TASKS MAPPING

| US-Typ | BE-Aufgaben | FE-Aufgaben | Test-Aufgaben | Gesamt ~|
|------------|-----------|-----------|--------------|--------|
| Einfaches CRUD | 4 | 7 | 4 | ~15 |
| Business-Feature | 5 | 8 | 5 | ~18 |
| Nur UI | 1 | 7 | 3 | ~11 |

## REGELN

1. **Schätzung in Stunden** (nicht Punkte)
2. **Eine Aufgabe = ein Verantwortlicher**
3. **Max 2 laufende Aufgaben pro Person**
4. **Explizite Abhängigkeiten** mit Mermaid
5. **Vertical Slicing**: Symfony + Flutter + API + DB

---
Sprint $ARGUMENTS Zerlegung jetzt ausführen.
