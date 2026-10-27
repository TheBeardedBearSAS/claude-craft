---
description: Eine Aufgabe verschieben
argument-hint: [arguments]
---

# Eine Aufgabe verschieben

Den Status einer Aufgabe gemäß dem strikten Workflow ändern.

## Argumente

$ARGUMENTS (Format: TASK-XXX Ziel)
- **TASK-ID** (erforderlich): Aufgaben-ID (z.B. TASK-001)
- **Ziel** (erforderlich):
  - `in-progress`: Aufgabe starten
  - `blocked`: Als blockiert markieren
  - `done`: Als abgeschlossen markieren

## Strikter Workflow

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

### Erlaubte Übergänge

| Von | Nach | Erlaubt |
|--------|------|----------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Verboten** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (Rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (Wiedereröffnen) |

> Aufgabenstatus werden ausschließlich in `.bmad/sprint-status.yaml` gespeichert (`stories.<US>.tasks.status.<TASK>`), gemäß `.claude/templates/project/sprint-status.md`. Aufgaben- und US-Markdown-Dateien enthalten keinen Status.

## Prozess

### Schritt 1: Aufgabe validieren

1. Aufgabendatei finden
2. Aktuellen Status aus `.bmad/sprint-status.yaml` lesen (`stories.<US>.tasks.status.<TASK>`)
3. Zugehörige US und Sprint identifizieren

### Schritt 2: Übergang validieren

1. Prüfen, dass Übergang erlaubt ist
2. Falls To Do → Done, blockieren und In Progress vorschlagen

### Schritt 3: Falls Übergang zu Blocked

Nach Blocker fragen:
```
Was ist der Blocker für TASK-XXX?
> [Blocker-Beschreibung]
```

### Schritt 4: Falls Übergang zu Done

Nach aufgewendeter Zeit fragen:
```
Zeit für TASK-XXX aufgewendet? (Schätzung: 4h)
> [Tatsächliche Zeit, z.B. 3.5h]
```

### Schritt 5: Aufgabe aktualisieren

1. Den neuen Status in `.bmad/sprint-status.yaml` schreiben: `stories.<US>.tasks.status.<TASK>` (Schema: `.claude/templates/project/sprint-status.md`); nie in die Aufgaben-Datei
2. `stories.<US>.tasks.completed` neu berechnen (= Anzahl der `done`-Aufgaben)
3. Nur Inhalt in der Aufgaben-Datei: Blocker-Text hinzufügen, falls Blocked, aufgewendete Zeit aktualisieren, falls Done, Änderungsdatum aktualisieren

### Schritt 6: Board aktualisieren

1. Das `board.md` des Sprints aus `.bmad/sprint-status.yaml` neu generieren (generierte Ansicht, nie von Hand bearbeitet)
2. Metriken aktualisieren

### Schritt 7: User Story aktualisieren

1. Aufgabenliste aktualisieren (nur Inhalt)
2. Fortschritt aus `.bmad/sprint-status.yaml` neu berechnen
3. Falls alle Aufgaben Done, Abschluss der US vorschlagen

### Schritt 8: Index aktualisieren

1. Globale Zähler aktualisieren

## Ausgabeformat

### Erfolgreicher Übergang

```
✅ Aufgabe verschoben!

🔧 TASK-003: Login API Endpoint
   Vorher: to-do
   Nachher: in-progress

📖 US-001: Benutzer-Login
   Fortschritt: 2/6 → 3/6 (50%)

Nächste Schritte:
  /project:move-task TASK-003 done       # Bei Abschluss
  /project:move-task TASK-003 blocked    # Falls blockiert
```

### Aufgabe abgeschlossen

```
✅ Aufgabe abgeschlossen!

🔧 TASK-003: Login API Endpoint
   Status: in-progress → done
   Schätzung: 4h
   Tatsächliche Zeit: 3.5h ✓

📖 US-001: Benutzer-Login
   Fortschritt: 4/6 (67%) ████████░░░░

Sprint 1:
   Aufgaben erledigt: 12/25 (48%)
   Stunden: 35h/77h abgeschlossen
```

### Alle Aufgaben Done

```
✅ Aufgabe abgeschlossen!

🔧 TASK-006: AuthService Tests
   Status: done

🎉 Alle Aufgaben von US-001 abgeschlossen!

📖 US-001: Benutzer-Login
   Fortschritt: 6/6 (100%) ██████████

Empfohlener nächster Schritt:
  /sprint:transition US-001 done
```

### Workflow-Fehler

```
❌ Übergang nicht erlaubt!

🔧 TASK-004: Auth Controller
   Aktueller Status: to-do
   Angeforderter Übergang: → done

Regel: Eine Aufgabe muss durch "In Progress" gehen, bevor sie "Done" sein kann

Korrekte Aktion:
  /project:move-task TASK-004 in-progress
  # ... an Aufgabe arbeiten ...
  /project:move-task TASK-004 done
```

### Blockierte Aufgabe

```
✅ Aufgabe als blockiert markiert

🔧 TASK-005: Login Screen
   Status: in-progress → blocked
   Blocker: Warte auf Auth API (TASK-003)

Zum Entblocken:
  1. TASK-003 abschließen
  2. /project:move-task TASK-005 in-progress
```

## Beispiele

```
# Aufgabe starten
/project:move-task TASK-001 in-progress

# Aufgabe abschließen
/project:move-task TASK-001 done

# Aufgabe blockieren
/project:move-task TASK-001 blocked

# Aufgabe entblocken
/project:move-task TASK-001 in-progress
```

## Aktualisierte Metriken

Bei jedem Verschieben:
- Aufgabenzahl nach Status
- Geschätzte vs. tatsächliche Stunden
- US-Fortschritt
- Sprint-Fortschritt
- Kanban-Board
