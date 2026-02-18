---
description: QA Recette Sitzungsstatus und Fortschritt anzeigen
argument-hint: [--session=<id>|--all] [--scope=<story|sprint>] [--status=<running|completed|paused|failed>]
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
/qa:recette-status --all

# Detaillierten Status einer Sitzung anzeigen
/qa:recette-status --session=REC-20260130-143022

# Laufende Sitzungen filtern
/qa:recette-status --all --status=running

# Nach Umfang filtern
/qa:recette-status --all --scope=sprint

# Live-Ueberwachung einer Sitzung
/qa:recette-status --session=REC-20260130-143022 --watch

# Ausgabe als YAML
/qa:recette-status --session=REC-20260130-143022 --format=yaml

# Ausgabe als JSON (fuer Scripting)
/qa:recette-status --all --format=json
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
| `/qa:recette-fix` | Bugs aus einer Sitzung beheben |
| `/qa:recette-regression` | Regressionstests anzeigen |
| `/qa:recette-report` | Bericht generieren |

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
║  → /qa:report                                            ║
║    Recette-Bericht generieren                            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
