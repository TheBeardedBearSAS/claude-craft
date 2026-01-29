---
description: Vorhandene Backlog-Struktur fuer BMAD-Migration analysieren
argument-hint: [--format json|yaml|md]
---

# Backlog analysieren

Die aktuelle Backlog-Struktur analysieren, um die Migration zu BMAD v6 vorzubereiten.

## Argumente

$ARGUMENTS (format: [--format ausgabe_format])
- **--format** (optional): Ausgabeformat (json, yaml, md). Standard: md

## Prozess

### Schritt 1: Backlog-Speicherort ermitteln

Nach Backlog-Dateien an gaengigen Speicherorten suchen:
1. `project-management/backlog/` (claude-craft Standard)
2. `docs/backlog/` (alternativ)
3. `backlog/` (einfach)
4. `.bmad/` (falls bereits migriert)

### Schritt 2: Struktur analysieren

Fuer jeden gefundenen Speicherort identifizieren:
- **Epics**: Dateien entsprechend `EPIC-*.md`
- **User Stories**: Dateien entsprechend `US-*.md`
- **Aufgaben**: Dateien entsprechend `TASK-*.md`
- **Index-Dateien**: `index.md`, `backlog.md`

### Schritt 3: Metadaten parsen

Fuer jede Datei extrahieren:
- ID (EPIC-XXX, US-XXX, TASK-XXX)
- Titel/Name
- Status (🔴 Offen, 🟡 In Bearbeitung, 🟢 Erledigt, ⏸️ Blockiert)
- Sprint-Zuweisung
- Story Points (fuer US)
- Eltern-Beziehungen (US → EPIC, TASK → US)

### Schritt 4: INVEST-Konformitaet validieren

Fuer jede User Story pruefen:
- [ ] **I**ndependent (Unabhaengig): Keine blockierenden Abhaengigkeiten
- [ ] **N**egotiable (Verhandelbar): Hat eine Beschreibung (nicht nur einen Titel)
- [ ] **V**aluable (Wertvoll): Hat einen Nutzen-/Wertnachweis
- [ ] **E**stimable (Schaetzbar): Hat Story Points
- [ ] **S**mall (Klein genug): ≤ 8 Punkte
- [ ] **T**estable (Testbar): Hat Akzeptanzkriterien

Punktzahl: 0-6 erfuellte Kriterien.

### Schritt 5: Migrationsluecken identifizieren

BMAD v6-Kompatibilitaet pruefen:
- [ ] TDD-Phasen-Tracking (red/green/refactor)
- [ ] Aufgabenliste mit Abschlussverfolgung
- [ ] Status-Historie
- [ ] Sprint-Zuweisung
- [ ] Validierungsstatus der Akzeptanzkriterien

### Schritt 6: Kompatibilitaetsbericht generieren

Bericht erstellen mit:
1. **Zusammenfassung**: Gesamtzahl gefundener Epics, Stories, Aufgaben
2. **Struktur**: Aktuelle Dateiorganisation
3. **INVEST-Bewertungen**: Konformitaet pro Story
4. **Luecken**: Fehlende BMAD v6-Felder
5. **Empfehlungen**: Vorgeschlagene Massnahmen

## Ausgabeformat

```
📊 Backlog-Analysebericht
=========================

## Zusammenfassung
- Speicherort: project-management/backlog/
- Format: Markdown (claude-craft Standard)
- Epics: {ANZAHL}
- User Stories: {ANZAHL}
- Aufgaben: {ANZAHL}

## INVEST-Konformitaet

| Story ID | Titel | Punktzahl | Fehlend |
|----------|-------|-----------|---------|
| US-001 | Anmeldung | 5/6 | Schaetzbar |
| US-002 | Registrierung | 6/6 | - |

Durchschnittliche INVEST-Punktzahl: {DURCHSCHNITT}/6

## Empfehlungen

1. ⚠️ {ANZAHL} Stories ohne Story Points
2. ✅ Struktur kompatibel mit BMAD v6
3. 📝 `/project:migrate-backlog` ausfuehren zur Migration
```

## Beispiel

```
/project:analyze-backlog
/project:analyze-backlog --format yaml
```

## Naechste Schritte

Nach der Analyse:
- `/project:migrate-backlog` - Ins BMAD v6-Format konvertieren
- `/project:update-stories` - Fehlende Felder hinzufuegen
- `/project:sync-backlog` - Mit sprint-status.yaml synchronisieren
