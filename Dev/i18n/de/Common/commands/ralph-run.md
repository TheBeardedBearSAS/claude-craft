---
description: Claude in kontinuierlicher Schleife ausfuhren bis zur Aufgabenerledigung (Ralph Wiggum v2.0)
argument-hint: <aufgabenbeschreibung> [--auto-detect|--init|--interactive]
---

# Ralph Run - Kontinuierliche KI-Agent-Schleife v2.0

Fuhrt Claude in einer kontinuierlichen Schleife aus, bis die Aufgabe abgeschlossen ist oder die Definition of Done (DoD) Kriterien erfullt sind.

## Argumente

**$ARGUMENTS**

- `<aufgabenbeschreibung>`: Die Aufgabe fur Claude
- `--auto-detect`: Automatische Projekterkennung und DoD-Konfiguration
- `--init`: Konfiguration generieren ohne Ausfuhrung
- `--interactive`: Interaktiver Konfigurationsassistent

## Neue Funktionen v2.0

| Funktion | Beschreibung |
|----------|--------------|
| **Hooks-Integration** | Bidirektionale Integration mit Claude Code 2.1.23+ |
| **Auto-Erkennung** | Automatische Projekttyp-Erkennung |
| **Dashboard** | Echtzeit-Anzeige mit Fortschrittsbalken |
| **Metriken-Export** | JSON und Prometheus Format |
| **Adaptiver Circuit Breaker** | 5 Profile mit historischem Lernen |
| **Gesundheitsmonitor** | Erkennung von Stillstand, Fehlerspiralen |
| **DoD-Templates** | Vorkonfigurierte Templates fur 8 Technologien |

## Circuit Breaker Adaptiv (v2.0)

| Profil | Schlusselworter | Keine And. | Fehler | Max Iter |
|--------|-----------------|------------|--------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

## Schnellstart

```bash
# Grundlegende Verwendung
ralph.sh "Benutzerauthentifizierung implementieren"

# Erkennen und Konfiguration generieren
ralph.sh --auto-detect --init

# Interaktiver Assistent
ralph.sh --interactive
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

## Verwandt

- `@ralph-conductor` - Agent fur Ralph-Orchestrierung
- `/common:fix-bug-tdd` - TDD-basierte Fehlerbehebung
- `/project:sprint-dev` - Sprint-Entwicklung mit TDD
