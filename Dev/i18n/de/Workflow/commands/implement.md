---
name: workflow-implement
description: "Die Implementierungsphase durchführen - TDD/BDD-Entwicklung eines Sprints, eines Epics, einer Story oder der Batch-Queue (sequenziell oder parallel über /team:sprint)"
argument-hint: "[<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]"
arguments:
  - name: sprint
    description: Sprint-Nummer, "next" oder "current" (Standard - aktueller Sprint)
    required: false
  - name: epic
    description: "--epic <EPIC> - alle Stories eines Epics implementieren (z. B. EPIC-001)"
    required: false
  - name: story
    description: "--story <US-ID> - eine einzelne Story implementieren (z. B. US-001)"
    required: false
  - name: queue
    description: "--queue - die Batch-Queue .bmad/batch-queue.yaml abarbeiten"
    required: false
---

# /workflow:implement

## Mission

Die Implementierungsphase durchführen: Entwicklung Sprint für Sprint (oder Epic / Story / Queue) mit TDD/BDD, gemäß dem technischen Design der vorherigen Phasen. Dies ist der einzige Einstiegspunkt für die Implementierung: Er ersetzt `/workflow:implement`, `/workflow:implement`, `/workflow:implement --epic` und `/workflow:implement --queue`.

**Standardmäßig sequenziell.** `--parallel N` delegiert die Ausführung an `/team:sprint` (Agent Teams).

## Verwendung

```bash
/workflow:implement [<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]
```

| Modus / Flag | Wirkung | Ersetzt |
|--------------|---------|---------|
| `<N>` / `next` / `current` | Implementiert Sprint N, den nächsten unvollständigen oder den aktiven Sprint (Standard: aktuell) | `/workflow:implement`, `/workflow:implement` |
| `--epic <EPIC>` | Reiht alle Stories eines Epics ein und implementiert sie, Abhängigkeiten zuerst | `/workflow:implement --epic <EPIC>` |
| `--story <US-ID>` | Implementiert eine einzelne Story (Task-Schleife + Validierung) | (eine Story) |
| `--queue` | Arbeitet die Batch-Queue `.bmad/batch-queue.yaml` ab | `/workflow:implement --queue` |
| `--resume` | Setzt ab dem letzten Checkpoint fort (gestoppter Sprint oder unterbrochene Queue) | `/workflow:implement --queue --resume` |
| `--parallel N` | Führt bis zu N unabhängige Stories parallel aus, indem an `/team:sprint` delegiert wird | `/workflow:implement --queue --parallel N` |
| `--auto` | Startet sofort, ohne Bestätigungsabfrage | `--auto` |
| `--dry-run` | Zeigt eine Vorschau des Ausführungsplans; nichts wird geändert | `--dry-run` |

**Einzige Wahrheitsquelle:** Jede Statusänderung wird in `.bmad/sprint-status.yaml` geschrieben (Schema: `.claude/templates/project/sprint-status.md`) - Story-Übergänge, `tdd_phase`, Task-Status, `tasks.completed` und `history`. Markdown-Dateien enthalten nur Inhalt, niemals den Status.

## Wann verwenden

- Nach `/workflow:design` (Standard/Enterprise) und `/workflow:start <N>` (Sprint-Ordner, Tasks)
- Nach `/workflow:init` im Quick-Flow-Track
- Wenn Sie bereit sind zu programmieren

## Voraussetzungen

Standard/Enterprise:
- Tech Spec unter `project-management/tech-spec.md`, Backlog unter `project-management/backlog/`
- Sprint mit zerlegten Tasks in `project-management/sprints/sprint-{N}-{slug}/` (`sprint-goal.md`, `board.md`, `tasks/TASK-*.md`) - `/workflow:start <N>` (oder `/workflow:start <N> --tasks-only`) ausführen, falls sie fehlen
- Stories in `.bmad/sprint-status.yaml` vorhanden

Quick Flow: ein klares Verständnis des zu implementierenden Bugs bzw. Features.

## Plan Mode

> **Der Plan Mode ist verpflichtend.** Vor jedem Task aktiviert Claude den Plan Mode, um den betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und Ihre Freigabe abzuwarten, bevor etwas geändert wird.

## Workflow

### Schritt 1: Umfang auswählen

1. Die Argumente auswerten (Modus, dann Flags). Ohne Modus wird der aktuelle Sprint verwendet.
2. `.bmad/sprint-status.yaml` lesen und die Liste der infrage kommenden Stories aufbauen:
   - `<N>`: die Stories des Sprints in `ready-for-dev` oder `in-progress`
   - `--epic <EPIC>`: Stories, deren `epic_id` übereinstimmt, nicht abgeschlossen, nicht blockiert (blockierte werden zur Prüfung markiert)
   - `--story <US-ID>`: genau diese Story
   - `--queue`: Stories mit Status `pending` in `.bmad/batch-queue.yaml`, nach Priorität sortiert
3. Bei einem Sprint zuerst `/gate:check sprint` ausführen; schlägt das Gate fehl, die Probleme anzeigen und stoppen.

```
Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end
   3 User Stories, 17 Tasks
   To Do: 15 | In Progress: 2 | Done: 0
```

### Schritt 2: Ausführungsplan erstellen

1. Die Abhängigkeiten zwischen Stories analysieren und den Abhängigkeitsgraphen aufbauen.
2. Die Stories ordnen: zuerst ohne Abhängigkeiten, dann nach Priorität, dann die niedrigste ID zuerst.
3. Die parallel ausführbaren Gruppen identifizieren.
4. Die Queue nach `.bmad/batch-queue.yaml` schreiben (für `--epic` und Sprints mit mehreren Stories):

```yaml
queue:
  - story_id: "US-010"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-011"
    priority: 2
    status: "pending"
    dependencies: ["US-010"]
```

Mit `--dry-run` den Plan anzeigen und stoppen:

```
Implement: EPIC-002 (DRY RUN)
Stories: 5 | Total points: 21

[1] US-010: User registration (5 pts)  deps: none
[2] US-011: User login (5 pts)         deps: US-010
[3] US-012: Profile page (5 pts)       deps: US-010
[4] US-013: Password reset (3 pts)     deps: US-010, US-011
[5] US-014: Email verification (3 pts) deps: US-010

Parallelizable after US-010: US-011, US-012, US-014
DRY RUN - no changes made. Run without --dry-run to execute.
```

Ohne `--auto` vor der Ausführung um Bestätigung bitten.

### Schritt 3: Ausführen

- **Sequenziell (Standard):** Die Stories nacheinander mit der unten beschriebenen Story-Schleife abarbeiten, mit einem Checkpoint nach jeder Story.
- **`--parallel N`:** Die unabhängigen Stories (ohne offene Abhängigkeit) an `/team:sprint` übergeben, das bis zu N Teammates parallel startet. `/team:sprint` schreibt seine Übergänge in dieselbe `.bmad/sprint-status.yaml`; Stories mit Abhängigkeiten warten, bis ihre Voraussetzungen `done` sind.

```
Mode: Parallel (3 workers)
Worker 1: US-010 - User registration       [running]
Worker 2: (waiting for dependencies)
[10:15] US-010 done -> starting US-011, US-012, US-014 in parallel
[10:30] US-013 done (deps US-010, US-011 satisfied)
```

#### Story-Schleife

Für jede Story in `ready-for-dev` oder `in-progress`:

1. **Die Story auf `in-progress` setzen** (`status`, `previous_status`, `tdd_phase`, `history`-Eintrag im YAML).
2. **Die Akzeptanzkriterien anzeigen** (Gherkin).
3. **Jeden Task** mit der Task-Schleife abarbeiten.

```
US-001: User Authentication (5 pts)  -  in-progress

   GIVEN a registered user with valid credentials
   WHEN they submit the login form
   THEN they should see their dashboard
   AND a session should be created

   TASK-001 [DB] Create User entity .............. to-do
   TASK-002 [BE] Authentication service .......... to-do
   TASK-003 [FE-WEB] Login form .................. to-do
   TASK-004 [TEST] E2E authentication tests ...... to-do
```

#### Task-Schleife (TDD)

Für jeden Task in `to-do`, in der unten angegebenen Verarbeitungsreihenfolge:

**3.1 Den Task anzeigen** (Schätzung, Beschreibung, zu ändernde Dateien, Definition of Done).

**3.2 Plan Mode (verpflichtend).** Den betroffenen Code und die Abhängigkeiten erkunden, die Erkenntnisse dokumentieren und dann einen Plan vorschlagen: zu erstellende/ändernde Dateien, zuerst zu schreibende Tests, Risiken und Gegenmaßnahmen. Auf die Freigabe warten:

```
[continue] Fortfahren   [skip] Task überspringen   [block] Als blockiert markieren   [stop] Stoppen (Zustand gespeichert)
```

**3.3 Den Task auf `in-progress` setzen.** In `.bmad/sprint-status.yaml`: `stories.<US>.tasks.status.<TASK>: in-progress` setzen; beim ersten Task einer `ready-for-dev`-Story die Story auf `in-progress` setzen (`status`, `previous_status`, `tdd_phase`, Verlaufseintrag). `board.md` (generierte Ansicht) neu erzeugen und `index.md` aktualisieren.

**3.4 TDD-Zyklus.**

```
RED       Fehlschlagende Tests schreiben    -> FAILED (erwartet)
GREEN     Minimalen Code implementieren     -> PASSED
REFACTOR  Qualität verbessern               -> PASSED (keine Regression)
```

`tdd_phase` (`red` -> `green` -> `refactor`) in jeder Phase im YAML aktualisieren.

**3.5 Prüfung der Definition of Done.**

```
- [x] Code geschrieben und funktionsfähig
- [x] Tests bestanden (3/3)
- [ ] Code geprüft -> übernimmt TASK-XXX [REV]
```

**3.6 Den Task auf `done` setzen.** Die tatsächlich aufgewendete Zeit erfragen, dann aktualisieren:
- `.bmad/sprint-status.yaml`: `tasks.status.<TASK>: done` und `tasks.completed` (= Anzahl der `done`-Tasks)
- Inhalts-Metadaten der Task-Datei (`time_spent`, `updated_at`; kein Status)
- `board.md` (aus dem YAML neu erzeugt), `index.md`, Sprint-Metriken

**3.7 Conventional Commit** mit der Story-Referenz:

```
feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add unit tests for User entity

Refs: TASK-001, US-001
```

#### Story-Validierung

Sind alle Tasks einer Story `done`: jedes Akzeptanzkriterium prüfen, die E2E-Tests ausführen (falls vorhanden), das Quality Gate ausführen (`/gate:check story`, sofern konfiguriert) und die Story im YAML übergehen lassen (`in-progress` -> `review` -> `done`), mit `previous_status` und einem `history`-Eintrag. Den EPIC-Fortschritt aktualisieren (der EPIC-Status wird abgeleitet).

```
US-001 validation: 4/4 tasks, acceptance criteria met, E2E passed
US-001 -> done  |  EPIC-001: 1/3 stories (33%)
```

Nach jedem Übergang greifen die Regeln `routing.auto_transitions` (siehe `/project:backlog move story --auto`).

### Schritt 4: Fehler und Blockaden behandeln

- **Blockierter Task:** Im YAML mit Begründung als `blocked` markieren, dann wählen: [1] überspringen und mit dem nächsten nicht blockierten Task fortfahren, [2] versuchen, die Blockade aufzulösen, [3] stoppen.
- **Fehlgeschlagene Story (Queue / Epic):** Mit Fehler, TDD-Phase und letztem Checkpoint als `failed` markieren; davon abhängige Stories werden übersprungen. `resume_on_failure` aus den Queue-Einstellungen anwenden (fortfahren oder stoppen). Die Ursache beheben, dann `/workflow:implement --resume` ausführen.

### Schritt 5: Checkpoints und Wiederaufnahme

Nach jeder Story wird in `.bmad/batch-queue.yaml` ein Checkpoint gespeichert:

```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

`--resume` lädt den Checkpoint (bei einem gestoppten Sprint den zuletzt abgeschlossenen Task) und macht weiter:

```
Resuming Sprint 1: Walking Skeleton - 8/17 tasks (47%)
Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller - continue? [y/n]
```

### Schritt 6: Bericht

```
Batch complete: 5 done | 0 failed | 0 skipped
US-010 45 min | US-011 38 min | US-012 52 min | US-013 28 min | US-014 35 min
Total 3h 18min - average 40 min per story
```

Wenn alle Stories eines Sprints `done` sind:

```
Sprint 1 complete: 5/5 stories, 21 points, velocity 21 pts/sprint
Hours: 38h actual vs 42h estimated | Test coverage: 82% | Commits: 23
sprint-review.md generated, sprint-retro.md template ready
```

Nächste Schritte: `/workflow:review`, `/workflow:retro`, `/workflow:implement <N+1>` oder `/workflow:status`.

## Verarbeitungsreihenfolge der Tasks

| Reihenfolge | Typ | Beschreibung |
|-------------|-----|--------------|
| 1 | `[DB]` | Datenbank (Entities, Migrationen, Repositories) |
| 2 | `[BE]` | Backend (Services, APIs, Geschäftslogik) |
| 3 | `[FE-WEB]` | Frontend Web (Controller, Templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (Screens, Blocs, Widgets) |
| 5 | `[TEST]` | Zusätzliche Tests (E2E, Performance) |
| 6 | `[DOC]` | Dokumentation |
| 7 | `[REV]` | Code-Review |

## Steuerbefehle

| Befehl | Aktion |
|--------|--------|
| `continue` | Den Plan freigeben und fortfahren |
| `skip` | Diesen Task überspringen (bleibt `to-do`) |
| `block [Grund]` | Den Task mit Begründung als `blocked` markieren |
| `stop` | Stoppen und den aktuellen Zustand speichern |
| `status` | Den Fortschritt anzeigen (`/workflow:status`) |
| `board` | Das Kanban-Board anzeigen (`/workflow:status --board`) |

## Automatische Aktualisierungen

Bei jeder Statusänderung gehen alle Status nach `.bmad/sprint-status.yaml`; Markdown-Dateien erhalten nur Inhalt.

1. **sprint-status.yaml:** Task-Status (`to-do | in-progress | done | blocked`), `tasks.completed`, `tdd_phase`, Story-Übergänge (`ready-for-dev` -> `in-progress` -> `review` -> `done`) mit `previous_status` und einem `history`-Eintrag
2. **Task-Datei:** `time_spent`, `updated_at` (kein Status)
3. **User-Story-Datei:** Anzeige des Task-Fortschritts (kein Status)
4. **EPIC-Datei:** Story-Fortschritt (Status abgeleitet)
5. **board.md:** Kanban-Spalten aus dem YAML neu erzeugt
6. **index.md:** globale Metriken

## Aktualisierte Dateien

| Datei | Aktualisierungen |
|-------|------------------|
| `.bmad/sprint-status.yaml` | Story-Status, `tdd_phase`, Task-Status, `tasks.completed`, Verlauf |
| `.bmad/batch-queue.yaml` | Queue-Einträge, Status, Checkpoints |
| `project-management/backlog/user-stories/US-XXX.md` | Task-Fortschritt (nur Inhalt) |
| `project-management/backlog/epics/EPIC-XXX.md` | Story-Fortschritt |
| `project-management/sprints/sprint-{N}-{slug}/board.md` | Kanban-Spalten (neu erzeugt) |
| `project-management/sprints/sprint-{N}-{slug}/tasks/*.md` | Aufgewendete Zeit (kein Status) |
| `project-management/sprints/sprint-{N}-{slug}/sprint-review.md` | Am Ende erzeugt |

## Queue-Konfiguration

Einstellungen in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # or "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600
settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

Ist Ralph konfiguriert, in `ralph.yml` `bmad_integration.batch_queue_file: ".bmad/batch-queue.yaml"` setzen, um die Batch-Ausführung zu integrieren.

## Quick-Flow-Modus

Für Bugfixes und kleine Features ist keine Sprint-Struktur nötig:
- Bugfixes: `/qa:tdd` (TDD-Ansatz)
- Kleine Features: die technologiespezifischen `/{tech}:*`-Befehle
- Nachverfolgung: `/project:backlog add task`, dann `/project:backlog move task done`

## Beteiligte Agenten

- **tech-lead**: Task-Zerlegung, Architekturberatung
- **tdd-coach**: TDD/BDD-Methodikberatung
- **{tech}-reviewer**: Code-Review (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD und Deployment

## Verwandte Befehle

- `/workflow:design` - Vorherige Phase; `/workflow:start <N>` - Sprint und seine Tasks erstellen
- `/workflow:status` - Fortschritt, Board (`--board`), Queue (`--queue`), Gates (`--gates`)
- `/team:sprint` - Paralleler Motor für `--parallel N`; `/team:delivery` - Parallele Erstellung + Implementierung
- `/project:backlog move story <US> <status>` - Manueller Story-Übergang
- `/qa:tdd` - Schnelle Bugfixes
- `/workflow:review` - Sprint-Review-Zeremonie
- `/workflow:retro` - Sprint-Retrospektive
