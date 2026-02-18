---
description: Stories ins BMAD v6-Format mit fehlenden Feldern aktualisieren
argument-hint: [--dry-run] [story-id]
---

# Stories aktualisieren

Fehlende BMAD v6-Felder zu vorhandenen User Stories hinzufuegen.

## Argumente

$ARGUMENTS (format: [--dry-run] [story-id])
- **--dry-run** (optional): Aenderungen vorschauen ohne anzuwenden
- **story-id** (optional): Spezifische Story zur Aktualisierung (z.B. US-001). Falls ausgelassen, werden alle aktualisiert.

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Prozess

### Schritt 1: Aktuellen Zustand laden

1. `.bmad/sprint-status.yaml` lesen
2. Story-Dateien aus dem Backlog laden
3. Felder zwischen Datei und sprint-status vergleichen

### Schritt 2: Fehlende Felder identifizieren

Fuer jede Story pruefen:

| Feld | Erforderlich | Standard falls fehlend |
|------|--------------|------------------------|
| tdd_phase | Ja | "red" falls in-progress, "" sonst |
| tasks.list | Ja | Aus ## Tasks-Abschnitt extrahieren |
| tasks.total | Ja | Aus Liste zaehlen |
| tasks.completed | Ja | Abgeschlossene Aufgaben zaehlen |
| current_task | Nein | Erste laufende Aufgabe |
| history | Ja | Mit aktuellem Status initialisieren |
| acceptance_criteria.total | Ja | Aus AC-Abschnitt zaehlen |
| acceptance_criteria.validated | Ja | 0 (Standard) |
| story_points | Ja | Nachfragen falls fehlend |
| epic_id | Nein | Aus Datei extrahieren |

### Schritt 3: Aufgabenliste aus Markdown parsen

Aufgaben aus Story-Dateiformat extrahieren:
```markdown
## Tasks

| ID | Beschreibung | Status |
|----|--------------|--------|
| TASK-001 | Backend-Endpoint | 🟢 Erledigt |
| TASK-002 | Frontend-Formular | 🟡 In Bearbeitung |
```

Ins BMAD-Format konvertieren:
```yaml
tasks:
  list:
    - id: "TASK-001"
      title: "Backend-Endpoint"
      status: "done"
    - id: "TASK-002"
      title: "Frontend-Formular"
      status: "in-progress"
```

### Schritt 4: Akzeptanzkriterien parsen

Aus Gherkin-Format extrahieren:
```markdown
## Akzeptanzkriterien

### AC1: Gueltige Anmeldung
Gegeben ein registrierter Benutzer
Wenn er gueltige Zugangsdaten eingibt
Dann ist er angemeldet
Status: ✅ Validiert

### AC2: Ungueltige Anmeldung
Gegeben ein Benutzer
Wenn er ungueltige Zugangsdaten eingibt
Dann sieht er eine Fehlermeldung
Status: ⏳ Ausstehend
```

Ins BMAD-Format konvertieren:
```yaml
acceptance_criteria:
  total: 2
  validated: 1
  list:
    - id: "AC1"
      title: "Gueltige Anmeldung"
      status: "validated"
    - id: "AC2"
      title: "Ungueltige Anmeldung"
      status: "pending"
```

### Schritt 5: Historie initialisieren

Falls keine Historie, initialen Eintrag erstellen:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: ""
    to: "{aktueller_status}"
    by: "update-stories"
    reason: "Historie initialisiert"
```

### Schritt 6: INVEST-Konformitaet validieren

INVEST-Pruefungen ausfuehren und Punktzahl hinzufuegen:
```yaml
invest_score:
  independent: true
  negotiable: true
  valuable: true
  estimable: true   # false falls keine story_points
  small: true       # false falls > 8 Punkte
  testable: true    # false falls keine AC
  total: 6
```

### Schritt 7: sprint-status.yaml aktualisieren

Aktualisierte Felder in sprint-status.yaml zusammenfuehren.

### Schritt 8: Story-Dateien aktualisieren (optional)

BMAD-Metadaten-Kommentar zu Story-Dateien hinzufuegen:
```markdown
<!-- BMAD v6 Metadata
tdd_phase: green
invest_score: 6/6
last_sync: 2026-01-29T10:00:00Z
-->
```

## Ausgabeformat

```
📝 Stories auf BMAD v6 aktualisieren
====================================

## Aktualisierte Stories: {ANZAHL}

| Story | Hinzugefuegte Felder | INVEST-Punktzahl |
|-------|----------------------|------------------|
| US-001 | tdd_phase, history | 6/6 ✅ |
| US-002 | tasks.list, history | 5/6 ⚠️ |
| US-003 | story_points erforderlich | 4/6 ❌ |

## Felder-Zusammenfassung

| Feld | Hinzugefuegt zu | Uebersprungen |
|------|-----------------|---------------|
| tdd_phase | 10 | 2 (bereits definiert) |
| tasks.list | 8 | 4 (bereits definiert) |
| history | 12 | 0 |
| invest_score | 12 | 0 |

## Warnungen

⚠️ US-003: Story Points fehlen - bitte schaetzen
⚠️ US-007: Keine Akzeptanzkriterien - vor Entwicklung hinzufuegen

## Geaenderte Dateien
- .bmad/sprint-status.yaml
- project-management/backlog/user-stories/US-001-*.md (Metadaten-Kommentar)

## Naechste Schritte
1. Warnungen beheben: Fehlende story_points und AC hinzufuegen
2. `/project:sync-backlog` zur Konsistenzpruefung ausfuehren
3. `/gate:validate-backlog` fuer vollstaendige Validierung ausfuehren
```

## Beispiel

```
/project:update-stories --dry-run
/project:update-stories
/project:update-stories US-001
```

## Validierung

Nach der Aktualisierung sollten alle Stories bestehen:
```
/gate:validate-backlog
```
