---
description: Automatisierte Akzeptanztests mit Claude in Chrome
argument-hint: --scope=<story|epic|sprint|task> --id=<target-id> [--resume|--record-gif|--dry-run]
---

# QA Recette - Automatisierte Akzeptanztests

Fuehrt automatisierte Akzeptanztests (Recette) auf Webanwendungen mit Claude in Chrome fuer Browser-Automatisierung durch. Dieses System implementiert die **Goldene Regel**: Ein behobener Fehler darf NIE wieder auftreten.

## Argumente

**$ARGUMENTS**

- `--scope=<type>`: Testumfang (story, epic, sprint, task)
- `--id=<target-id>`: Ziel-Identifikator (z.B. US-001, EPIC-01, Sprint-3)
- `--resume=<session-id>`: Von einer vorherigen Sitzung fortsetzen
- `--record-gif`: GIF der Ausfuehrung aufzeichnen
- `--dry-run`: Plan generieren ohne Tests auszufuehren
- `--base-url=<url>`: Basis-URL ueberschreiben

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Umfassende Plaene** | Generiert umfassende Testplaene aus Akzeptanzkriterien |
| **Browser-Automatisierung** | Verwendet Claude in Chrome fuer echte Browser-Tests |
| **Sitzungswiederherstellung** | Checkpoint-basierte Fortsetzung fuer unterbrochene Sitzungen |
| **Goldene Regel** | Automatische Regressionstestgenerierung fuer alle Fehler |
| **Lebende Dokumentation** | Pflegt Testdokumentation mit Rueckverfolgbarkeit |
| **Regressionserkennung** | Vergleicht Laeufe zur Erkennung von Regressionen |

## Voraussetzungen

1. **Claude in Chrome Extension**: Version 1.0.36 oder hoeher
2. **Chrome Browser**: Geoeffnet mit aktiver Extension
3. **Claude Code**: Gestartet mit `--chrome` Flag oder `/chrome` Befehl

```bash
# Claude Code mit Chrome-Unterstuetzung starten
claude --chrome

# Oder Chrome in bestehender Sitzung aktivieren
/chrome
```

## Prozess

### 1. Verifizierung

Der Befehl prueft zuerst, ob Chrome MCP verfuegbar ist:

```
┌─────────────────────────────────────────┐
│  1. check_chrome_mcp()                  │
│     - MCP claude-in-chrome vorhanden?   │
│     - Extension verbunden?              │
│     - Website-Berechtigungen OK?        │
└─────────────────────────────────────────┘
```

### 2. Testplan-Generierung

Generiert einen umfassenden Testplan, der abdeckt:

| Kategorie | Beschreibung |
|-----------|--------------|
| `acceptance_criteria_validation` | Tests fuer jedes AC |
| `edge_cases` | Randbedingungen |
| `error_scenarios` | Fehlerbehandlung |
| `ui_ux_verification` | UI/UX-Konsistenz |
| `performance_checks` | Ladezeiten |
| `security_basics` | XSS, CSRF, Injection |

### 3. Testausfuehrung

Jeder Test wird ueber Chrome ausgefuehrt:

```
Test TC-001
├── Schritt 1: navigate → /login
├── Schritt 2: type → #email = "user@test.com"
├── Schritt 3: click → button[type='submit']
└── Assertions
    ├── url_matches → ^.*/dashboard$
    └── element_visible → .welcome-message
```

### 4. Fehler → Test → Regression

Wenn ein Fehler erkannt wird:

```
1. Fehler waehrend Recette erkannt
         │
         ▼
2. Klassifizierung (visual, interaction, validation, logic, security, API)
         │
         ▼
3. Tests nach Typ generieren:
   - Logic/Validation → Unit-Test
   - API/Service → Funktionstest
   - Benutzerfluss → Behat-Feature
         │
         ▼
4. Zum Regressionsregister mit @regression Tag hinzufuegen
         │
         ▼
5. Bug beheben (TDD-Workflow)
         │
         ▼
6. Verifizieren: alle Regressionstests bestehen
```

## Schnellstart-Beispiele

```bash
# Eine bestimmte Story testen
/qa:recette --scope=story --id=US-001

# Alle Stories eines Sprints testen
/qa:recette --scope=sprint --id=Sprint-3

# Dry Run um Testplan zu sehen
/qa:recette --scope=story --id=US-001 --dry-run

# Unterbrochene Sitzung fortsetzen
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022

# Ausfuehrung als GIF aufzeichnen
/qa:recette --scope=story --id=US-001 --record-gif
```

## Sitzungswiederherstellung

Sitzungen werden nach jedem Test gespeichert:

```yaml
# .recette/sessions/{session-id}/state.yaml
session:
  id: "REC-20260130-143022"
  status: "paused"

progress:
  current_test_index: 5
  tests:
    total: 15
    passed: 4
    failed: 1
    pending: 10

recovery:
  resumable: true
  resume_from:
    test_id: "TC-005"
    step_index: 0
```

Zum Fortsetzen:

```bash
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022
```

## Regressionsregister

Alle erkannten Fehler werden verfolgt:

```yaml
# .recette/regression/registry.yaml
entries:
  - id: "REG-001"
    error_id: "ERR-001"
    source:
      scope: "story"
      target_id: "US-001"
    generated_tests:
      - type: "unit"
        path: "tests/Unit/Auth/LoginErrorTest.php"
      - type: "behat"
        path: "features/auth/login_error.feature"
    fix:
      status: "verified"
```

## Ausgabestruktur

```
.recette/
├── plans/              # Testplaene (YAML)
│   └── story-US-001-plan.yaml
├── sessions/           # Sitzungszustaende
│   └── REC-20260130-143022/
│       ├── state.yaml
│       ├── screenshots/
│       ├── checkpoints/
│       └── logs/
├── regression/         # Regressions-Suite
│   ├── registry.yaml
│   └── tests/
│       ├── Unit/
│       ├── Functional/
│       └── Behat/
├── metrics/            # Historische Daten
│   └── history.jsonl
└── reports/            # Generierte Berichte
    └── REC-20260130-143022-report.md
```

## Verwandte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/qa:recette-fix` | Bugs aus einer Recette-Sitzung beheben |
| `/qa:recette-status` | Sitzungsstatus anzeigen |
| `/qa:recette-regression` | Regressionstests anzeigen |
| `/qa:recette-report` | Bericht generieren |
| `/qa:validate` | Story AC validieren |
| `/qa:automate` | Automatisierte Tests erstellen |

## Chrome-Faehigkeiten

| Kategorie | Aktionen |
|-----------|----------|
| **Navigation** | navigate, back, forward, refresh |
| **Interaktion** | click, type, fill_form, scroll, hover |
| **Lesen** | DOM-Zustand, Element-Text, Attribute |
| **Debugging** | Konsolen-Logs, Netzwerkanfragen, Fehler |
| **Erfassung** | Screenshot, GIF-Aufnahme |

## Fehlermeldungen

| Fehler | Loesung |
|--------|---------|
| "MCP nicht erkannt" | `claude --chrome` oder `/chrome` ausfuehren |
| "Extension nicht verbunden" | Chrome oeffnen, Extension pruefen |
| "Berechtigung erforderlich" | Extension auf der Domain autorisieren |
| "Version veraltet" | Chrome Extension auf v1.0.36+ aktualisieren |

## Best Practices

1. **Mit Dry-Run beginnen**: Testplan vor Ausfuehrung pruefen
2. **Spezifische Scopes verwenden**: Stories einzeln testen fuer bessere Nachverfolgung
3. **Regressionen pruefen**: `.recette/regression/` nach jedem Lauf konsultieren
4. **GIF-Aufnahme aktivieren**: Zum Debuggen komplexer Fehler
5. **Basis-URL pflegen**: Im Plan fuer konsistente Tests konfigurieren

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Wenn Bugs gefunden wurden:                              ║
║  → /qa:fix                                               ║
║    Automatisierte Fehlerbehebung                         ║
║  → /qa:tdd                                               ║
║    Fehlerbehebung mit TDD-Ansatz                         ║
║                                                          ║
║  Wenn alle Tests bestehen:                               ║
║  → /qa:report                                            ║
║    Recette-Bericht generieren                            ║
║  → /sprint:transition done                               ║
║    Story als erledigt markieren                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
