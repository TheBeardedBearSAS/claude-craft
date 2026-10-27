---
name: trace
description: "Bidirektionale Traceability-Matrix (Anforderung → Story → Code → Tests); --gaps listet nicht abgedeckte Anforderungen, --by-priority gruppiert nach MoSCoW-Priorität"
argument-hint: "[all|requirement|story|code] [ID] [--gaps] [--by-priority] [--level=story|code|test|all] [--format=table|mermaid|json]"
---

# /project:trace

## Auftrag

Jede Anforderung des PRD mit User Stories, Code und Tests verknüpfen. Die Standardansicht ist die vollständige bidirektionale Matrix; `--gaps` wandelt sie in einen Abdeckungsbericht um, der nur auflistet, was nicht abgedeckt ist (das ehemalige `/project:trace --gaps`); `--by-priority` gruppiert das Ergebnis nach MoSCoW-Priorität.

## Verwendung

| Aufruf | Wirkung | Ersetzt |
|--------|---------|---------|
| `/project:trace` oder `/project:trace all` | Vollständige Matrix: Anforderung → Story → Code → Tests | `/project:trace` |
| `/project:trace requirement FR-001` | Eine Anforderung abwärts verfolgen | `/project:trace --scope requirement --id FR-001` |
| `/project:trace story US-001` | Eine Story aufwärts (Anforderungen) und abwärts (Code, Tests) verfolgen | `/project:trace --scope story` |
| `/project:trace code` | Code-Dateien mit und ohne Story-Referenz | `/project:trace --scope code` |
| `/project:trace --gaps` | Abdeckungsbericht: Anforderungen, die weder durch Stories, Code noch Tests abgedeckt sind, mit empfohlenen Maßnahmen | `/project:trace --gaps` |
| `/project:trace --gaps --level test` | Wie oben, begrenzt auf eine Abdeckungsebene (`story`, `code`, `test`, `all`; Standard `all`) | `/project:trace --gaps --level test` |
| `/project:trace --by-priority` | Anforderungen und Abdeckungsquoten nach MoSCoW-Priorität gruppieren | neu (zuvor ein Abschnitt von coverage-map) |

Die Optionen lassen sich kombinieren: `/project:trace --gaps --by-priority` liefert den Abdeckungsbericht mit Aufschlüsselung nach Priorität.

## Argumente

`$ARGUMENTS` auswerten:
- Erstes Positionsargument aus `all|requirement|story|code` → Umfang (Standard `all`).
- Nächstes Positionsargument, das auf `FR-\d+` oder `US-\d+` passt → zu verfolgende ID (für `requirement` und `story` erforderlich).
- `--gaps` → Abdeckungsmodus. `--level` wird nur in diesem Modus gelesen.
- `--by-priority` → nach Priorität gruppieren: P0 = Must have, P1 = Should have, P2 = Could have / Nice to have.
- `--format` → `table` (Standard), `mermaid`, `json`.

## Voraussetzungen

- `project-management/prd.md` existiert mit Anforderungs-IDs FR-xxx
- `project-management/backlog/` enthält User Stories mit `Implements:`-Referenzen
- Codebasis mit Kommentaren `// Story: US-xxx` oder `# Story: US-xxx` (optional für `--gaps --level story`)
- Testdateien mit Story-/Anforderungsreferenzen

## Plan Mode

> **Der Plan Mode ist verpflichtend.** Vor der Ausführung aktiviert Claude den Plan Mode, um den betroffenen Code zu analysieren, einen Umsetzungsplan vorzuschlagen und auf Ihre Freigabe zu warten, bevor Änderungen vorgenommen werden.

## Gemeinsame Scans

Beide Modi führen dieselben vier Scans nur einmal aus; die Ergebnisse speisen entweder die Matrix oder den Abdeckungsbericht. Der **Status** einer Story stammt immer aus `.bmad/sprint-status.yaml` (Single Source of Truth); Markdown-Dateien liefern nur den Inhalt.

### Scan 1: Anforderungen

1. `project-management/prd.md` lesen
2. Alle FR-xxx-IDs aus dem Abschnitt der funktionalen Anforderungen extrahieren
3. Text, Priorität (P0/P1/P2) und Akzeptanzkriterien erfassen
4. Register: `{FR-001: {text, priority}}`; Anforderungen pro Priorität zählen

### Scan 2: User Stories

1. `project-management/backlog/` nach `US-*.md` (oder `user-stories/`-Dateien) durchsuchen
2. In jeder Story die Zeile `Implements:` oder den Abschnitt `Traceability` lesen
3. Zuordnung: `{US-001: [FR-001, FR-003]}`; Status und Sprint aus `.bmad/sprint-status.yaml` lesen
4. Eine Anforderung, auf die keine Story verweist, ist „No Story“

### Scan 3: Code

1. Den Code nach `// Story: US-xxx`, `# Story: US-xxx`, `@story US-xxx` durchsuchen
2. Zuordnung mit Datei und Zeile: `{US-001: [src/Service/OrderService.php:42]}`
3. Eine Story ohne Referenz ist „No Code“; Code-Dateien ohne Story-Referenz auflisten

### Scan 4: Tests

1. Testverzeichnisse nach Referenzen auf `US-xxx` / `FR-xxx` durchsuchen und Testnamen prüfen
2. Zuordnung: `{US-001: [tests/OrderServiceTest.php]}`
3. Eine Story mit Code, aber ohne Testreferenz ist „No Tests“

```
╔══════════════════════════════════════════════════════════╗
║ Requirements: {n} | Stories: {n} | Files: {n} | Tests: {n}║
╚══════════════════════════════════════════════════════════╝
```

## Matrixmodus (Standard)

Die vier Zuordnungen kombinieren. Ausgabe (Format table):

```
Bidirectional Traceability Matrix
=================================

FR-001 (P0) User Authentication
  ├── US-001: Login with email/password
  │   ├── src/Service/AuthService.php:25
  │   ├── tests/AuthServiceTest.php ✅
  │   └── tests/AuthControllerTest.php ✅
  └── US-002: Password reset flow
      ├── src/Service/PasswordResetService.php:10
      └── tests/PasswordResetServiceTest.php ✅

FR-002 (P0) User Registration
  └── US-003: Register with email
      ├── src/Service/RegistrationService.php:12
      └── ⚠️ NO TESTS

FR-010 (P1) Export to CSV
  └── ⚠️ NO STORIES

Coverage Summary
================
| Level | Covered | Total | Percentage |
|-------|---------|-------|------------|
| Requirements → Stories | 8 | 10 | 80% |
| Stories → Code | 7 | 8 | 87% |
| Stories → Tests | 6 | 8 | 75% |
| End-to-End (FR → Test) | 6 | 10 | 60% |

Gaps Identified
===============
| Type | ID | Description | Action Needed |
|------|----|-------------|---------------|
| No Stories | FR-010 | Export to CSV | Create user story |
| No Tests | US-003 | Register with email | Add test coverage |
```

Mit einer ID wird nur dieser Zweig ausgegeben, mit Story-Status und Testanzahl (z. B. `US-001: Login [Done]`, `tests/AuthServiceTest.php ✅ (12 tests)`), danach `Status: Fully covered (2/2 stories, 3/3 code files, 3/3 test files)`.

### Mermaid (`--format mermaid`)

`graph LR` mit vier Subgraphen (Requirements, Stories, Code, Tests); durchgezogene Pfeile für Verknüpfungen, gepunktete Pfeile (`-.->|NO STORY|`) zu einem Lückenknoten für fehlende Verknüpfungen; Lücken mit Stil `fill:#ff6b6b`.

### JSON (`--format json`)

```json
{
  "generated_at": "2026-02-19T10:00:00Z",
  "requirements": {"FR-001": {"text": "User Authentication", "priority": "P0", "stories": ["US-001"], "covered": true}},
  "stories": {"US-001": {"title": "Login", "implements": ["FR-001"], "code_files": ["src/Service/AuthService.php"], "test_files": ["tests/AuthServiceTest.php"], "covered": true}},
  "coverage": {"requirements_to_stories": 0.80, "stories_to_code": 0.87, "stories_to_tests": 0.75, "end_to_end": 0.60},
  "gaps": [{"type": "no_stories", "id": "FR-010", "description": "Export to CSV"}]
}
```

## Lückenmodus (`--gaps`)

Nutzt die gemeinsamen Scans, berechnet die Abdeckung pro Schicht und listet nur auf, was fehlt. `--level` schränkt die berechneten Schichten ein: `story` (Scans 1-2), `code` (1-3), `test` (1-4), `all` (Standard).

```
Requirement Coverage Map
========================
| Layer | Covered | Total | Coverage | Status |
|-------|---------|-------|----------|--------|
| Stories | 8 | 10 | 80% | ⚠️ |
| Code | 7 | 8 | 87% | ⚠️ |
| Tests | 6 | 8 | 75% | ❌ |
| End-to-End | 6 | 10 | 60% | ❌ |

Uncovered Requirements
| ID | Requirement | Priority | Missing |
|----|-------------|----------|---------|
| FR-005 | Bulk export | P0 | Tests |
| FR-010 | CSV import | P1 | Story, Code, Tests |

Recommended Actions
1. 🔴 CRITICAL: FR-005 (P0) hat Code, aber keine Tests — Testabdeckung ergänzen
2. ⚠️ HIGH: FR-010 (P1) hat keine Story — User Story erstellen
3. 📝 LOW: FR-020 (P2) nicht begonnen — für künftige Sprints einplanen

Next Commands
- /project:trace requirement FR-005   → detaillierte Verfolgung einer Anforderung
- /project:backlog add story         → fehlende User Stories erstellen
- /workflow:plan --only=backlog          → Backlog mit den Lücken neu generieren
```

Mit `--level test` eine Zeile pro Story ausgeben: `US-003 | ❌ | 0 files | 0 tests` und die Maßnahme (z. B. „tests/RegistrationServiceTest.php erstellen“).

Mermaid (`--format mermaid`): `graph TD` mit einem Subgraphen pro Priorität; Knoten `FR-001 ✅`, `FR-005 ⚠️ No Tests`, `FR-010 ❌ No Story`; Stile `#4caf50` (abgedeckt), `#ff9800` (teilweise), `#f44336` (fehlend).

### Abdeckungsschwellen

| Schwelle | Status | Maßnahme |
|----------|--------|----------|
| >= 90% | ✅ Ausgezeichnet | Beibehalten |
| 80-89% | ⚠️ Gut | Lücken prüfen |
| 60-79% | ⚠️ Verbesserungsbedarf | Abdeckung priorisieren |
| < 60% | ❌ Kritisch | Sofortiges Handeln erforderlich |

## Gruppierung nach Priorität (`--by-priority`)

Funktioniert in beiden Modi. Im Matrixmodus werden die Anforderungen unter den Überschriften `P0 Must have`, `P1 Should have`, `P2 Could have` aufgelistet. Im Lückenmodus ergänzen:

```
Coverage by Priority
| Priority | Requirements | Story Coverage | Code Coverage | Test Coverage |
|----------|-------------|----------------|---------------|---------------|
| P0 (Must Have) | 5 | 100% ✅ | 100% ✅ | 80% ⚠️ |
| P1 (Should Have) | 3 | 66% ⚠️ | 50% ❌ | 33% ❌ |
| P2 (Could Have) | 2 | 0% ❌ | 0% ❌ | 0% ❌ |
```

Die empfohlenen Maßnahmen werden dann mit P0 beginnend sortiert.

## Beispielsitzung

```
User: /project:trace
Claude: 10 Anforderungen gefunden (5 P0, 3 P1, 2 P2), 8 Stories, 24 Code-Dateien, 18 Testdateien.
        [vollständige Matrix] Abdeckung: 60% Ende-zu-Ende

User: /project:trace requirement FR-001
Claude: [nur der Zweig FR-001]

User: /project:trace --gaps --by-priority
Claude: [Abdeckungsbericht mit Tabelle pro Priorität, 2 P0-Anforderungen benötigen Aufmerksamkeit]
```

## Verwandte Befehle

- `/workflow:plan --only=prd` - PRD mit Anforderungs-IDs generieren
- `/workflow:plan --only=backlog` - Backlog aus dem PRD erstellen
- `/workflow:design` - Technische Spezifikation generieren
- `/project:migrate --stories` - Fehlende Felder (wie `Implements:`) zu Stories hinzufügen
