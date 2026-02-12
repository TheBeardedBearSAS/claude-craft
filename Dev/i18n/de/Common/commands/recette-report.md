---
description: QA Recette Berichte aus Sitzungsdaten generieren
argument-hint: --session=<session-id> [--format=<md|html|json>] [--output=<path>]
---

# QA Recette Report - Berichtsgenerierung

Generiert detaillierte Berichte aus QA Recette Sitzungsdaten. Unterstuetzt mehrere Ausgabeformate und Sitzungsvergleiche.

## Argumente

**$ARGUMENTS**

- `--session=<id>` : Sitzungs-ID fuer Berichtsgenerierung **[erforderlich]**
- `--format=<type>` : Ausgabeformat (md, html, json) — Standard: md
- `--output=<path>` : Benutzerdefinierter Ausgabepfad (Standard: `.recette/reports/`)
- `--include-screenshots` : Screenshots in HTML-Bericht einbetten
- `--compare=<id>` : Mit einer anderen Sitzung fuer Vergleichsbericht vergleichen

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Multi-Format** | Markdown-, HTML- oder JSON-Berichte generieren |
| **Sitzungsvergleich** | Zwei Laeufe vergleichen um Regressionen zu erkennen |
| **Goldene-Regel-Abschnitt** | Dedizierter Compliance-Abschnitt in Berichten |
| **Screenshot-Einbettung** | Fehler-Screenshots in HTML-Berichte einbetten |
| **Test-Rueckverfolgbarkeit** | Vollstaendige Rueckverfolgbarkeit von AC zu Testergebnissen |
| **Metrik-Zusammenfassung** | Bestehens-/Fehlerraten, Zeitangaben, Fehlerklassifizierung |

## Prozess

### 1. Datensammlung

```
┌─────────────────────────────────────────┐
│  1. load_session_data(session_id)       │
│     - .recette/sessions/{id}/ lesen     │
│     - state.yaml laden                  │
│     - fix-state.yaml laden wenn vorh.   │
│     - Screenshots und Logs sammeln      │
│     - Regressionsregister laden         │
└─────────────────────────────────────────┘
```

### 2. Berichtsgenerierung

```
┌─────────────────────────────────────────┐
│  2. generate_report(format)             │
│     - Zusammenfassungsabschnitt bauen   │
│     - Testergebnisse bauen              │
│     - Fehlerdetails bauen               │
│     - Regressionstests bauen            │
│     - Goldene-Regel-Erklaerung bauen    │
│     - Format-Template anwenden          │
│     - In Ausgabepfad schreiben          │
└─────────────────────────────────────────┘
```

### 3. Vergleichsmodus (--compare)

Vergleicht zwei Sitzungen:

```
## Vergleich: REC-20260130-143022 vs REC-20260201-140000

| Metrik    | Sitzung 1 | Sitzung 2 | Delta   |
|-----------|-----------|-----------|---------|
| Tests     | 15        | 15        | =       |
| Bestanden | 12        | 14        | +2      |
| Fehlgeschl| 2         | 0         | -2      |
| Dauer     | 14m 48s   | 12m 15s   | -2m 33s |

### Behobene Fehler
- ERR-001: Login-Validierung — BEHOBEN
- ERR-002: API-Timeout — BEHOBEN

### Neue Fehler
(keine)

### Regressionsstatus
Keine Verstoesse gegen die Goldene Regel erkannt.
```

## Datenquellen

| Quelle | Pfad | Beschreibung |
|--------|------|--------------|
| Sitzungszustand | `.recette/sessions/{id}/state.yaml` | Ergebnisse und Fortschritt |
| Behebungszustand | `.recette/sessions/{id}/fix-state.yaml` | Behebungsstatus |
| Screenshots | `.recette/sessions/{id}/screenshots/` | Fehler-Screenshots |
| Logs | `.recette/sessions/{id}/logs/` | Ausfuehrungslogs |
| Register | `.recette/regression/registry.yaml` | Regressionsregister |
| Template | `Tools/Recette/templates/report.md.template` | Berichtstemplate |

## Beispiele

```bash
# Markdown-Bericht generieren (Standard)
/qa:recette-report --session=REC-20260130-143022

# HTML-Bericht mit Screenshots generieren
/qa:recette-report --session=REC-20260130-143022 --format=html --include-screenshots

# JSON-Bericht fuer CI-Integration generieren
/qa:recette-report --session=REC-20260130-143022 --format=json

# Benutzerdefinierter Ausgabepfad
/qa:recette-report --session=REC-20260130-143022 --output=./reports/sprint-3/

# Zwei Sitzungen vergleichen
/qa:recette-report --session=REC-20260201-140000 --compare=REC-20260130-143022
```

## Ausgabestruktur

```
.recette/reports/
├── REC-20260130-143022-report.md       # Markdown-Bericht
├── REC-20260130-143022-report.html     # HTML-Bericht (wenn --format=html)
├── REC-20260130-143022-report.json     # JSON-Bericht (wenn --format=json)
└── REC-20260201-vs-20260130-diff.md    # Vergleichsbericht (wenn --compare)
```

## Verwandte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/qa:recette` | Akzeptanztests ausfuehren |
| `/qa:recette-fix` | Bugs aus einer Sitzung beheben |
| `/qa:recette-status` | Sitzungsstatus anzeigen |
| `/qa:recette-regression` | Regressionstests anzeigen |

## Fehlermeldungen

| Fehler | Loesung |
|--------|---------|
| "Sitzung nicht gefunden" | Ueberpruefen Sie die Sitzungs-ID in `.recette/sessions/` |
| "Keine Testergebnisse" | Sitzung hat keine abgeschlossenen Tests fuer den Bericht |
| "Template nicht gefunden" | Pruefen Sie ob `Tools/Recette/templates/` existiert |
| "Vergleichssitzung nicht gefunden" | Ueberpruefen Sie die Vergleichs-Sitzungs-ID |

## Best Practices

1. **Nach jedem Lauf generieren** : Bericht sofort nach der Recette erstellen
2. **HTML fuer Stakeholder** : HTML-Format mit Screenshots ist ideal zum Teilen
3. **JSON fuer CI** : JSON-Berichte in Ihre CI/CD-Pipeline integrieren
4. **Laeufe vergleichen** : --compare nutzen um Fortschritt zwischen Iterationen zu verfolgen
5. **Berichte archivieren** : Berichte in Versionskontrolle fuer Audit-Trail aufbewahren
