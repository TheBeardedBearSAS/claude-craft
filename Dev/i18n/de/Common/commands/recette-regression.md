---
description: QA Recette Regressionstest-Register anzeigen und verwalten
argument-hint: [--list|--stats|--check] [--status=<active|verified|obsolete>] [--source=<story-id>]
---

# QA Recette Regression - Regressionstest-Register

Regressionstest-Register anzeigen und verwalten. Registrierte Tests durchsuchen, Stabilitaetswerte pruefen und Verstoesse gegen die Goldene Regel erkennen. Implementiert die **Goldene Regel**: Ein behobener Fehler darf NIE wieder auftreten.

## Argumente

**$ARGUMENTS**

- `--list` : Alle Regressionstests im Register auflisten
- `--stats` : Stabilitaetswert und Trendanalyse anzeigen
- `--check` : Regressionstests ausfuehren und Verstoesse erkennen
- `--status=<status>` : Nach Status filtern (active, verified, obsolete)
- `--source=<id>` : Nach Quell-Story/Sprint filtern (z.B. US-001)
- `--trend` : Historische Trenddaten anzeigen
- `--format=<type>` : Ausgabeformat (table, yaml, json) — Standard: table

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Register durchsuchen** | Alle Regressionstests mit Metadaten auflisten |
| **Stabilitaetswert** | Wert von 0-100 basierend auf Testbestehensrate |
| **Trendanalyse** | Historischer Trend der Regressionsstabilitaet |
| **Goldene-Regel-Pruefung** | Alarm bei Regressionstestfehlern |
| **Quellfilterung** | Tests nach Quell-Story oder Sprint filtern |
| **Statusverwaltung** | Aktive, verifizierte und veraltete Tests verfolgen |

## Prozess

### 1. Register laden

```
┌─────────────────────────────────────────┐
│  1. load_registry()                     │
│     - .recette/regression/              │
│       registry.yaml lesen               │
│     - Testmetadaten laden               │
│     - Filter anwenden                   │
└─────────────────────────────────────────┘
```

### 2. Registerliste (--list)

```
┌──────────┬──────────────────────────────┬──────────┬──────────────────────────────┬──────────┐
│ ID       │ Fehler                       │ Quelle   │ Testpfad                     │ Status   │
├──────────┼──────────────────────────────┼──────────┼──────────────────────────────┼──────────┤
│ REG-001  │ Login-Validierung nicht anz. │ US-001   │ tests/Unit/Auth/LoginTest.php │ verified │
│ REG-002  │ API-Timeout auf /api/users   │ US-001   │ tests/Func/Api/UsersTest.php  │ active   │
│ REG-003  │ Warenkorb-Berechnungsfehler  │ US-015   │ tests/Unit/Cart/TotalTest.php │ active   │
└──────────┴──────────────────────────────┴──────────┴──────────────────────────────┴──────────┘
```

### 3. Stabilitaetswert (--stats)

```
Regressions-Stabilitaetswert: 94/100

  Aufschluesselung:
    Aktive Tests:      12
    Verifizierte Tests: 8
    Veraltete Tests:    2
    Gesamt:            22

  Letzte 5 Laeufe:
    ████████████████████  100% (2026-02-01)
    ████████████████░░░░   88% (2026-01-31)
    ████████████████████  100% (2026-01-30)
    ████████████████████  100% (2026-01-29)
    ██████████████░░░░░░   75% (2026-01-28)

  Trend: ↑ Verbesserung (+6 Pkte ueber 5 Laeufe)
```

### 4. Goldene-Regel-Pruefung (--check)

```
Goldene-Regel-Pruefung: 1 VERSTOSS ERKANNT

  ⚠ REG-002: API-Timeout auf /api/users
    Quelle:  US-001
    Test:    tests/Functional/Api/UsersTest.php
    Status:  FEHLSCHLAGEND (bestand am 2026-01-30)
    Aktion:  Bug wieder aufgetreten — sofortige Behebung erforderlich

  ✓ REG-001: Login-Validierung — BESTANDEN
  ✓ REG-003: Warenkorb-Summe — BESTANDEN
  ...

  Zusammenfassung: 11/12 aktive Tests bestanden (91.7%)
```

## Datenquellen

| Quelle | Pfad | Beschreibung |
|--------|------|--------------|
| Register | `.recette/regression/registry.yaml` | Alle registrierten Regressionstests |
| Tests | `.recette/regression/tests/` | Generierte Testdateien |
| Historie | `.recette/metrics/history.jsonl` | Historische Laufdaten |

## Beispiele

```bash
# Alle Regressionstests auflisten
/qa:recette-regression --list

# Stabilitaetswert anzeigen
/qa:recette-regression --stats

# Regressionspruefung ausfuehren (Verstoesse erkennen)
/qa:recette-regression --check

# Nach Quell-Story filtern
/qa:recette-regression --list --source=US-001

# Nach Status filtern
/qa:recette-regression --list --status=active

# Historischen Trend anzeigen
/qa:recette-regression --stats --trend

# Ausgabe als JSON
/qa:recette-regression --list --format=json
```

## Ausgabestruktur

```
.recette/regression/
├── registry.yaml          # Regressionstest-Register
└── tests/
    ├── Unit/              # Unit-Regressionstests
    ├── Functional/        # Funktionale Regressionstests
    └── Behat/             # Behat-Regressionsfeatures

.recette/metrics/
└── history.jsonl          # Historische Daten fuer Trendanalyse
```

## Verwandte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/qa:recette` | Akzeptanztests ausfuehren |
| `/qa:recette-fix` | Bugs aus einer Sitzung beheben |
| `/qa:recette-status` | Sitzungsstatus anzeigen |
| `/qa:recette-report` | Bericht generieren |

## Fehlermeldungen

| Fehler | Loesung |
|--------|---------|
| "Register nicht gefunden" | Fuehren Sie `/qa:recette` zuerst aus |
| "Keine Regressionstests" | Keine Fehler in vorherigen Laeufen erkannt |
| "Verstoss gegen Goldene Regel" | Bug wieder aufgetreten — `/qa:recette-fix` ausfuehren |
| "Historiedatei fehlt" | Mindestens 2 Recette-Sitzungen fuer Trends ausfuehren |

## Best Practices

1. **Regelmaessig pruefen** : `--check` vor jedem Deployment ausfuehren
2. **Trends ueberwachen** : `--stats --trend` fuer Stabilitaetsverfolgung nutzen
3. **Verstoesse sofort beheben** : Verstoesse zeigen wieder eingefuehrte Bugs an
4. **Veraltete Tests bereinigen** : Tests als veraltet markieren wenn Features entfernt werden
5. **Nach Quelle filtern** : Regressionstests pro Story fuer gezielte Analyse untersuchen
