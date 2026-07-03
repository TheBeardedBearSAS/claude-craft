---
description: Automatisierte Fehlerbehebung aus QA Recette Sitzungen
argument-hint: --session=<session-id> [--dry-run|--skip-fix|--severity=<level>|--auto-commit]
---

# QA Recette Fix - Automatisierte Fehlerbehebung

Ergaenzung zu `/qa:recette`. Liest einen Recette-Sitzungsbericht, verfeinert jeden Fehler fuer die Verarbeitung, generiert Projektmanagement-Dokumente (BMAD Bug Stories, Backlog, Sprint), und startet dann die TDD-basierte Behebung fuer jeden Bug. Implementiert die **Goldene Regel**: Ein behobener Fehler darf NIE wieder auftreten.

## Argumente

**$ARGUMENTS**

- `--session=<id>` : Recette-Sitzungs-ID (z.B. REC-20260130-143022) **[erforderlich]**
- `--dry-run` : Fehler verfeinern und BMAD-Dokumente generieren ohne zu beheben
- `--severity=<level>` : Nach Mindestschwere filtern (critical, high, medium, low)
- `--skip-fix` : Nur Dokumente generieren, keine TDD-Behebung
- `--auto-commit` : Automatischer Commit nach jeder Fehlerbehebung

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Fehlerverfeinerung** | Analysiert die Ursache, reproduziert ueber Chrome wenn verfuegbar |
| **Intelligente Gruppierung** | Dedupliziert Fehler nach gemeinsamer Ursache |
| **BMAD-Dokumente** | Generiert Bug Stories, aktualisiert Backlog und Sprint |
| **TDD-Behebung** | RED → GREEN → REFACTOR Workflow fuer jeden Bug |
| **Regressionstests** | Automatische Generierung und Registeraktualisierung |
| **Fortschrittsverfolgung** | fix-state.yaml fuer Fortsetzung und Monitoring |

## 7-Phasen-Prozess

```
Recette-Sitzung (.recette/sessions/{id}/)
        |
        v
  Phase 1: Sitzung und Fehler laden
        |
        v
  Phase 2: Fehlerbeschreibungen verfeinern
        |     - Ueber Chrome reproduzieren wenn noetig
        |     - Ursache identifizieren
        |     - Schwere klassifizieren
        |
        v
  Phase 3: Nach Ursache gruppieren
        |     - Deduplizierung
        |     - Priorisierung
        |
        v
  Phase 4: BMAD-Dokumente generieren
        |     - Bug Stories (US-XXX-bug-YYY)
        |     - Backlog aktualisieren
        |     - sprint-status.yaml aktualisieren
        |
        v
  Phase 5: TDD-Behebung pro Bug
        |     - RED: Test der den Bug reproduziert
        |     - GREEN: Minimale Behebung
        |     - REFACTOR: Verbesserung
        |
        v
  Phase 6: Verifizierung
        |     - Alle Tests bestehen
        |     - Regressionstests generiert
        |     - Regressionsregister aktualisiert
        |
        v
  Phase 7: Zusammenfassungsbericht
```

### Phase 1: Sitzung Laden

```
┌─────────────────────────────────────────┐
│  1. load_session(session_id)            │
│     - .recette/sessions/{id}/ lesen     │
│     - state.yaml laden                  │
│     - Fehler extrahieren (failed)       │
│     - Screenshots/Logs laden            │
└─────────────────────────────────────────┘
```

### Phase 2: Fehlerverfeinerung

Fuer jeden erkannten Fehler:

1. Screenshot/Log des Fehlers aus der Sitzung erneut lesen
2. Wenn Chrome MCP verfuegbar: Fehler reproduzieren zur Bestaetigung
3. Quellcode analysieren um Ursache zu identifizieren
4. Beschreibung neu formulieren mit: aktuelles Verhalten, erwartetes Verhalten, betroffene Dateien, vermutete Ursache

**Schweregradmatrix:**

| Fehlertyp | Benutzerauswirkung | Haeufigkeit | Schweregrad |
|-----------|-------------------|-------------|-------------|
| security | Beliebig | Beliebig | critical |
| logic | Blockierend | Beliebig | critical |
| logic | Nicht-blockierend | Haeufig | high |
| validation | Blockierend | Beliebig | high |
| validation | Nicht-blockierend | Selten | medium |
| interaction | Beliebig | Beliebig | high |
| visual | Schwere Verschlechterung | Beliebig | medium |
| visual | Kosmetisch | Beliebig | low |
| api | 5xx-Fehler | Beliebig | critical |
| api | Unerwarteter 4xx | Beliebig | high |

### Phase 3: Gruppierung nach Ursache

Mehrere Recette-Fehler koennen die gleiche Ursache haben:

- Formularvalidierungsfehler + Nachrichtenanzeigefehler = gleiche Validierungskomponente
- API-Fehler auf 3 Endpunkten = gleiche Authentifizierungs-Middleware

Die Gruppierung erstellt **eine einzige Bug Story** pro Ursache statt einer pro Fehler.

### Phase 4: BMAD-Dokumentgenerierung

Fuer jeden gruppierten Bug:

1. Bug Story aus dem Template `bug-story.md` generieren
2. Zu `.bmad/sprint-status.yaml` mit Status `ready-for-dev` hinzufuegen
3. Wenn ein Sprint aktiv ist: zum aktuellen Sprint hinzufuegen
4. Sonst: zum Backlog hinzufuegen

### Phase 5: TDD-Behebung

Fuer jede Bug Story (nach Schweregrad sortiert):

```
┌──────────────────────────────────────────────┐
│  BUG-001 (critical)                          │
│                                              │
│  1. RED   : Test schreiben der Bug           │
│             reproduziert → MUSS fehlschlagen │
│                                              │
│  2. GREEN : Minimale Code-Behebung           │
│             → Ausfuehren → MUSS bestehen     │
│             → Alle Tests → Nicht-Regression  │
│                                              │
│  3. REFACTOR : Verbessern wenn noetig        │
│             → Regressionstest generieren     │
│             → Register aktualisieren         │
│             → fix-state.yaml aktualisieren   │
│                                              │
│  4. COMMIT (wenn --auto-commit)              │
│     fix({modul}): {desc} [recette:{session}] │
└──────────────────────────────────────────────┘
```

**Generierte Testtypen nach Klassifizierung:**

| Fehlertyp | Unit-Test | Funktionstest | Behat-Feature |
|-----------|:---------:|:-------------:|:-------------:|
| logic | X | | |
| validation | X | X | |
| api | | X | |
| interaction | | | X |
| visual | | | X |
| security | X | X | |

### Phase 6: Verifizierung

1. Alle Projekttests ausfuehren
2. Pruefen ob generierte Regressionstests in `.recette/regression/tests/` sind
3. Pruefen ob `.recette/regression/registry.yaml` aktuell ist
4. Pruefen ob fix-state.yaml den korrekten Zustand widerspiegelt

### Phase 7: Zusammenfassungsbericht

Generiert einen Zusammenfassungsbericht mit:

- Gesamtzahl verarbeiteter Fehler
- Anzahl gruppierter Bugs (nach Deduplizierung)
- Erfolgreiche / fehlgeschlagene / uebersprungene Behebungen
- Generierte Regressionstests
- Durchgefuehrte Commits (wenn `--auto-commit`)

## Fortschrittszustand (fix-state.yaml)

```yaml
# .recette/sessions/{id}/fix-state.yaml
session_id: "REC-20260130-143022"
started_at: "2026-01-31T10:00:00"
status: "in-progress"  # pending | in-progress | completed | paused

errors:
  total: 8
  grouped: 5
  refined: 5
  fixed: 3
  skipped: 0
  remaining: 2

bugs:
  - id: "BUG-001"
    error_ids: ["ERR-001", "ERR-003"]
    severity: critical
    title: "Authentifizierung schlaegt nach Sitzungs-Timeout fehl"
    story_id: "US-042-bug-001"
    status: "fixed"  # pending | refining | documented | fixing | fixed | skipped
    tdd_phase: "refactor"
    fix_commit: "abc1234"
    regression_test: "tests/Functional/Auth/SessionTimeoutTest.php"

  - id: "BUG-002"
    error_ids: ["ERR-002"]
    severity: high
    title: "Kontaktformular zeigt Validierungsfehler nicht an"
    story_id: "US-042-bug-002"
    status: "fixing"
    tdd_phase: "green"
    fix_commit: null
    regression_test: null

current_bug: "BUG-002"
resume_from:
  bug_id: "BUG-002"
  phase: "green"
```

## Beispiele

```bash
# Alle Bugs einer Recette-Sitzung beheben
/qa:recette-fix --session=REC-20260130-143022

# Dry Run: verfeinern und dokumentieren ohne zu beheben
/qa:recette-fix --session=REC-20260130-143022 --dry-run

# Nur kritische und hohe Bugs beheben
/qa:recette-fix --session=REC-20260130-143022 --severity=high

# BMAD-Dokumente generieren ohne TDD zu starten
/qa:recette-fix --session=REC-20260130-143022 --skip-fix

# Beheben mit automatischem Commit
/qa:recette-fix --session=REC-20260130-143022 --auto-commit
```

## Ausgabestruktur

```
.recette/sessions/{session-id}/
├── state.yaml              # Recette-Sitzungszustand
├── fix-state.yaml          # Behebungs-Fortschrittszustand
├── screenshots/            # Fehler-Screenshots
└── logs/                   # Detaillierte Logs

.bmad/stories/
├── US-042-bug-001.md       # BMAD Bug Story
├── US-042-bug-002.md
└── ...

.recette/regression/
├── registry.yaml           # Aktualisiertes Register
└── tests/
    ├── Unit/
    ├── Functional/
    └── Behat/
```

## Verwandte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/qa:recette` | Akzeptanztests ausfuehren |
| `/qa:recette-status` | Sitzungsstatus anzeigen |
| `/qa:recette-regression` | Regressionstests anzeigen |
| `/qa:recette-report` | Bericht generieren |

## Fehlermeldungen

| Fehler | Loesung |
|--------|---------|
| "Sitzung nicht gefunden" | Ueberpruefen Sie die Sitzungs-ID in `.recette/sessions/` |
| "Keine Fehler in der Sitzung" | Die Sitzung hat keine Fehler zu beheben |
| "sprint-status.yaml nicht gefunden" | BMAD mit `/workflow:init` initialisieren |
| "RED-Test schlaegt nicht fehl" | Bug existiert moeglicherweise nicht mehr, manuell pruefen |

## Best Practices

1. **Mit Dry-Run beginnen** : Verfeinerte Fehler und Dokumente vor der Behebung pruefen
2. **Nach Schweregrad priorisieren** : Mit kritischen Bugs beginnen
3. **Gruppierungen validieren** : Pruefen ob gruppierte Fehler wirklich die gleiche Ursache haben
4. **Stories ueberpruefen** : Generierte Bug Stories vor TDD-Start pruefen
5. **Auto-Commit verwenden** : Fuer eine saubere Behebungshistorie

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /qa:recette                                           ║
║    Nach Korrekturen erneut testen                        ║
║                                                          ║
║  Siehe auch:                                             ║
║  • /qa:regression — Regressionstests prüfen              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
