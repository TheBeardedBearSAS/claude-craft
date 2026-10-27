---
description: "Backlog verwalten: EPICs, User Stories und Tasks hinzufügen, auflisten, bearbeiten und verschieben"
argument-hint: "<add|list|edit|move> <epic|story|task> [args]"
---

# Backlog

Zentraler Einstiegspunkt zur Verwaltung des Projekt-Backlogs: EPICs, User Stories und Tasks erstellen, auflisten, bearbeiten und verschieben.

## Verwendung

| Aufruf | Was er tut | Ersetzt |
|--------|------------|---------|
| `/project:backlog add epic "Name" [Priorität]` | Einen EPIC erstellen | `/project:backlog add epic` |
| `/project:backlog add story EPIC-XXX "Name" [Punkte]` | Eine User Story in einem EPIC erstellen | `/project:backlog add story` |
| `/project:backlog add task US-XXX "[TYP] Beschreibung" 4h` | Einen Task in einer User Story erstellen | `/project:backlog add task` |
| `/project:backlog list epic [Status] [Priorität]` | EPICs mit abgeleitetem Status und Fortschritt auflisten | `/project:backlog list epic` |
| `/project:backlog list story [epic EPIC-XXX \| sprint N \| status S \| backlog]` | User Stories auflisten | `/project:backlog list story` |
| `/project:backlog list task [us US-XXX \| sprint N \| type T \| status S]` | Tasks auflisten | `/project:backlog list task` |
| `/project:backlog edit epic EPIC-XXX [Feld] [Wert]` | Einen EPIC ändern | `/project:backlog edit epic` |
| `/project:backlog edit story US-XXX [Feld] [Wert]` | Eine User Story ändern | `/project:backlog edit story` |
| `/project:backlog move task TASK-XXX <in-progress\|blocked\|done>` | Den Status eines Tasks ändern | `/project:backlog move task` |

Es gibt weder `edit task` noch `move story`/`move epic`: Story-Status werden mit `/sprint:transition` geändert, EPIC-Status sind abgeleitet.

## Argumente

$ARGUMENTS: `<Aktion> <Entität> [args]`

1. Erstes Wort = Aktion: `add`, `list`, `edit` oder `move`
2. Zweites Wort = Entität: `epic`, `story` oder `task` (`move` akzeptiert nur `task`)
3. Der Rest wird an den passenden Abschnitt weiter unten übergeben
4. Fehlende oder unbekannte Aktion/Entität: die Verwendungstabelle anzeigen und anhalten. `move story` / `move epic`: antworten, dass Story-Status mit `/sprint:transition` geändert werden und der EPIC-Status abgeleitet ist

## Gemeinsame Regeln

### Single Source of Truth für den Status

- **Der Status lebt ausschließlich in `.bmad/sprint-status.yaml`** (einzige Wahrheitsquelle, Schema: `.claude/templates/project/sprint-status.md`). Die exakten Status-Strings des Schemas verwenden.
  - Story: `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`
  - Task (`stories.<US>.tasks.status.<TASK>`): `to-do`, `in-progress`, `blocked`, `done`
- **Markdown-Dateien enthalten nur Inhalt** (Name, Beschreibung, Punkte, Kriterien, Schätzung, Blocker-Text, aufgewendete Zeit). Niemals einen Status in eine EPIC-, US- oder Task-Datei schreiben, auch nicht in deren Tabellen.
- **Der EPIC-Status ist abgeleitet, niemals gespeichert**: alle Stories `backlog` (oder keine Story) = nicht gestartet; alle `done` = abgeschlossen; mindestens eine `blocked` und keine in Arbeit = blockiert; sonst in Arbeit.
- Boards (`board.md`) sind generierte Ansichten: aus `.bmad/sprint-status.yaml` neu generieren, niemals von Hand bearbeiten.
- Fehlt `.bmad/sprint-status.yaml`, wird es aus dem Skeleton von `/workflow:init` erstellt.

### Pfade und Templates

| Element | Pfad |
|---------|------|
| EPICs | `project-management/backlog/epics/EPIC-{ID}-{slug}.md` |
| User Stories | `project-management/backlog/user-stories/US-{ID}-{slug}.md` |
| Tasks (US in einem Sprint) | `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md` |
| Tasks (sonst) | `project-management/backlog/tasks/TASK-{ID}.md` |
| Index | `project-management/backlog/index.md` |
| Templates | `.claude/templates/project/{epic,user-story,task}.md` |

### Plan-Modus (add, edit, move)

> **Der Plan-Modus ist obligatorisch** für jede schreibende Aktion (`add`, `edit`, `move`). Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden. `list` ist rein lesend.

### Status-Icons (list)

| Icon | Bedeutung |
|------|-----------|
| 🔴 | Offen / Backlog (nicht gestartet) |
| 🟡 | In Arbeit |
| ⏸️ | Blockiert |
| 🟢 | Erledigt |

## add epic

`/project:backlog add epic "EPIC-Name" [Priorität]`

- **Name** (erforderlich), **Priorität** (optional): High, Medium, Low (Standard: Medium)

1. **ID generieren**: `project-management/backlog/epics/` lesen, letzte `EPIC-XXX` finden, inkrementieren
2. **Erfassen** (falls nicht angegeben): Beschreibung, MMF (Minimum Marketable Feature), 2-3 Geschäftsziele, Erfolgskriterien
3. **Datei erstellen** aus `.claude/templates/project/epic.md`, dabei `{ID}`, `{NOM}`, `{PRIORITE}`, `{MINIMUM_MARKETABLE_FEATURE}`, `{DESCRIPTION}`, `{DATE}` (JJJJ-MM-TT), `{OBJECTIF_1}`, `{OBJECTIF_2}`, `{CRITERE_1}`, `{CRITERE_2}` ersetzen. Es wird kein Status geschrieben.
4. **Index aktualisieren**: den EPIC zur EPIC-Tabelle hinzufügen, Zähler aktualisieren

```
✅ EPIC erfolgreich erstellt!

📋 EPIC-{ID}: {NAME}
   Status: abgeleitet aus seinen Stories (noch keine)
   Priorität: {PRIORITÄT}
   Datei: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Nächste Schritte:
  /project:backlog add story EPIC-{ID} "Name der User Story"
```

Beispiel: `/project:backlog add epic "Authentifizierungssystem" High` erstellt `project-management/backlog/epics/EPIC-001-authentifizierungssystem.md`.

Validierung: Name nicht leer, Priorität aus High/Medium/Low, `project-management/backlog/epics/` existiert, ID eindeutig.

## add story

`/project:backlog add story EPIC-XXX "US-Name" [Punkte]`

- **EPIC-ID** (erforderlich), **Name** (erforderlich), **Punkte** (optional): Fibonacci (1, 2, 3, 5, 8)

1. **EPIC validieren**: er muss in `project-management/backlog/epics/` existieren; andernfalls einen Fehler mit den verfügbaren EPICs anzeigen
2. **ID generieren**: `project-management/backlog/user-stories/` lesen, letzte `US-XXX` finden, inkrementieren
3. **Erfassen**: Persona (P-XXX oder Beschreibung), Aktion, Nutzen, mindestens 2 Akzeptanzkriterien im Gherkin-Format, Punkte (schätzen, falls nicht angegeben)
4. **Datei erstellen** aus `.claude/templates/project/user-story.md`, dabei `{ID}`, `{NOM}`, `{EPIC_ID}`, `{SPRINT}` ("Backlog" = nicht zugewiesen), `{POINTS}`, `{PERSONA}`, `{PERSONA_ID}`, `{ACTION}`, `{BENEFICE}`, `{DATE}` ersetzen; die Gherkin-Kriterien hinzufügen
5. **Status registrieren** in `.bmad/sprint-status.yaml`: `stories.US-{ID}` hinzufügen mit `title`, `status: backlog`, `story_points`, `epic_id`, `priority`, `dependencies: []`, `tasks: { total: 0, completed: 0, list: [] }`, `history: []`
6. **EPIC aktualisieren** (die US zur User-Stories-Tabelle hinzufügen, ohne Statusspalte; Fortschritt aktualisieren) und **Index** (Abschnitt „Priorisiertes Backlog", Zähler)

```
✅ User Story erfolgreich erstellt!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Status: backlog (.bmad/sprint-status.yaml)
   Punkte: {PUNKTE}
   Datei: project-management/backlog/user-stories/US-{ID}-{slug}.md

Nächste Schritte:
  /sprint:transition US-{ID} sprint-X                # Einem Sprint zuweisen
  /project:backlog add task US-{ID} "[BE] ..." 4h    # Tasks hinzufügen
```

Beispiel: `/project:backlog add story EPIC-001 "Benutzer-Login" 5`.

INVEST-Prüfung: **I**ndependent (unabhängig), **N**egotiable (verhandelbar), **V**aluable (wertvoll), **E**stimable (schätzbar, Punkte angegeben), **S**mall (klein, ≤ 8 Punkte, sonst Aufteilung vorschlagen), **T**estable (testbar, klare Akzeptanzkriterien).

## add task

`/project:backlog add task US-XXX "[TYP] Beschreibung" Schätzung`

- **US-ID** (erforderlich), **Beschreibung** mit dem Typ in eckigen Klammern (erforderlich), **Schätzung** in Stunden (erforderlich, z. B. 4h, 2h, 0.5h)

| Typ | Präfix | Beschreibung |
|-----|--------|--------------|
| Datenbank | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Dokumentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

1. **US validieren**: sie muss in `project-management/backlog/user-stories/` existieren; ihren Sprint ermitteln (falls vorhanden); andernfalls einen Fehler anzeigen
2. **Schätzung validieren**: Minimum 0.5h, Maximum 8h, ideal 2-4h; bei > 8h Aufteilung des Tasks vorschlagen
3. **ID generieren**: letzte Task-ID finden, inkrementieren
4. **Datei erstellen** aus `.claude/templates/project/task.md`, dabei `{ID}`, `{DESCRIPTION}`, `{US_ID}`, `{TYPE}`, `{ESTIMATION}`, `{DATE}`, `{DESCRIPTION_DETAILLEE}` ersetzen; Pfad: Task-Verzeichnis des Sprints, wenn die US in einem Sprint ist, sonst `project-management/backlog/tasks/`
5. **Task registrieren** in `.bmad/sprint-status.yaml`: `TASK-{ID}` an `stories.{US_ID}.tasks.list` anhängen, `stories.{US_ID}.tasks.status.TASK-{ID}: to-do` setzen, `stories.{US_ID}.tasks.total` aktualisieren (`completed` = Anzahl der `done`-Tasks beibehalten)
6. **US aktualisieren** (den Task zur Task-Tabelle hinzufügen, ohne Statusspalte; Fortschritt aktualisieren)
7. **Board aktualisieren**, wenn die US in einem Sprint ist: `board.md` aus `.bmad/sprint-status.yaml` neu generieren (der Task erscheint in `to-do`) und die Metriken aktualisieren

```
✅ Task erfolgreich erstellt!

🔧 TASK-{ID}: {BESCHREIBUNG}
   US: {US_ID}
   Typ: {TYP}
   Status: to-do (.bmad/sprint-status.yaml)
   Schätzung: {SCHÄTZUNG}h
   Datei: {PFAD}

Nächste Schritte:
  /project:backlog move task TASK-{ID} in-progress  # Task starten
  /project:board                                     # Kanban ansehen
```

Beispiele: `/project:backlog add task US-001 "[BE] Login-API-Endpunkt" 4h`, `/project:backlog add task US-001 "[TEST] AuthService-Unit-Tests" 3h`.

Validierung: Typ gültig, Schätzung zwischen 0.5h und 8h, die User Story existiert, ID eindeutig.

## list epic

`/project:backlog list epic [Status] [Priorität]`

- **Status** (aus den Stories abgeleitet): todo, in-progress, blocked, done, all (Standard: all)
- **Priorität**: high, medium, low

1. `project-management/backlog/epics/` durchsuchen, jede `EPIC-XXX-*.md` für die Inhaltsmetadaten lesen (Name, Priorität)
2. Die Status seiner Stories aus `.bmad/sprint-status.yaml` lesen
3. Filter anwenden; pro EPIC die Gesamtzahl der US, die US pro Status und den Fortschritt in Prozent zählen (EPIC-Status abgeleitet, wie in den Gemeinsamen Regeln beschrieben)
4. Die Tabelle anzeigen

```
📋 Projekt-EPICs

| ID | Name | Status | Priorität | US | Fortschritt |
|----|------|--------|-----------|-----|-------------|
| EPIC-001 | Authentifizierung | 🟡 In Arbeit | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Katalog | 🔴 Offen | Medium | 8 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Zusammenfassung: 2 EPICs | 🔴 1 Offen | 🟡 1 In Arbeit | 🟢 0 Erledigt
```

Bei vielen EPICs (z. B. 12) das kompakte Format verwenden: eine Zeile pro Statusgruppe (`🔴 Offen (5): EPIC-002, EPIC-003, ...`, `🟡 In Arbeit (4): EPIC-001 (40%), ...`, `⏸️ Blockiert`, `🟢 Erledigt`).

Beispiele: `/project:backlog list epic`, `/project:backlog list epic in-progress`, `/project:backlog list epic all high`, `/project:backlog list epic blocked`.

Für die Details eines EPICs vorschlagen: `cat project-management/backlog/epics/EPIC-001-*.md`.

## list story

`/project:backlog list story [Filter] [Wert]`

- `epic EPIC-XXX`: nach EPIC filtern | `sprint N`: nach Sprint filtern | `status STATUS`: backlog, ready-for-dev, in-progress, review, done, blocked | `backlog`: nur US, die keinem Sprint zugewiesen sind

1. `project-management/backlog/user-stories/` durchsuchen, jede `US-XXX-*.md` für die Inhaltsmetadaten lesen (Titel, EPIC, Sprint)
2. Status jeder US sowie Task-Status und -Zahlen aus `.bmad/sprint-status.yaml` lesen
3. Filter anwenden; pro US die Gesamtzahl der Tasks, die Tasks pro Status und den Fortschritt in Prozent zählen
4. Eine nach EPIC oder Sprint gruppierte Tabelle anzeigen, je nach Kontext

```
📖 User Stories - EPIC-001: Authentifizierung

| ID | Name | Sprint | Status | Punkte | Tasks | Fortschritt |
|----|------|--------|--------|--------|-------|-------------|
| US-001 | Benutzer-Login | Sprint 1 | 🟡 In Arbeit | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registrierung | Sprint 1 | 🔴 Offen | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Passwort vergessen | Backlog | 🔴 Offen | 3 | - | - |

───────────────────────────────────────────────────
Gesamt: 3 US | 11 Punkte | 🔴 2 | 🟡 1 | 🟢 0
```

- Nach Sprint: Spalten `ID | EPIC | Name | Status | Punkte | Tasks | Fortschritt`, Fußzeile `Sprint 1: 3 US | 13 Punkte | Erledigt: 5 Pkt (38%)`
- Backlog (nicht zugewiesen): Spalten `ID | EPIC | Name | Priorität | Punkte | Status`, Fußzeile `Backlog: 3 US | 16 Punkte zu planen`

Beispiele: `/project:backlog list story`, `... list story epic EPIC-001`, `... list story sprint 1`, `... list story status blocked`, `... list story backlog`.

Vorgeschlagene Aktionen: `/sprint:transition US-XXX sprint-2` (einem Sprint zuweisen), `/sprint:transition US-XXX in-progress` (Status ändern), `/project:backlog add task US-XXX "[BE] ..." 4h`.

## list task

`/project:backlog list task [Filter] [Wert]`

- `us US-XXX` | `sprint N` | `type TYPE` (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV) | `status STATUS` (to-do, in-progress, blocked, done)

1. `project-management/sprints/sprint-{N}-{slug}/tasks/` und `project-management/backlog/tasks/` (falls vorhanden) durchsuchen, jede `TASK-XXX.md` für die Inhaltsmetadaten lesen (Typ, Beschreibung, Schätzung)
2. Den Status jedes Tasks aus `.bmad/sprint-status.yaml` lesen (`stories.<US>.tasks.status.<TASK>`)
3. Filter anwenden; geschätzte Gesamtstunden, erledigte Stunden sowie die Aufteilung nach Typ und Status berechnen
4. Anzeigen

```
🔧 Tasks - US-001: Benutzer-Login

| ID | Typ | Beschreibung | Status | Gesch. | Aufgew. |
|----|-----|--------------|--------|--------|---------|
| TASK-001 | [DB] | User-Entity | 🟢 Erledigt | 2h | 2h |
| TASK-003 | [BE] | Login-API-Endpunkt | 🟡 In Arbeit | 4h | 2h |
| TASK-004 | [FE-WEB] | Auth-Controller | 🔴 Offen | 3h | - |
| TASK-005 | [FE-MOB] | Login-Screen | ⏸️ Blockiert | 6h | - |

───────────────────────────────────────────────────
US-001: 4 Tasks | 15h geschätzt | 4h erledigt (27%)
```

- Nach Sprint: Übersicht nach Status (`🔴 Offen (8 Tasks, 24h)`, ...) und nach Typ (ein Balken pro `[DB]`, `[BE]`, ...), Fußzeile `Sprint 1: 25 Tasks | 77h geschätzt | 35h erledigt (45%)`
- Blockiert (`status blocked`): Spalten `ID | US | Typ | Beschreibung | Blocker`, Fußzeile `2 blockierte Tasks | 14h wartend`, danach eine `Aktionen:`-Liste, wie jeder Blocker aufgelöst wird

Beispiele: `/project:backlog list task`, `... list task us US-001`, `... list task sprint 1`, `... list task type BE`, `... list task status blocked`.

## edit epic

`/project:backlog edit epic EPIC-XXX [Feld] [Wert]`

| Feld | Beschreibung | Beispiel |
|------|--------------|----------|
| `name` | EPIC-Name | "Neuer Name" |
| `priority` | Priorität | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "MMF-Beschreibung" |
| `description` | Beschreibung | "Neue Beschreibung" |

> **Der Status ist hier nicht bearbeitbar.** Der Status eines EPICs wird aus den Status seiner Stories in `.bmad/sprint-status.yaml` abgeleitet. Um den Status einer Story zu ändern, `/sprint:transition` verwenden; für den Status eines Tasks `/project:backlog move task`.

- **Interaktiver Modus** (nur ID): die aktuellen Felder nummeriert anzeigen (Name, Priorität, MMF, Beschreibung) und fragen, welches geändert werden soll (`1-4`, oder `q` zum Beenden)
- **Direkter Modus** (Feld und Wert): das Feld direkt ändern

Schritte: validieren, dass der EPIC existiert, Datei lesen, Feld ändern, Änderungsdatum aktualisieren, speichern, Index bei Bedarf aktualisieren.

```
✅ EPIC aktualisiert!

📋 EPIC-001: Authentifizierungssystem

Änderung:
  Priorität: High → Medium

Datei: project-management/backlog/epics/EPIC-001-authentifizierungssystem.md
```

Beispiele: `/project:backlog edit epic EPIC-001`, `... edit epic EPIC-001 name "Authentifizierung und Autorisierung"`, `... edit epic EPIC-001 priority Low`, `... edit epic EPIC-001 mmf "SSO und 2FA ermöglichen"`.

Validierung: das Feld muss änderbar sein, Priorität High/Medium/Low, Name nicht leer.

## edit story

`/project:backlog edit story US-XXX [Feld] [Wert]`

| Feld | Beschreibung | Beispiel |
|------|--------------|----------|
| `name` | US-Name | "Neuer Name" |
| `points` | Story Points | 1, 2, 3, 5, 8 |
| `epic` | Übergeordneter EPIC | EPIC-002 |
| `persona` | Zugehörige Persona | P-001 |
| `story` | US-Text | "Als ..." |
| `criteria` | Akzeptanzkriterien | (interaktiver Modus) |

> **Der Status ist hier nicht bearbeitbar.** Status leben in `.bmad/sprint-status.yaml`. Um den Status einer Story zu ändern, `/sprint:transition` verwenden; für den Status eines Tasks `/project:backlog move task`.

- **Interaktiver Modus** (nur ID): die Felder nummeriert anzeigen (Name, EPIC, Punkte, Persona, Story, Akzeptanzkriterien) und fragen, welches geändert werden soll (`1-6`, oder `q`)
- **Direkter Modus**: z. B. `/project:backlog edit story US-001 points 8`
- **Akzeptanzkriterien** (interaktiv): die Kriterien auflisten (CA-1, CA-2, ...) und fragen `(h)inzufügen, (ä)ndern, (l)öschen, (b)eenden`; ein neues Kriterium wird in Gherkin eingegeben (GIVEN / WHEN / THEN)

Schritte: validieren, dass die US existiert, Datei lesen, Feld ändern, Änderungsdatum aktualisieren, speichern, den übergeordneten EPIC aktualisieren, falls er sich geändert hat, Index aktualisieren.

```
✅ User Story aktualisiert!

📖 US-001: Benutzer-Login

Änderung:
  Punkte: 5 → 8

⚠️ Achtung: 8 Punkte sind das empfohlene Maximum.
   Erwägen Sie, diese US aufzuteilen, wenn sie zu komplex ist.

Datei: project-management/backlog/user-stories/US-001-benutzer-login.md
```

Wechselt der übergeordnete EPIC (`EPIC: EPIC-001 → EPIC-002`), die Aktualisierungen melden: US aus der Liste des alten EPICs entfernt, zu der des neuen hinzugefügt, Index aktualisiert; außerdem `epic_id` in `.bmad/sprint-status.yaml` aktualisieren.

Beispiele: `/project:backlog edit story US-001`, `... edit story US-001 points 3`, `... edit story US-001 epic EPIC-002`, `... edit story US-001 name "Benutzer-Login mit SSO"`.

Validierung: Punkte Fibonacci (1, 2, 3, 5, 8), bei > 8 vor Aufteilung warnen, der EPIC muss existieren, die Persona muss in personas.md definiert sein.

## move task

`/project:backlog move task TASK-XXX <Ziel>`

- **TASK-ID** (erforderlich); **Ziel** (erforderlich): `in-progress` (starten), `blocked`, `done`. Für den Status einer **Story** `/sprint:transition` verwenden.

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

| Von | Nach | Erlaubt |
|-----|------|---------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Verboten** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (Rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (Wiedereröffnung) |

Ablauf:

1. **Task validieren**: die Task-Datei finden, den aktuellen Status aus `.bmad/sprint-status.yaml` lesen (`stories.<US>.tasks.status.<TASK>`), US und Sprint ermitteln
2. **Übergang validieren** anhand der Tabelle; to-do → done wird blockiert und `in-progress` vorgeschlagen
3. **Nach blocked**: nach dem Blocker fragen (`Was ist der Blocker für TASK-XXX?`)
4. **Nach done**: nach der aufgewendeten Zeit fragen (`Aufgewendete Zeit für TASK-XXX? (Schätzung: 4h)`)
5. **Status aktualisieren**: ihn in `.bmad/sprint-status.yaml` schreiben (`stories.<US>.tasks.status.<TASK>`), `stories.<US>.tasks.completed` neu berechnen (= Anzahl der `done`-Tasks); niemals in die Task-Datei. In der Task-Datei ändert sich nur der Inhalt: Blocker-Text bei blocked, aufgewendete Zeit bei done, Änderungsdatum
6. **Board aktualisieren**: das `board.md` des Sprints aus `.bmad/sprint-status.yaml` neu generieren und die Metriken aktualisieren
7. **User Story aktualisieren** (Inhalt der Task-Liste, Fortschritt aus `.bmad/sprint-status.yaml` neu berechnet); sind alle Tasks done, den Abschluss der US vorschlagen
8. **Index aktualisieren** (globale Zähler)

Ausgaben:

```
✅ Task verschoben!

🔧 TASK-003: Login-API-Endpunkt
   Vorher: to-do
   Nachher: in-progress

📖 US-001: Benutzer-Login
   Fortschritt: 2/6 → 3/6 (50%)

Nächste Schritte:
  /project:backlog move task TASK-003 done       # Bei Abschluss
  /project:backlog move task TASK-003 blocked    # Falls blockiert
```

Bei `done` zusätzlich die Schätzung im Vergleich zur tatsächlichen Zeit (`Schätzung: 4h`, `Tatsächliche Zeit: 3.5h ✓`), den Fortschrittsbalken der US und die Sprint-Summen (erledigte Tasks, erledigte Stunden) anzeigen. Sind alle Tasks der US done:

```
🎉 Alle Tasks von US-001 abgeschlossen!

Empfohlener nächster Schritt:
  /sprint:transition US-001 done
```

Workflow-Fehler:

```
❌ Übergang nicht erlaubt!

🔧 TASK-004: Auth-Controller
   Aktueller Status: to-do
   Angeforderter Übergang: → done

Regel: Ein Task muss "In Progress" durchlaufen, bevor er "Done" wird

Korrekte Aktion:
  /project:backlog move task TASK-004 in-progress
  # ... am Task arbeiten ...
  /project:backlog move task TASK-004 done
```

Bei `blocked` `Status: in-progress → blocked`, den Blocker-Text und die Aufhebung anzeigen (den blockierenden Task abschließen, dann `/project:backlog move task TASK-005 in-progress`).

Beispiele: `/project:backlog move task TASK-001 in-progress`, `... move task TASK-001 done`, `... move task TASK-001 blocked`, `... move task TASK-001 in-progress` (Blocker aufheben).

Bei jeder Verschiebung aktualisierte Metriken: Anzahl der Tasks pro Status, geschätzte vs. tatsächliche Stunden, US-Fortschritt, Sprint-Fortschritt, Kanban-Board.
