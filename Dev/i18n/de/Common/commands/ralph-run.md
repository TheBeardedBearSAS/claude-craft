---
description: Claude in kontinuierlicher Schleife ausführen bis zur Aufgabenerledigung (Ralph Wiggum v2.0)
argument-hint: <aufgabenbeschreibung> [--auto-detect|--init|--interactive]
---

# Ralph Run - Kontinuierliche KI-Agent-Schleife v2.0

Führt Claude in einer kontinuierlichen Schleife aus, bis die Aufgabe abgeschlossen ist oder die Definition of Done (DoD)-Kriterien erfüllt sind.

## Argumente

**$ARGUMENTS**

- `<aufgabenbeschreibung>`: Die Aufgabe, die Claude erledigen soll
- `--auto-detect`: Projekttyp automatisch erkennen und DoD konfigurieren
- `--init`: Konfiguration generieren ohne Ausführung
- `--interactive`: Interaktiver Konfigurationsassistent

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Neue Funktionen v2.0

| Funktion | Beschreibung |
|----------|--------------|
| **Hooks-Integration** | Bidirektionale Integration mit Claude Code 2.1.23+ |
| **Auto-Erkennung** | Automatische Projekttyp-Erkennung (Symfony, Flutter, React usw.) |
| **Dashboard** | Echtzeit-Terminal-Anzeige mit Fortschrittsbalken |
| **Metriken-Export** | Metriken im JSON- und Prometheus-Format |
| **Adaptiver Circuit Breaker** | 5 Profile mit historischem Lernen |
| **Gesundheitsmonitor** | Erkennung von Stillstand, Fehlerspiralen und Kontextaufblähung |
| **DoD-Templates** | Vorkonfigurierte Templates für 8 Technologien |

## Prozess

### 1. Session-Initialisierung

1. **Voraussetzungen prüfen**:
   - Verfügbarkeit von Claude verifizieren
   - Auf `ralph.yml`-Konfiguration prüfen
   - Session-Verzeichnis initialisieren (`.ralph/`)

2. **Projekt automatisch erkennen** (wenn `--auto-detect`):
   - Projekttyp erkennen (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Geeignetes DoD-Template laden
   - Test- und Lint-Befehle konfigurieren

3. **Konfiguration laden**:
   - `ralph.yml` oder `.claude/ralph.yml` lesen
   - Maximale Iterationen, Timeouts, DoD-Kriterien festlegen
   - Hooks initialisieren, falls aktiviert

### 2. Hauptschleife mit Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GRÜN      ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              VERSTRICHENE ZEIT: 12:34         ║
║  FORTSCHRITT ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Kontext: ████████░░ 78%        ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Definition of Done Validierung

Das DoD-System validiert den Abschluss über mehrere Kriterien:

| Validator | Beschreibung |
|-----------|--------------|
| `command` | Shell-Befehl ausführen (Tests, Lint, Build) |
| `output_contains` | Muster in Claude-Ausgabe prüfen |
| `file_changed` | Verifizieren, dass Dateien geändert wurden |
| `hook` | Bestehenden Claude-Hook ausführen |
| `human` | Interaktive menschliche Validierung |

### 4. Adaptiver Circuit Breaker (v2.0)

Wählt automatisch das Profil basierend auf Aufgaben-Schlüsselwörtern:

| Profil | Schlüsselwörter | Keine Änderungen | Fehler | Max. Iter. |
|--------|-----------------|------------------|--------|------------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Hooks-Integration (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Ralph-Kontext injizieren
     ↓
PreToolUse (einmal) → status-injector.sh → DoD-Status injizieren
     ↓
Claude arbeitet...
     ↓
Stop → stop-dod-gate.sh → Blockieren, wenn DoD nicht erfüllt (exit 2)
```

## Schnellstart-Beispiele

```bash
# Grundlegende Verwendung
ralph.sh "Benutzerauthentifizierung implementieren"

# Projekt automatisch erkennen und Konfiguration generieren
ralph.sh --auto-detect --init

# Interaktiver Konfigurationsassistent
ralph.sh --interactive

# Mit Konfigurationsdatei
ralph.sh --config=ralph.yml "Login-Bug beheben"

# Session fortsetzen
ralph.sh --continue=ralph-1704067200-a1b2
```

## Konfiguration (v2.0)

```yaml
version: "2.0"

# Hooks-Integration
hooks:
  enabled: true
  mode: "advanced"  # simple oder advanced

# Auto-Erkennung
auto_detect:
  enabled: true
  interactive: false

# Echtzeit-Dashboard
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Metriken-Export
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Gesundheitsüberwachung
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# Adaptiver Circuit Breaker
circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5

# Definition of Done
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## DoD-Templates nach Technologie

| Technologie | Test-Befehl | Lint-Befehl |
|-------------|-------------|-------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Ausgabe

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Kontinuierliche KI-Agent-Schleife v2.0║
╚════════════════════════════════════════════════════════════╝

✓ Erkannt: react-typescript (HOHE Konfidenz)
✓ Session erstellt: ralph-1704067200-a1b2
✓ Hooks initialisiert (erweiterter Modus)

ℹ Ralph-Schleife wird gestartet...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iteration 1 von 25 (Profil: medium_feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Claude wird aufgerufen...
ℹ DoD-Kriterien werden geprüft...
  ✓ [tests] Alle Tests bestehen - BESTANDEN
  ✓ [lint] Keine Lint-Fehler - BESTANDEN
  ✓ [completion] Claude signalisiert Abschluss - BESTANDEN

  Alle erforderlichen Kriterien bestanden!

✓ DoD BESTANDEN

╔════════════════════════════════════════════════════════════╗
║     📊 Session-Zusammenfassung                              ║
╚════════════════════════════════════════════════════════════╝

  Session-ID:        ralph-1704067200-a1b2
  Profil:            medium_feature
  Gesamtiterationen: 3
  Dauer:             45s
  DoD-Status:        BESTANDEN
  Beendigungsgrund:  dod_complete
  Metriken exportiert: .ralph/sessions/.../metrics-export.json
```

## Fehlermodi & Wiederherstellung

### DoD-Validator-Fehler

Wenn DoD-Validatoren wiederholt fehlschlagen, wendet Ralph eskalierende Wiederherstellung an:

| Aufeinanderfolgende Fehler | Aktion |
|---------------------------|--------|
| 1-2 | Erneut versuchen mit Kontext — Ralph fügt vorherige Fehlerausgabe ein |
| 3 | Circuit-Breaker-Prüfung auslösen — bewerten, ob Aufgabe feststeckt |
| 4+ | Circuit Breaker ausgelöst — Session stoppt mit `exit_reason: circuit_breaker` |

### Timeout-Behandlung

| Timeout-Typ | Standard | Konfiguration |
|-------------|---------|---------------|
| Pro Iteration | 5 min | `circuit_breaker.iteration_timeout` |
| Gesamte Session | 30 min | `circuit_breaker.session_timeout` |
| DoD-Befehl | 60 Sek. | `definition_of_done.timeout` |

Wenn ein Timeout ausgelöst wird:
1. Aktuelle Iteration wird abgebrochen
2. Teilergebnis wird im Session-Status gespeichert
3. Circuit-Breaker-Zähler wird erhöht
4. Mit `--continue=<session-id>` fortsetzen, um erneut zu versuchen

### Häufige Beendigungsgründe

| Beendigungsgrund | Bedeutung | Wiederherstellung |
|-----------------|-----------|-------------------|
| `dod_complete` | Alle DoD-Kriterien bestanden | Erfolg — keine Maßnahme nötig |
| `circuit_breaker` | Zu viele Fehler | Aufgabenumfang überprüfen, DoD vereinfachen |
| `max_iterations` | Iterationslimit erreicht | Limit erhöhen oder in Teilaufgaben aufteilen |
| `timeout` | Session-Timeout abgelaufen | Fortsetzen oder Timeout erhöhen |
| `user_abort` | Benutzer abgebrochen (Strg+C) | Mit `--continue` fortsetzen |

## Best Practices

1. **Auto-Detect verwenden**: Ralph DoD für Ihren Stack konfigurieren lassen
2. **Klare Aufgabenbeschreibung**: Spezifische, umsetzbare Aufgaben angeben
3. **TDD verwenden**: Tests zuerst schreiben, Ralph implementieren lassen
4. **Dashboard überwachen**: Fortschritt in Echtzeit beobachten
5. **Metriken überprüfen**: Session-Metriken für Optimierung analysieren
6. **Realistische Timeouts setzen**: Timeouts an Aufgabenkomplexität anpassen
7. **Circuit-Breaker-Profile verwenden**: Profil an Aufgabentyp anpassen (quick_fix vs. large_feature)

## Verwandt

- `@ralph-conductor` - Agent für Ralph-Orchestrierung
- `/qa:tdd` - TDD-basierte Fehlerbehebung
- `/sprint:dev` - Sprint-Entwicklung mit TDD
