---
description: Kanban-Board anzeigen
argument-hint: [arguments]
---

# Kanban-Board anzeigen

Das Kanban-Board des aktuellen Sprints oder eines bestimmten Sprints anzeigen.

## Argumente

$ARGUMENTS (optional, Format: [sprint N])
- **sprint N** (optional): Anzuzeigende Sprint-Nummer
- Falls nicht angegeben, wird der aktuelle Sprint angezeigt

## Prozess

### Schritt 1: Sprint identifizieren

1. Falls Sprint angegeben, diese Nummer verwenden
2. Sonst aktuellen Sprint finden (mit nicht-Done-Aufgaben)

### Schritt 2: Daten lesen

1. Datei `project-management/sprints/sprint-XXX/board.md` lesen
2. Oder aus Aufgabendateien regenerieren

### Schritt 3: Nach Status gruppieren

Aufgaben nach Spalte organisieren:
- 🔴 To Do
- 🟡 In Progress
- ⏸️ Blocked
- 🟢 Done

### Schritt 4: Metriken berechnen

- Anzahl der Aufgaben pro Spalte
- Geschätzte und abgeschlossene Stunden
- Fortschritt in Prozent

## Ausgabeformat

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Kanban Board                                      ║
║  Ziel: Walking Skeleton - Auth + Erste Seite                     ║
║  Zeitraum: 2024-01-15 → 2024-01-29                              ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │                 │
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ E2E Tests       │ Auth Service    │ Login Screen    │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ 6h @US-001      │ 2h @US-001      │
│                 │                 │ ⚠️ Warte auf API│                 │
│ TASK-010 [DOC]  │ TASK-006 [WEB]  │                 │ TASK-002 [DB]   │
│ Documentation   │ Auth Controller │                 │ Migration ✓     │
│ 2h @US-001      │ 3h @US-001      │                 │ 1h @US-001      │
│                 │                 │                 │                 │
│ TASK-015 [BE]   │ TASK-012 [MOB]  │                 │ TASK-003 [BE]   │
│ Products API    │ Products Bloc   │                 │ Repository ✓    │
│ 4h @US-002      │ 5h @US-002      │                 │ 3h @US-001      │
│                 │                 │                 │                 │
│ TASK-016 [TEST] │                 │                 │ TASK-004 [BE]   │
│ Products Tests  │                 │                 │ Login API ✓     │
│ 3h @US-002      │                 │                 │ 4h @US-001      │
│                 │                 │                 │                 │
│                 │                 │                 │ ... +4 weitere  │
│                 │                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

══════════════════════════════════════════════════════════════════════════
📊 METRIKEN

Aufgaben:  ████████████████████░░░░░░░░░░ 8/16 (50%)
Stunden:   ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Blockiert: 1 Aufgabe (6h)

Nach Typ:
[DB]  ██████████ 3/3 erledigt
[BE]  ████████░░ 4/5 (1 in Bearbeitung)
[WEB] ████░░░░░░ 1/3 (1 in Bearbeitung)
[MOB] ██░░░░░░░░ 0/3 (1 blockiert, 1 in Bearbeitung)
[TEST]░░░░░░░░░░ 0/2

══════════════════════════════════════════════════════════════════════════
📖 USER STORIES

│ US      │ Punkte │ Status          │ Aufgaben  │ Fortschritt │
├─────────┼────────┼─────────────────┼───────────┼─────────────┤
│ US-001  │ 5      │ 🟡 In Progress  │ 6/10      │ ██████░░░░  │
│ US-002  │ 5      │ 🔴 To Do        │ 2/6       │ ███░░░░░░░  │

Sprint: 10 Punkte | Erledigt: 0 Pts
══════════════════════════════════════════════════════════════════════════

Aktionen:
  /project:move-task TASK-XXX in-progress  # Aufgabe starten
  /project:move-task TASK-XXX done         # Aufgabe abschließen
  /project:sprint-status                   # Mehr Metriken anzeigen
```

## Kompaktformat

Falls viele Aufgaben, Zusammenfassung anzeigen:

```
📋 Sprint 1 - Kanban (32 Aufgaben)

🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014

Fortschritt: 13/32 (41%) | 45h/98h
```

## Beispiele

```
# Aktuelles Sprint-Board anzeigen
/project:board

# Sprint 2-Board anzeigen
/project:board sprint 2
```

## board.md-Datei aktualisieren

Nach der Anzeige wird die `board.md`-Datei des Sprints mit aktuellen Daten aktualisiert.
