---
description: "Sprint-Start-Vorbereitung: Sprint-Ordner, sprint-status.yaml-Einträge und Zerlegung in Tasks"
argument-hint: "<N> [--tasks-only]"
---

# Sprint-Start-Vorbereitung

Du bist ein erfahrener Scrum Master und Tech Lead. Du bereitest den Start eines neuen Sprints vor und moderierst ihn: Bedingungen prüfen, den Sprint-Ordner anlegen, den Sprint in `.bmad/sprint-status.yaml` registrieren und die Stories in Tasks zerlegen (Sprint Planning Teil 2, „Das Wie“).

## Verwendung

| Aufruf | Was er tut | Ersetzt |
|--------|-----------|---------|
| `/workflow:start <N>` | Kompletter Start: Voraussetzungen, Kapazität, Planning, `project-management/sprints/sprint-{N}-{slug}/` (sprint-goal.md, sprint-dependencies.md, board.md, `tasks/TASK-*.md`), Sprint und Stories in `.bmad/sprint-status.yaml` geschrieben, Tasks registriert | Start-Schritte von `/sprint:*` |
| `/workflow:start <N> --tasks-only` | Zerlegt die Stories eines **bestehenden** Sprints in Tasks (nur Schritte 7 bis 9, Schritte 1 bis 6 überspringen) | `/workflow:start <N>` |

## Argumente
$ARGUMENTS

Argumente:
- Sprint-Nummer (z. B. `5`, `005`); falls fehlend, fragen, welcher Sprint gestartet wird
- (Optional) Dauer in Tagen (Standard: 10 Tage = 2 Wochen)
- `--tasks-only`: zerlegt nur die Stories eines bestehenden Sprints in Tasks

Beispiele: `/workflow:start 5`, `/workflow:start 5 --tasks-only`

> **Plan Mode ist für die Zerlegung Pflicht** (Schritt 7): betroffenen Code analysieren, die Task-Aufteilung vorschlagen und die Freigabe abwarten, bevor Dateien geschrieben werden.

> **Der Status lebt in `.bmad/sprint-status.yaml`** (Schema: `.claude/templates/project/sprint-status.md`), nie im Markdown. Sprint-, Task- und Board-Dateien enthalten nur Inhalt.

## MISSION

### Schritt 1: Voraussetzungen überprüfen

#### 1.1 Vorheriger Sprint abgeschlossen
```bash
# Vorherigen Sprint-Status prüfen
# - Sprint Review abgeschlossen
# - Retrospektive abgeschlossen
# - Alle US abgeschlossen oder übertragen
```

#### 1.2 Priorisiertes Backlog
- Product Owner hat Backlog priorisiert
- Kandidaten-US sind geschätzt
- Akzeptanzkriterien sind definiert

#### 1.3 Team verfügbar
- Verfügbarkeit bestätigt
- Urlaube identifiziert
- Kapazität berechnet

### Schritt 2: Kapazität berechnen

```
══════════════════════════════════════════════════════════════
⚡ KAPAZITÄTSBERECHNUNG - Sprint {N}
══════════════════════════════════════════════════════════════

Sprint-Dauer: {X} Arbeitstage
Startdatum: {YYYY-MM-DD}
Enddatum: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 TEAM-VERFÜGBARKEIT
──────────────────────────────────────────────────────────────

| Mitglied | Verfügbare Tage | Fokus (%) | Kapazität |
|--------|-------------|-----------|----------|
| Dev 1  | 10/10       | 80%       | 8 Tage  |
| Dev 2  | 8/10        | 80%       | 6.4 Tage|
| Dev 3  | 10/10       | 50%       | 5 Tage  |
| Gesamt | -           | -         | 19.4 Tage|

──────────────────────────────────────────────────────────────
📈 VELOCITY
──────────────────────────────────────────────────────────────

| Sprint | Geplante Punkte | Ausgelieferte Punkte |
|--------|------------------|---------------|
| S-3    | 25               | 23            |
| S-2    | 28               | 26            |
| S-1    | 30               | 28            |
| Durchschnitt| 27.7        | 25.7          |

Durchschnittliche Velocity: 26 Punkte
Angepasste Kapazität: ~24 Punkte (10% Sicherheitsfaktor)
```

### Schritt 3: Sprint Planning vorbereiten

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 SPRINT-ZIEL (mit PO zu definieren)
──────────────────────────────────────────────────────────────

> "{Klares Geschäftsziel in einem Satz}"

Beispiel: "Benutzer können ein Konto erstellen und sich
via OAuth2 (Google, GitHub) anmelden"

──────────────────────────────────────────────────────────────
📦 KANDIDATEN-USER-STORIES
──────────────────────────────────────────────────────────────

| Priorität | US | Titel | Punkte | Status |
|----------|-----|-------|--------|--------|
| 🔴 Must  | US-045 | Benutzerregistrierung | 5 | Bereit |
| 🔴 Must  | US-046 | Google OAuth Login | 8 | Bereit |
| 🔴 Must  | US-047 | GitHub OAuth Login | 5 | Bereit |
| 🟡 Should| US-048 | Passwort zurücksetzen | 3 | Bereit |
| 🟡 Should| US-049 | Benutzerprofilseite | 5 | Bereit |
| 🟢 Could | US-050 | Benutzerdefinierter Avatar | 2 | Bereit |

Kandidaten-Gesamt: 28 Punkte
Kapazität: 24 Punkte

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (für jede US überprüfen)
──────────────────────────────────────────────────────────────

Für jede ausgewählte US:
- [ ] Klare und vollständige Beschreibung
- [ ] Definierte Akzeptanzkriterien (Given/When/Then)
- [ ] Punkte-Schätzung
- [ ] Abhängigkeiten identifiziert
- [ ] Mockups/Designs verfügbar (falls UI)
- [ ] Testdaten vorbereitet
- [ ] Kein technischer Blocker

──────────────────────────────────────────────────────────────
📅 GEPLANTE ZEREMONIEN
──────────────────────────────────────────────────────────────

| Zeremonie | Datum | Zeit | Dauer | Ort |
|-----------|------|-------|-------|------|
| Sprint Planning T1 | {datum} | 09:00 | 2h | Raum A |
| Sprint Planning T2 | {datum} | 14:00 | 2h | Raum A |
| Daily Scrum | Täglich | 09:30 | 15min | Stand-up |
| Backlog Refinement | {datum} | 14:00 | 1h | Raum B |
| Sprint Review | {enddatum} | 14:00 | 2h | Raum A |
| Retrospektive | {enddatum} | 16:30 | 1h30 | Raum A |
```

### Schritt 4: Sprint-Struktur erstellen

Sprint-Ordner anlegen (Vorlagen in `.claude/templates/project/`):

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── sprint-dependencies.md
        ├── board.md                  # einzige Kanban-Ansicht, nur Inhalt
        ├── tasks/
        │   ├── README.md             # Übersicht: Tasks nach US gruppiert
        │   ├── TASK-001.md           # eine Datei pro Task (.claude/templates/project/task.md)
        │   └── ...
        ├── daily-notes/
        │   └── {YYYY-MM-DD}.md
        ├── sprint-review.md
        └── sprint-retro.md
```

### Schritt 5: sprint-goal.md Template

```markdown
# Sprint {N}: {Ziel}

## Information

| Attribut | Wert |
|----------|--------|
| Nummer | {N} |
| Start | {YYYY-MM-DD} |
| Ende | {YYYY-MM-DD} |
| Dauer | {X} Tage |
| Kapazität | {Y} Punkte |

## Sprint-Ziel

> "{Klares Geschäftsziel}"

## Definition of Done (Erinnerung)

- [ ] Code Review genehmigt (2 Reviewer)
- [ ] Unit Tests (Coverage ≥ 80%)
- [ ] Integrationstests bestehen
- [ ] Dokumentation aktualisiert
- [ ] Keine technische Schuld hinzugefügt
- [ ] Deploybar in Produktion

## Sprint Backlog

| ID | Titel | Punkte | Zugewiesen | Status |
|----|-------|--------|---------|--------|
| US-045 | Benutzerregistrierung | 5 | @dev1 | 🔵 Zu tun |
| US-046 | Google OAuth Login | 8 | @dev2 | 🔵 Zu tun |
| US-047 | GitHub OAuth Login | 5 | @dev1 | 🔵 Zu tun |
| US-048 | Passwort zurücksetzen | 3 | @dev3 | 🔵 Zu tun |

**Gesamt committed: 21 Punkte**

## Abhängigkeiten

| US | Abhängig von | Status |
|----|-----------|--------|
| US-046 | Google OAuth Console Config | ✅ Erledigt |
| US-047 | GitHub OAuth App Config | ⚠️ In Arbeit |

## Identifizierte Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------|--------|------------|
| Google API ändert sich | Niedrig | Mittel | Offizielle Lib verwenden |
| Dev2 krank | Mittel | Mittel | @dev1 kann übernehmen |

## Burndown-Chart

```
Punkte |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notizen

{Sprint Planning Notizen, getroffene Entscheidungen...}
```

### Schritt 6: `.bmad/sprint-status.yaml` synchronisieren

`/gate:check sprint` und `/workflow:implement` lesen den Sprint aus `.bmad/sprint-status.yaml`. Schreibe die Datei jetzt aus dem obigen `sprint-goal.md` und den ausgewählten US-Dateien (`project-management/backlog/user-stories/US-*.md`):

1. `.bmad/` anlegen, falls nicht vorhanden.
2. `metadata`: `sprint_id` (`sprint-{N}`), `name`, `start_date`, `end_date`, `goal`, `capacity_points`, aus `sprint-goal.md` übernommen.
3. `stories`: ein Eintrag pro ausgewählter US: `title`, `status: ready-for-dev`, `story_points`, `epic_id`, `priority` (MoSCoW), `dependencies`, `tasks`, `history: []`.
4. Datei für **dieselbe** `sprint_id` bereits vorhanden: bestehende Status beibehalten (eine Story nie zurücksetzen) und nur neue US ergänzen.
5. Datei für einen **anderen** Sprint vorhanden: zuerst deren Stories nach `archived_sprints.<alte sprint_id>` (`status`, `points`) verschieben, dann den neuen Sprint schreiben.

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Benutzerverwaltung"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Benutzer können sich registrieren, anmelden und ihr Profil bearbeiten"
  capacity_points: 21
stories:
  US-010:
    title: "Benutzerregistrierung"
    status: "ready-for-dev"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks: { total: 0, completed: 0, list: [] }
    history: []
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
```

### Schritt 7: Stories in Tasks zerlegen

`sprint-goal.md`, `sprint-dependencies.md` und jede referenzierte US in `project-management/backlog/user-stories/` lesen (mit `--tasks-only` hier beginnen). Die Task-Typen an den tatsächlichen Stack des Projekts anpassen (`CLAUDE.md` / `.claude/rules/` lesen); die folgende Tabelle ist ein typisches Beispiel.

| Schicht | Präfix | Typische Tasks |
|---------|--------|----------------|
| Datenbank | `[DB]` | Entity, Migration, Repository, Fixtures |
| Backend | `[BE]` | Service, API-Resource, DTO, Processor, Voter |
| Frontend Web | `[FE-WEB]` | Controller, Template, Komponente |
| Frontend Mobile | `[FE-MOB]` | Modell, Repository, State, Screen |
| Tests | `[TEST]` | Unit, Integration, API, E2E |
| Dokumentation | `[DOC]` | Code-Doku, README, OpenAPI |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

**Guter Task (SMART)**: Spezifisch (klare Aktion), Messbar (man weiß, wann er fertig ist), Zuweisbar (ein einziger Verantwortlicher), Realistisch, Terminiert (in Stunden geschätzt, nicht in Punkten).

**Größenregeln**: Minimum 30 Min., Maximum 8 h (1 Tag), ideal 2 bis 4 h. Über 8 h: in Subtasks aufteilen.

**Vertikaler Schnitt**: Jede US erhält je nach Bedarf DB-, API-, Frontend-, Test-, Doku- und Review-Tasks. Typische Größe: einfaches CRUD ~15 Tasks, Business-Feature ~18, nur UI ~11.

Für jede US pro Task ein `tasks/TASK-{NNN}.md` aus `.claude/templates/project/task.md` erstellen (die IDs setzen nach dem letzten vorhandenen `TASK-*` fort, wie bei `/project:backlog add task`) mit: Typ, Schätzung, `Depends on`, Beschreibung, zu erstellende oder zu ändernde Dateien, Validierungskriterien. Danach einen Abschnitt in `tasks/README.md` ergänzen:

```markdown
## US-XXX: [Titel] (Epic EPIC-XXX, [X] Punkte)

| ID | Typ | Task | Schätzung | Abhängig von |
|----|-----|------|-----------|--------------|
| TASK-001 | [DB] | Entity [Name] erstellen | 2h | - |
| TASK-002 | [DB] | Migration | 1h | TASK-001 |
| TASK-003 | [BE] | API-Resource | 3h | TASK-001 |
| TASK-004 | [TEST] | API-Tests | 2h | TASK-003 |

**Geschätzt gesamt**: XXh
```

Die Abhängigkeiten als Mermaid-Graph (`TASK-001 --> TASK-002`) und eine Zusammenfassung pro Schicht (Tasks und Stunden) ergänzen. Außerdem einen Abschnitt „Übergreifende technische Tasks“ (Umgebung, Dependency-Updates, CI-Pipeline, identifiziertes Refactoring) mit je einem `tasks/TASK-{NNN}.md` (ohne US) hinzufügen.

Regeln:
1. Schätzung in Stunden (nicht in Punkten)
2. Ein Task = ein Verantwortlicher
3. Max. 2 Tasks in Arbeit pro Person
4. Explizite Abhängigkeiten (Mermaid-Graph)

### Schritt 8: Board und Task-Übersicht

`board.md` erstellen (Vorlage `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint {N}

> Generierte Ansicht: aus `.bmad/sprint-status.yaml` durch `/workflow:status --board` neu erzeugt. Nicht von Hand bearbeiten.

## to-do
| ID | US | Task | Schätzung | Zugewiesen |
|----|-----|------|-----------|-----------|

## in-progress | review | done | blocked
(gleiches Layout, eine Tabelle pro Spalte)

## Metriken
- **Tasks**: X gesamt | X abgeschlossen (X%)
- **Stunden**: Xh geschätzt | Xh aufgewendet | Xh verbleibend
```

`tasks/README.md` enthält außerdem die Übersichtstabelle (US, Titel, Punkte, Tasks, Stunden), die Aufteilung nach Typ und die Konventionen: ID `TASK-[NNN]`, Größe 0,5 h bis 8 h, Status in `.bmad/sprint-status.yaml` geführt (`to-do | in-progress | done | blocked`).

### Schritt 9: Tasks in `.bmad/sprint-status.yaml` registrieren

Für jeden erstellten Task (US-Tasks und übergreifende Tasks), gemäß `.claude/templates/project/sprint-status.md`:

1. `.bmad/sprint-status.yaml` aus dem Skelett von `/workflow:init` erstellen, falls nicht vorhanden (mit `--tasks-only` existieren Sprint und Stories bereits; andernfalls das vollständige `/workflow:start <N>` ausführen)
2. Die TASK-IDs an `stories.<US>.tasks.list` anhängen
3. `stories.<US>.tasks.status.<TASK>: to-do` setzen
4. `stories.<US>.tasks.total` aktualisieren (`completed` bleibt die Anzahl der `done`-Tasks)

### Schritt 10: Finale Checkliste

```
══════════════════════════════════════════════════════════════
✅ SPRINT {N} START CHECKLISTE
══════════════════════════════════════════════════════════════

## Vor Sprint Planning

- [ ] Vorheriger Sprint offiziell abgeschlossen
- [ ] Retrospektiven-Aktionen in Arbeit
- [ ] Backlog vom PO priorisiert
- [ ] Kandidaten-US geschätzt und "Bereit"
- [ ] Team-Kapazität berechnet
- [ ] Räume für Zeremonien gebucht

## Während Sprint Planning

### Teil 1 - WAS (mit PO)
- [ ] Sprint-Ziel definiert und akzeptiert
- [ ] US vom Team ausgewählt
- [ ] Commitment zum Umfang
- [ ] Abhängigkeiten identifiziert

### Teil 2 - WIE (Dev Team)
- [ ] Aufgliederung in Tasks
- [ ] Task-Schätzung
- [ ] Initiale Zuweisung
- [ ] Risiken diskutiert

## Nach Sprint Planning

- [ ] Sprint Backlog sichtbar (Board aktualisiert)
- [ ] Daily Scrum geplant
- [ ] Tools konfiguriert (Board, Branches, etc.)
- [ ] Team-Kommunikation (Channel, Benachrichtigungen)

══════════════════════════════════════════════════════════════
🚀 SPRINT {N} BEREIT ZUM START!
══════════════════════════════════════════════════════════════
```

## Scrum-Tipps

### Sprint-Ziel
- Ein Satz
- Geschäftswert-orientiert
- Messbar
- Vom gesamten Team geteilt

### Commitment vs Forecast
- Team committed zum Sprint-Ziel
- Anzahl Punkte ist Forecast
- Vertrauen steigt mit Erfahrung

### Focus Factor
- Anfänger-Team: 50-60%
- Etabliertes Team: 70-80%
- Reifes Team: 80-90%

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                    NÄCHSTER SCHRITT                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /gate:check sprint {N}                                ║
║    Prüfen, ob der Sprint bereit ist (Gate)               ║
║                                                          ║
║  → /workflow:implement {N}                               ║
║    TDD/BDD-Entwicklung starten                           ║
║                                                          ║
║  Siehe auch:                                             ║
║  • /project:backlog next story — Erste Story wählen      ║
║  • /workflow:status  — Sprint-Fortschritt verfolgen      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
