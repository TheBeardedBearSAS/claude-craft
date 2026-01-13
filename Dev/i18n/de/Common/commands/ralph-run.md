---
description: Claude in kontinuierlicher Schleife ausfuhren bis Aufgabe abgeschlossen (Ralph Wiggum)
argument-hint: <aufgaben-beschreibung> [--auto|--full]
---

# Ralph Run - Kontinuierliche KI-Agenten-Schleife

Claude in kontinuierlicher Schleife ausfuhren bis die Aufgabe abgeschlossen ist oder die Definition of Done (DoD) Kriterien erfullt sind.

## Argumente

**$ARGUMENTS**

- `<aufgaben-beschreibung>`: Die Aufgabe fur Claude
- `--auto`: Maximale automatische Erkennung, minimale Fragen
- `--full`: Umfassender Modus mit allen DoD-Prufungen

## Prozess

### 1. Sitzungsinitialisierung

1. **Voraussetzungen prufen**:
   - Prufen ob Claude verfugbar ist
   - Nach `ralph.yml` Konfiguration suchen
   - Sitzungsverzeichnis initialisieren (`.ralph/`)

2. **Konfiguration laden**:
   - `ralph.yml` oder `.claude/ralph.yml` lesen
   - Max Iterationen, Timeouts, DoD-Kriterien festlegen

### 2. Hauptschleife

```
┌─────────────────────────────────────────────────────────────┐
│  RALPH SCHLEIFE                                              │
│                                                              │
│  while (iterationen < max && !DoD_bestanden) {               │
│      1. Sicherungsschalter prufen                            │
│      2. Claude mit aktuellem Prompt aufrufen                 │
│      3. Ausgabe verarbeiten                                  │
│      4. Definition of Done validieren                        │
│      5. Checkpoint erstellen (git commit)                    │
│      6. Falls DoD nicht erfullt, Antwort als Prompt nutzen   │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3. Definition of Done Validierung

Das DoD-System validiert Abschluss durch mehrere Kriterien:

| Validator | Beschreibung |
|-----------|--------------|
| `command` | Shell-Befehl ausfuhren (Tests, Lint, Build) |
| `output_contains` | Pattern in Claude-Ausgabe prufen |
| `file_changed` | Prufen ob Dateien geandert wurden |
| `hook` | Bestehenden Claude-Hook ausfuhren |
| `human` | Interaktive menschliche Validierung |

Beispiel DoD in `ralph.yml`:

```yaml
definition_of_done:
  checklist:
    - id: tests
      name: "Alle Tests bestanden"
      type: command
      command: "docker compose exec app npm test"
      required: true

    - id: completion
      name: "Claude signalisiert Abschluss"
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

### 4. Sicherungsschalter (Circuit Breaker)

Sicherheitsmechanismus zur Vermeidung von Endlosschleifen:

| Ausloser | Schwelle | Aktion |
|----------|----------|--------|
| Keine Dateienderungen | 3 Iterationen | Stopp |
| Wiederholte Fehler | 5 Iterationen | Stopp |
| Ausgaberuckgang | 70% | Stopp |
| Max Iterationen | 25 (Standard) | Stopp |

### 5. Checkpointing

Git-Checkpoints werden nach jeder Iteration erstellt fur:
- **Wiederherstellung**: Fruheren Zustand bei Bedarf wiederherstellen
- **Historie**: Fortschritt durch Iterationen verfolgen
- **Review**: Anderungen bei jedem Schritt inspizieren

## Ausgabe

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Kontinuierliche KI-Agenten-Schleife   ║
╚════════════════════════════════════════════════════════════╝

✓ Sitzung erstellt: ralph-1704067200-a1b2

ℹ Ralph-Schleife wird gestartet...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 von 25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Claude wird aufgerufen...
ℹ DoD-Kriterien werden gepruft...
  ✓ [tests] Alle Tests bestanden - OK
  ✓ [lint] Keine Lint-Fehler - OK
  ✓ [completion] Claude signalisiert Abschluss - OK

  Alle erforderlichen Kriterien bestanden!

✓ DoD BESTANDEN

╔════════════════════════════════════════════════════════════╗
║     📊 Sitzungszusammenfassung                              ║
╚════════════════════════════════════════════════════════════╝

  Sitzungs-ID:         ralph-1704067200-a1b2
  Gesamtiterationen:   3
  Dauer:               45s
  DoD-Status:          BESTANDEN
  Beendigungsgrund:    dod_complete
```

## Konfiguration

`ralph.yml` im Projektstammverzeichnis erstellen:

```yaml
version: "1.0"

session:
  max_iterations: 25
  timeout: 600000

circuit_breaker:
  enabled: true
  no_file_changes_threshold: 3

definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Best Practices

1. **Klare Beschreibung**: Spezifische, umsetzbare Aufgaben bereitstellen
2. **DoD konfigurieren**: Abschlusskriterien in `ralph.yml` definieren
3. **TDD verwenden**: Tests zuerst schreiben, Ralph implementieren lassen
4. **Fortschritt uberwachen**: Iterationsausgaben beobachten
5. **Vernunftige Grenzen**: max_iterations nach Komplexitat anpassen

## Siehe auch

- `@ralph-conductor` - Agent fur Ralph-Orchestrierung
- `/common:fix-bug-tdd` - TDD-basierte Fehlerbehebung
- `/project:sprint-dev` - Sprint-Entwicklung mit TDD
