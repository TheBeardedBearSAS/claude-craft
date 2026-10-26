---
description: "QA Recette Sitzungsstatus und Fortschritt anzeigen oder Berichte erzeugen (--report)"
argument-hint: "[--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>] [--report] [--format=<md|html|json>] [--output=<path>] [--compare=<id>]"
---

# QA Recette Status - Sitzungsstatus und Fortschritt

Zeigt den Status und Fortschritt von QA Recette Sitzungen an. Einzelne Sitzungsdetails anzeigen oder alle Sitzungen mit Filterung auflisten.

## Argumente

**$ARGUMENTS**

- `--session=<id>` : Detaillierten Status einer bestimmten Sitzung anzeigen (z.B. REC-20260130-143022)
- `--all` : Alle Sitzungen mit Zusammenfassung auflisten
- `--scope=<type>` : Nach Umfang filtern (story, sprint)
- `--status=<status>` : Nach Status filtern (running, completed, paused, failed)
- `--format=<type>` : Ausgabeformat (table, yaml, json) — Standard: table
- `--watch` : Live-Aktualisierungsmodus (alle 5 Sekunden)
- `--report`: Berichtsmodus (ehemals `/qa:status --report`): Bericht aus einer Sitzung erzeugen; erfordert `--session=<id>`
- `--format=<type>`: mit `--report`: md, html, json (Standard: md)
- `--output=<path>`: mit `--report`: benutzerdefinierter Ausgabepfad (Standard: `.recette/reports/`)
- `--include-screenshots`: mit `--report`: Screenshots in den HTML-Bericht einbetten
- `--compare=<id>`: mit `--report`: mit einer anderen Sitzung für ein Regressions-Diff vergleichen

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Sitzungsliste** | Alle Sitzungen mit Status, Fortschritt und Daten auflisten |
| **Detailansicht** | Einzelne Sitzung mit Testaufschluesselung, Fehlern, Zeitangaben |
| **Fortschrittsbalken** | Visuelle Fortschrittsanzeigen fuer laufende Sitzungen |
| **Filterung** | Nach Umfang, Status oder Datumsbereich filtern |
| **Live-Modus** | Watch-Modus fuer Echtzeit-Ueberwachung |
| **Behebungsstatus** | Zeigt fix-state.yaml Status wenn recette-fix ausgefuehrt wurde |

## Prozess

### 1. Sitzungserkennung

```
┌─────────────────────────────────────────┐
│  1. scan_sessions()                     │
│     - .recette/sessions/ lesen          │
│     - state.yaml pro Sitzung laden      │
│     - fix-state.yaml laden wenn vorh.   │
│     - Filter anwenden                   │
└─────────────────────────────────────────┘
```

### 2. Sitzungsliste (--all)

Zeigt eine Uebersichtstabelle:

```
┌──────────────────────┬────────┬──────────┬───────────┬──────────┬────────────┐
│ Sitzungs-ID          │ Scope  │ Ziel     │ Status    │ Fortschr.│ Datum      │
├──────────────────────┼────────┼──────────┼───────────┼──────────┼────────────┤
│ REC-20260130-143022  │ story  │ US-001   │ completed │ 15/15    │ 2026-01-30 │
│ REC-20260131-091500  │ sprint │ Sprint-3 │ paused    │ 8/23     │ 2026-01-31 │
│ REC-20260201-140000  │ story  │ US-005   │ running   │ 3/10     │ 2026-02-01 │
└──────────────────────┴────────┴──────────┴───────────┴──────────┴────────────┘
```

### 3. Sitzungsdetail (--session=<id>)

Zeigt umfassende Informationen:

```
Sitzung:  REC-20260130-143022
Status:   completed
Scope:    story → US-001
Start:    2026-01-30 14:30:22
Ende:     2026-01-30 14:45:10
Dauer:    14m 48s

Tests:
  Gesamt:       15
  Bestanden:    12  ████████████░░░  80%
  Fehlgeschl.:   2  ██░░░░░░░░░░░░░  13%
  Uebersprungen: 1  █░░░░░░░░░░░░░░   7%

Fehler:
  - ERR-001: Login-Formularvalidierung nicht angezeigt (visual)
  - ERR-002: API-Timeout auf /api/users (api)

Generierte Regressionstests: 3
Behebungsstatus: completed (2/2 Bugs behoben)
```

## Verwendung

| Modus / Option | Was es tut | Ersetzt |
|---|---|---|
| `/qa:status --all` / `--session=<id>` | Sitzungen auflisten oder eine Sitzung im Detail anzeigen | — |
| `/qa:status --report --session=<id>` | Markdown-/HTML-/JSON-Bericht erzeugen (`--format`, `--output`, `--include-screenshots`) | `/qa:status --report` |
| `/qa:status --report --session=<id> --compare=<id>` | Zwei Sitzungen vergleichen, um Regressionen zu erkennen | `/qa:status --report --compare` |

## Berichtsmodus (--report)

Erzeugt detaillierte Berichte aus den Sitzungsdaten. Ausgabe in mehreren Formaten (Markdown, HTML, JSON), Abschnitt zur Einhaltung der Golden Rule, eingebettete Screenshots, Rückverfolgbarkeit von Akzeptanzkriterien zu Tests und Erfolgs-/Fehlermetriken. Ohne `--format` ist der Bericht Markdown.

### Berichtsprozess

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - Read .recette/sessions/{id}/      │
│     - Load state.yaml                   │
│     - Load fix-state.yaml if present    │
│     - Collect screenshots and logs      │
│     - Load regression registry          │
├─────────────────────────────────────────┤
│  2. generate_report(format)             │
│     - Build summary, test results,      │
│       error details, regression tests   │
│     - Build Golden Rule statement       │
│     - Apply format template             │
│     - Write to output path              │
└─────────────────────────────────────────┘
```

### Berichtsstruktur

```markdown
# QA Recette Report — REC-20260130-143022

## Summary
| Metric | Value |
|--------|-------|
| Session | REC-20260130-143022 |
| Scope | story → US-001 |
| Duration | 14m 48s |
| Passed / Failed / Skipped | 12 (80%) / 2 (13%) / 1 (7%) |

## Test Results
### Failed Tests (2)
- TC-008: Login validation error display ✗ (ERR-001)

## Error Details
### ERR-001: Login validation not displayed
- Type: visual · Severity: medium · Screenshot: screenshots/err-001.png

## Regression Tests Generated
| ID | Error | Test Type | Path |
|----|-------|-----------|------|
| REG-001 | ERR-001 | behat | features/auth/login_validation.feature |

## Golden Rule Compliance
All detected errors have generated regression tests.
Registry updated: .recette/regression/registry.yaml
```

### Vergleich (--compare)

Vergleicht zwei Durchläufe: Metrik-Deltas, behobene Fehler, neue Fehler und Verstöße gegen die Golden Rule.

```
## Comparison: REC-20260130-143022 vs REC-20260201-140000

| Metric | Session 1 | Session 2 | Delta |
|--------|-----------|-----------|-------|
| Passed | 12 | 14 | +2 |
| Failed | 2 | 0 | -2 |

### Resolved Errors / New Errors / Regression Status
```

### Datenquellen des Berichts

| Quelle | Pfad | Beschreibung |
|---|---|---|
| Registry | `.recette/regression/registry.yaml` | Registry der Regressionstests |
| Vorlage | `Tools/Recette/templates/report.md.template` | Berichtsvorlage |

### Berichtsfehler

| Fehler | Lösung |
|---|---|
| "Template not found" | Prüfen, ob `Tools/Recette/templates/` existiert |
| "Compare session not found" | Die ID der Vergleichssitzung prüfen |
| "No test results" | Die Sitzung hat keine abgeschlossenen Tests für den Bericht |

### Berichtsbeispiele

```bash
# Markdown-Bericht erzeugen (Standard)
/qa:status --report --session=REC-20260130-143022

# HTML-Bericht mit Screenshots erzeugen
/qa:status --report --session=REC-20260130-143022 --format=html --include-screenshots

# JSON-Bericht für die CI-Integration erzeugen
/qa:status --report --session=REC-20260130-143022 --format=json

# Benutzerdefinierter Ausgabepfad
/qa:status --report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Zwei Sitzungen vergleichen
/qa:status --report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

### Ausgabestruktur des Berichts

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown report
├── REC-20260130-143022-report.html     # HTML report (if --format=html)
├── REC-20260130-143022-report.json     # JSON report (if --format=json)
└── REC-20260201-vs-20260130-diff.md    # Comparison report (if --compare)
```

## Datenquellen

| Quelle | Pfad | Beschreibung |
|--------|------|--------------|
| Sitzungszustand | `.recette/sessions/{id}/state.yaml` | Fortschritt und Testergebnisse |
| Behebungszustand | `.recette/sessions/{id}/fix-state.yaml` | Behebungsfortschritt |
| Screenshots | `.recette/sessions/{id}/screenshots/` | Fehler-Screenshots |
| Logs | `.recette/sessions/{id}/logs/` | Detaillierte Ausfuehrungslogs |

## Beispiele

```bash
# Alle Sitzungen auflisten
/qa:status --all

# Detaillierten Status einer Sitzung anzeigen
/qa:status --session=REC-20260130-143022

# Laufende Sitzungen filtern
/qa:status --all --status=running

# Nach Umfang filtern
/qa:status --all --scope=sprint

# Live-Ueberwachung einer Sitzung
/qa:status --session=REC-20260130-143022 --watch

# Ausgabe als YAML
/qa:status --session=REC-20260130-143022 --format=yaml

# Ausgabe als JSON (fuer Scripting)
/qa:status --all --format=json
```

## Ausgabestruktur

```
.recette/
├── sessions/
│   ├── REC-20260130-143022/
│   │   ├── state.yaml          # Sitzungszustand (von diesem Befehl gelesen)
│   │   ├── fix-state.yaml      # Behebungsfortschritt (wenn recette-fix ausgefuehrt)
│   │   ├── screenshots/
│   │   ├── checkpoints/
│   │   └── logs/
│   └── REC-20260131-091500/
│       ├── state.yaml
│       └── ...
```

## Verwandte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/qa:recette` | Akzeptanztests ausfuehren |
| `/qa:fix` | Bugs aus einer Sitzung beheben |
| `/qa:regression` | Regressionstests anzeigen |
| `/qa:status --report` | Bericht erzeugen (`--report`) |

## Fehlermeldungen

| Fehler | Loesung |
|--------|---------|
| "Keine Sitzungen gefunden" | Fuehren Sie `/qa:recette` zuerst aus |
| "Sitzung nicht gefunden" | Ueberpruefen Sie die Sitzungs-ID in `.recette/sessions/` |
| "Keine Sitzungen entsprechen dem Filter" | Passen Sie die Filterkriterien an |

## Best Practices

1. **Verwenden Sie --all zuerst** : Verschaffen Sie sich einen Ueberblick vor dem Eintauchen
2. **Ueberwachen Sie mit --watch** : Nutzen Sie den Live-Modus fuer laufende Sitzungen
3. **Pruefen Sie den Behebungsstatus** : Bestaetigen Sie die Fehlerbehebung nach recette-fix
4. **Verwenden Sie JSON fuer Automatisierung** : Leiten Sie JSON-Ausgabe an andere Tools weiter
5. **Filtern Sie nach Status** : Konzentrieren Sie sich auf pausierte/fehlgeschlagene Sitzungen

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Wenn die Sitzung Fehler hat:                            ║
║  → /qa:fix                                               ║
║    Identifizierte Bugs beheben                           ║
║                                                          ║
║  Wenn die Sitzung abgeschlossen ist:                     ║
║  → /qa:status --report                                   ║
║    Recette-Bericht generieren                            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
