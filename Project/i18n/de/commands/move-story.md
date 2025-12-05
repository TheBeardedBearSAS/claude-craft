# Eine User Story verschieben

Den Status einer User Story ändern oder einem Sprint zuweisen.

## Argumente

$ARGUMENTS (Format: US-XXX Ziel)
- **US-ID** (erforderlich): User Story-ID (z.B. US-001)
- **Ziel** (erforderlich):
  - `sprint-N`: Sprint N zuweisen
  - `backlog`: Aus aktuellem Sprint entfernen
  - `in-progress`: US starten
  - `blocked`: Als blockiert markieren
  - `done`: Als abgeschlossen markieren

## Strikter Workflow

Statusübergänge folgen einem strikten Workflow:

```
🔴 To Do ──→ 🟡 In Progress ──→ 🟢 Done
     │              │
     │              ↓
     └────→ ⏸️ Blocked ←────┘
                │
                ↓
           🟡 In Progress
```

### Erlaubte Übergänge

| Von | Nach | Erlaubt |
|--------|------|----------|
| 🔴 To Do | 🟡 In Progress | ✅ |
| 🔴 To Do | ⏸️ Blocked | ✅ |
| 🔴 To Do | 🟢 Done | ❌ **Verboten** |
| 🟡 In Progress | 🟢 Done | ✅ |
| 🟡 In Progress | ⏸️ Blocked | ✅ |
| ⏸️ Blocked | 🟡 In Progress | ✅ |
| 🟢 Done | * | ❌ (manuelles Wiedereröffnen) |

## Prozess

### Schritt 1: User Story validieren

1. Prüfen, dass US existiert
2. Aktuellen Status lesen
3. Aktuellen Sprint identifizieren (falls zutreffend)

### Schritt 2: Übergang validieren

**Falls Statusänderung:**
1. Prüfen, dass Übergang erlaubt ist
2. Falls nicht erlaubt, Fehler mit möglichen Übergängen anzeigen

**Falls Sprint-Zuweisung:**
1. Prüfen, dass Sprint existiert
2. Sprint-Verzeichnis erstellen, falls erforderlich

### Schritt 3: Falls Übergang zu Blocked

Nach Blocker fragen:
```
Was ist der Blocker für US-XXX?
> [Blocker-Beschreibung]
```

### Schritt 4: User Story aktualisieren

1. Status in Metadaten ändern
2. Sprint ändern, falls zutreffend
3. Blocker hinzufügen, falls Blocked
4. Änderungsdatum aktualisieren

### Schritt 5: Zugehörige Dateien aktualisieren

1. **Index** (`backlog/index.md`): Zähler aktualisieren
2. **Übergeordnetes EPIC**: Fortschritt aktualisieren
3. **Sprint Board** (falls zutreffend): Aufgaben verschieben

### Schritt 6: Zu Aufgaben kaskadieren

**Falls US zu In Progress wechselt:**
- Aufgaben bleiben To Do (werden einzeln gestartet)

**Falls US zu Done wechselt:**
- Prüfen, dass alle Aufgaben Done sind
- Falls nicht, Warnung anzeigen

**Falls US zu Blocked wechselt:**
- Alle In Progress-Aufgaben als Blocked markieren

## Ausgabeformat

### Statusänderung

```
✅ User Story verschoben!

📖 US-001: Benutzer-Login
   Vorher: 🔴 To Do
   Nachher: 🟡 In Progress

Nächste Schritte:
  /project:move-task TASK-001 in-progress  # Aufgabe starten
  /project:board                            # Kanban anzeigen
```

### Sprint-Zuweisung

```
✅ User Story Sprint 2 zugewiesen!

📖 US-003: Passwort vergessen
   Sprint: Backlog → Sprint 2
   Status: 🔴 To Do

Sprint 2 aktualisiert:
  - 8 US | 34 Punkte

Nächste Schritte:
  /project:decompose-tasks 2  # Aufgaben erstellen
  /project:board              # Kanban anzeigen
```

### Workflow-Fehler

```
❌ Übergang nicht erlaubt!

📖 US-001: Benutzer-Login
   Aktueller Status: 🔴 To Do
   Angeforderter Übergang: → 🟢 Done

Regel: Eine US muss durch "In Progress" gehen, bevor sie "Done" sein kann

Mögliche Übergänge:
  /project:move-story US-001 in-progress
  /project:move-story US-001 blocked
```

## Beispiele

```
# US starten
/project:move-story US-001 in-progress

# US abschließen
/project:move-story US-001 done

# US blockieren
/project:move-story US-001 blocked

# Sprint 2 zuweisen
/project:move-story US-003 sprint-2

# Aus Sprint entfernen
/project:move-story US-003 backlog
```

## Validierung vor Done

Vor Markierung als Done prüfen:
- [ ] Alle Aufgaben sind Done
- [ ] Tests bestehen
- [ ] Code reviewed
- [ ] Abnahmekriterien validiert

Falls nicht erfüllt:
```
⚠️ Warnung: US-001 hat noch unfertige Aufgaben!

Verbleibende Aufgaben:
  🔴 TASK-004 [FE-WEB] Auth Controller
  🔴 TASK-006 [TEST] AuthService Tests

Trotzdem bestätigen? (nicht empfohlen)
```
