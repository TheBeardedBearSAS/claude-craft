---
name: workflow-status
description: "Wo stehe ich + nächste Aktion: Workflow-Phase, Sprint-Metriken, Kanban-Board (--board), Batch-Queue (--queue), Stand-up (--standup) und Gates (--gates)"
argument-hint: "[--board|--queue|--standup|--gates] [--sprint N] [--verbose]"
arguments:
  - name: view
    description: "Optionale Ansicht: --board, --queue, --standup oder --gates (Standard: Phase + Sprint-Metriken + nächste Aktion)"
    required: false
  - name: sprint
    description: "Sprint-Nummer (--sprint N), standardmäßig der aktuelle Sprint"
    required: false
  - name: verbose
    description: Detaillierten Status mit allen Artefakten anzeigen
    required: false
---

# /workflow:status

## Mission

Die Frage „Wo stehe ich und was tue ich als Nächstes?" beantworten. Die Workflow-Phase, die Sprint-Metriken und die empfohlene nächste Aktion anzeigen. Derselbe Befehl rendert außerdem das Kanban-Board, die Batch-Queue, das tägliche Stand-up und die Gate-Zusammenfassung.

Dieser Befehl **aktualisiert** bei jeder Ausführung `project-management/workflow-status.yaml` (`current_phase`, `artifacts`, `next_action`, `next_command`), sodass die Datei stets widerspiegelt, was auf der Festplatte vorhanden ist.

## Verwendung

| Modus | Was er tut | Ersetzt |
|------|--------------|----------|
| `/workflow:status` | Standardansicht: Workflow-Phase + Sprint-Metriken + nächste Aktion | `/workflow:status` |
| `/workflow:status --verbose` | Dasselbe, mit allen Artefakten und den Health-Checks | - |
| `/workflow:status --board` | Kanban-Board des Sprints, generiert `board.md` neu | `/workflow:status --board` |
| `/workflow:status --queue [--history]` | Batch-Queue (`.bmad/batch-queue.yaml`) und ihr Verlauf | `/workflow:status --queue` |
| `/workflow:status --standup [date]` | Zusammenfassung für das tägliche Stand-up (gestern / heute / Blocker) | `/workflow:status --standup` |
| `/workflow:status --gates` | Zusammenfassung der Quality Gates, führt `/gate:check all` aus bzw. liest dessen Ergebnis | - |
| `--sprint N` | Sprint N statt des aktuellen anvisieren (kombinierbar mit jeder Ansicht) | - |

```bash
/workflow:status                   # Phase + Sprint-Metriken + nächste Aktion
/workflow:status --verbose         # Detailansicht mit allen Artefakten
/workflow:status --board           # Kanban-Board des aktuellen Sprints
/workflow:status --board --sprint 2
/workflow:status --queue --history
/workflow:status --standup
/workflow:status --gates
```

## Quellen der Wahrheit

| Daten | Quelle |
|------|--------|
| Workflow-Phase, Artefakte, nächste Aktion | `project-management/workflow-status.yaml` (von diesem Befehl aktualisiert) |
| Status von Stories und Tasks, TDD-Phase, Routing | `.bmad/sprint-status.yaml` (einzige Quelle der Wahrheit für den Status; Schema in `.claude/templates/project/sprint-status.md`) |
| Inhalt (Titel, Schätzungen, Typen, AC) | Markdown-Dateien in `project-management/` (niemals eine Quelle für den Status) |
| Batch-Queue | `.bmad/batch-queue.yaml` |

## Ablauf (Standardansicht)

### Schritt 1: Workflow-Zustand lesen und aktualisieren

1. `project-management/workflow-status.yaml` lesen; falls nicht vorhanden, den unten stehenden Bildschirm „Kein Workflow initialisiert" anzeigen.
2. Prüfen, welche Artefakte existieren (`prd.md`, `tech-spec.md`, `backlog/`, `sprints/`, ...) und den Status jedes Artefakts setzen.
3. `current_phase` ableiten und `artifacts`, `next_action`, `next_command`, `updated_at` in der Datei aktualisieren.

### Schritt 2: Sprint-Metriken lesen

1. Den Sprint bestimmen (`--sprint N` oder der aktuelle: der Sprint mit nicht abgeschlossenen Stories) und dessen `sprint-goal.md` lesen.
2. `.bmad/sprint-status.yaml` lesen: Status von Stories/Tasks, `tdd_phase`, Zuweisungen, Blocker.
3. Punkte, Tasks und Stunden (erledigt vs. Ziel), Fortschritt pro Story, Burndown, Blocker und Risiken berechnen.
4. BMAD-Routing ergänzen: Zähler der Zustandsmaschine, TDD-Phase der Stories in Bearbeitung, Auto-Routing-Vorschläge (Stories, deren Tasks alle erledigt sind, sind bereit für `review`).

### Schritt 3: Anzeige

Phasenansicht, Sprint-Metriken, dann die nächste Aktion und ihr Befehl.

## Ausgabeformat

### Standardansicht

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW-STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Projekt: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Aktuelle Phase: Implementierung ████████░░░░░░░░ 45%              ║
╠══════════════════════════════════════════════════════════════════╣
║  Phase 1: Analyse         ⏭️  Übersprungen (Standard-Track)       ║
║  Phase 2: Planung         ✅ PRD, Backlog (18 Stories, 89 Pkt.)   ║
║  Phase 3: Design          ✅ Tech Spec, Architektur, 3 ADRs       ║
║  Phase 4: Implementierung 🔄 Sprint 1 (Tag 8/14)                  ║
╠══════════════════════════════════════════════════════════════════╣
║ SPRINT 1 - Walking Skeleton                                       ║
║ Punkte: 5/10 🟡 50%  Tasks: 8/16  Stunden: 28h/62h                ║
║ Zustand: [backlog 2] [ready-for-dev 3] [in-progress 2] [review 1] ║
║          [done 4] [blocked 1]                                     ║
║ Blocker: TASK-008 (wartet auf Auth-API, 2 Tage)                   ║
╠══════════════════════════════════════════════════════════════════╣
║ NÄCHSTE AKTION: Den Sprint fortsetzen                             ║
║ BEFEHL: /workflow:implement                                       ║
╚══════════════════════════════════════════════════════════════════╝
```

### Block der Sprint-Metriken

```
Gesamtfortschritt: ██████████████░░░░░░░░░░░░░░░░░░ 45%

│ US      │ Name         │ Pkt │ Tasks │ TDD   │ Status         │
├─────────┼──────────────┼─────┼───────┼───────┼────────────────┤
│ US-005  │ User-Login   │ 5   │ 3/5   │ Green │ 🟡 In Progress │
│ US-007  │ Passwort-Reset │ 3 │ 0/4   │ Red   │ 🟡 In Progress │

Burndown: 34h verbleibend, ideal 28h → 🟡 leicht im Rückstand (6h)
Risiken: 🔴 Mobile seit 2 Tagen blockiert → TASK-005 priorisieren
Auto-Routing: US-008 hat alle Tasks abgeschlossen → /project:backlog move story US-008 review
```

Der Bericht wird außerdem in `project-management/sprints/sprint-{N}-{slug}/status-YYYY-MM-DD.md` gespeichert.

### Ausführliche Ansicht (--verbose)

Ergänzt pro Phase jedes Artefakt mit Pfad, Version und Zählwerten (PRD-Anforderungen, Personas, EPICs und Stories nach Priorität, geplante Sprints, Stack der Tech Spec, Architekturdiagramme, entworfene/verbleibende API-Endpunkte, ADRs, Security-Review), dann:

```
║ WORKFLOW-GESUNDHEIT                                               ║
║ ✅ PRD stimmt mit dem Backlog überein                             ║
║ ✅ Tech Spec deckt alle Anforderungen ab                          ║
║ ⚠️  API-Design unvollständig (6 Endpunkte verbleibend)            ║
║ ⚠️  Security-Review ausstehend                                    ║
║ NÄCHSTE AKTIONEN                                                  ║
║ 1. API-Design abschließen   → /workflow:design                    ║
║ 2. Dann Implementierung starten → /workflow:implement             ║
```

### Kein Workflow initialisiert

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  Für dieses Projekt wurde kein Workflow initialisiert         ║
║  Zum Starten ausführen:  /workflow:init                           ║
║  • Den Projektkontext analysieren                                 ║
║  • Den Track empfehlen (Quick/Standard/Enterprise)                ║
║  • Das Workflow-Tracking initialisieren                           ║
╚══════════════════════════════════════════════════════════════════╝
```

### Quick-Flow-Status

Keine Phasen erforderlich. Den aktuellen Task anzeigen, falls getrackt (z. B. `TASK-042: Fix login validation bug, In Progress`), sowie die verfügbaren Befehle: `/qa:tdd` (mit TDD fortfahren), `/project:backlog move task <TASK> done` (als abgeschlossen markieren), `/workflow:init` (einen neuen Workflow starten).

## `--board`: Kanban-Board

Das Kanban-Board des aktuellen Sprints (oder `--sprint N`) anzeigen.

1. Den Sprint bestimmen (angegebene Nummer, andernfalls der aktuelle Sprint mit nicht erledigten Tasks).
2. Die Status aus `.bmad/sprint-status.yaml` lesen (`stories.<US>.status`, `stories.<US>.tasks.status.<TASK>`) und den Inhalt (Titel, Schätzungen, Typen) aus den Markdown-Dateien der US und Tasks (`tasks/TASK-*.md`).
3. Tasks nach Spalte gruppieren: 🔴 To Do, 🟡 In Progress, ⏸️ Blocked, 🟢 Done.
4. Tasks pro Spalte, geschätzte und abgeschlossene Stunden, Fortschrittsprozentsatz, Fortschritt nach Typ (`[DB]`, `[BE]`, `[WEB]`, `[MOB]`, `[TEST]`) und nach User Story berechnen.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Kanban-Board                                      ║
║  Ziel: Walking Skeleton - Auth + Erste Seite                     ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ E2E-Tests       │ Auth-Service    │ Login-Screen    │ User-Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ ⚠️ Wartet auf API │ 2h @US-001    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Tasks: ████████████████████░░░░░░░░░░ 8/16 (50%)
Stunden: ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Blockiert: 1 Task (6h)
```

Bei vielen Tasks das kompakte Format verwenden:

```
📋 Sprint 1 - Kanban (32 Tasks)
🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (Konfiguration)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014
Fortschritt: 13/32 (41%) | 45h/98h
```

`board.md` ist eine **generierte Ansicht**: Nach der Anzeige wird die Datei `board.md` des Sprints aus `.bmad/sprint-status.yaml` neu generiert (Template `.claude/templates/project/board.md`). Sie wird niemals von Hand bearbeitet und ist niemals die Quelle eines Status.

Aktionen: `/project:backlog move task TASK-XXX in-progress` (starten), `/project:backlog move task TASK-XXX done` (abschließen).

## `--queue`: Batch-Queue

Den Status der Batch-Queue anzeigen (`/workflow:implement --queue`).

1. `.bmad/batch-queue.yaml` lesen, die Einträge parsen und den Checkpoint laden.
2. Stories nach Status gruppieren: `pending` (wartend), `running` (in Bearbeitung), `completed`, `failed` (Fehler), `skipped` (eine Abhängigkeit ist fehlgeschlagen).
3. Den Zustand der Queue anzeigen; mit `--history` zusätzlich die abgeschlossenen und fehlgeschlagenen Stories mit Zeitangaben.

```
═══════════════════════════════════════════════════════
              Batch-Queue-Status
═══════════════════════════════════════════════════════
Modus: Sequenziell
Checkpoint: US-011 (2026-01-29 10:45:00)

⏳ Pending: 3   🔄 Running: 1   ✅ Completed: 2   ❌ Failed: 0   ⏭️ Skipped: 0

Laufend:
🔄 US-012: Profilseite
   Gestartet: 2026-01-29 10:45:00 (vor 15 Min.) | TDD-Phase: green | Task: 2/4

Wartend:
[4] US-013: Passwort-Reset (Abhängigkeiten: US-010 ✅, US-011 ✅)
[5] US-014: E-Mail-Verifizierung (Abhängigkeiten: US-010 ✅)

██████████░░░░░░░░░░ 50% (3/6 Stories) | Geschätzter Abschluss: ~1h 30m
═══════════════════════════════════════════════════════
```

`--history` ergänzt die Tabelle der abgeschlossenen Stories (Story, gestartet, abgeschlossen, Dauer), die fehlgeschlagenen Stories (Fehler, TDD-Phase), die übersprungenen (Grund, z. B. „Hängt von fehlgeschlagener US-013 ab") und Statistiken: Gesamtzeit, Durchschnitt pro Story, Erfolgsquote (5/6 = 83%), abgeschlossene Punkte.

Eine leere Queue zeigt, wie sie befüllt wird: `/workflow:implement --queue` oder `/workflow:implement --epic EPIC-001`.

Queue-Verwaltung:

```bash
.bmad/lib/batch-executor.sh add US-001 1   # eine Story hinzufügen (Priorität 1)
# Eine fehlgeschlagene Story wiederholen: .bmad/batch-queue.yaml → US-013: status: pending
/workflow:implement --queue                # die Queue ausführen
/workflow:implement --queue --resume       # ab dem Checkpoint fortsetzen
# Die Queue leeren:       .bmad/batch-queue.yaml → queue: []
```

Format der Queue-Datei:

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```

## `--standup`: tägliches Stand-up

Eine Zusammenfassung der Entwicklungsaktivität für das tägliche Stand-up erzeugen. Optionales Argument: ein Zeitraum (Standard: seit gestern).

1. Daten sammeln (Befehle über Docker ausführen, wenn sie von der Projektumgebung abhängen):

```bash
git log --since="yesterday" --oneline --all   # Commits seit gestern
git branch -a --sort=-committerdate | head -10
gh pr list --state open                       # offene PRs
gh issue list --assignee @me --state open     # aktuelle Issues
git status --short                            # lokale Änderungen
```

2. Den Sprint-Block aus `.bmad/sprint-status.yaml` lesen: Sprint-Nummer, Tag X/10, verbleibende Punkte, Burndown (📉 im Plan / 📈 voraus / 📊 im Rückstand).
3. Die Zusammenfassung erzeugen: erledigt (Commits, gemergte PRs, geschlossene Issues), geplant (in Bearbeitung nach Branch/Issue/Zuständigem/Status, noch zu starten), Blocker/Risiken (Blocker, Auswirkung, Aktion), aktive Pull Requests (Alter, Reviews), Notizen.
4. Kurzformat für Slack/Teams:

```markdown
**📅 Daily - {YYYY-MM-DD}**
**Gestern:** • PR #123 gemergt (Google OAuth) • 5 Commits auf feature/auth
**Heute:** • PR #125 abschließen (GitHub OAuth) • Issue #50 starten (Passwort-Reset)
**Blocker:** • ⚠️ Review für PR #125 ausstehend (@dev3)
**PRs zum Review:** • PR #127 - Fix user profile (0/2)
```

5. Team-Metriken über 7 Tage (Commits, PRs, Reviews, Issues pro Mitglied) und aktuelle Velocity (gelieferte Punkte pro Tag, kumuliert vs. ideal, z. B. „📈 1,6 Punkte voraus").

Stand-up-Regeln: maximal 15 Minuten für das gesamte Team, im Stehen, jeden Tag zur gleichen Zeit, keine Problemlösung (Parking Lot), Fokus auf das Sprint-Ziel. Anti-Patterns: Bericht an den Scrum Master, lange technische Diskussionen, vages „Ich habe an X gearbeitet". Alternatives Format „Walk the Board": Done → In Progress → To Do, Fokus auf das, was den Fortschritt blockiert.

Für einen täglichen Digest kann eine geplante GitHub Action (Cron `0 7 * * 1-5`) dieselben git/gh-Befehle ausführen und das Ergebnis in Slack posten.

## `--gates`: Gate-Zusammenfassung

Die Quality Gates zusammenfassen, indem `/gate:check all` ausgeführt (oder dessen letztes Ergebnis gelesen) wird.

| Gate | Schwellenwert |
|------|-----------|
| PRD | >= 80% |
| Tech Spec | >= 90% |
| INVEST | 6/6 |
| Sprint Ready | 100% |
| Story DoD | 100% |
| Spec Alignment | >= 85% |

```
GATES
✅ prd 86%   ✅ tech-spec 92%   ✅ invest 6/6
⚠️ sprint-ready 80%   ⏳ story-dod (US-005 in Bearbeitung)   ✅ spec-alignment 88%
Weiter: die Blocker von sprint-ready beheben → /gate:check sprint-ready
```

Für ein einzelnes Gate direkt `/gate:check <gate>` verwenden.

## Struktur der Status-Datei

Der Workflow-Status wird aus `project-management/workflow-status.yaml` gelesen und dorthin geschrieben:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Standard track - analysis not required"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
  implementation:
    status: pending
    sprints:
      - name: sprint-1-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Complete API design"
next_command: "/workflow:design"
```

Status von Stories und Tasks werden hier NICHT gespeichert: Sie liegen ausschließlich in `.bmad/sprint-status.yaml`.

## Verwandte Befehle

- `/workflow:init` - Den Workflow initialisieren
- `/workflow:plan` - Planungsphase (`--research`, `--only=prd`, `--only=backlog`)
- `/workflow:design` - Design-Phase
- `/workflow:start` - Sprint-Vorbereitung
- `/workflow:implement` - Implementierungsphase
- `/project:backlog` - Stories und Tasks hinzufügen, auflisten, bearbeiten, verschieben
- `/gate:check` - Quality Gates

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                    NÄCHSTER SCHRITT                      ║
╠══════════════════════════════════════════════════════════╣
║  Abhängig von der aktuellen Phase:                       ║
║                                                          ║
║  • init      → /workflow:plan                            ║
║  • plan      → /workflow:design                          ║
║  • design    → /workflow:start {N}                       ║
║  • start     → /workflow:implement                       ║
║  • implement → /workflow:review                          ║
║  • review    → /workflow:retro                           ║
║  • retro     → /workflow:start {N+1}                     ║
║                                                          ║
║  Jederzeit: /workflow:status                             ║
╚══════════════════════════════════════════════════════════╝
```
