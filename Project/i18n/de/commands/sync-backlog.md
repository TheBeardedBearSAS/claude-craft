---
description: Backlog-Dateien mit sprint-status.yaml synchronisieren
argument-hint: [--direction quelle] [--dry-run]
---

# Backlog synchronisieren

Bidirektionale Synchronisation zwischen Backlog-Markdown-Dateien und sprint-status.yaml.

## Argumente

$ARGUMENTS (format: [--direction quelle] [--dry-run])
- **--direction** (optional): Synchronisationsrichtung
  - `files-to-yaml`: sprint-status.yaml aus Markdown-Dateien aktualisieren
  - `yaml-to-files`: Markdown-Dateien aus sprint-status.yaml aktualisieren
  - `bidirectional`: Beide zusammenfuehren (Standard, neuester gewinnt)
- **--dry-run** (optional): Aenderungen vorschauen ohne anzuwenden

## Prozess

### Schritt 1: Beide Quellen laden

1. `.bmad/sprint-status.yaml` parsen
2. Alle Story-Dateien im Backlog-Verzeichnis parsen
3. Vergleichs-Map nach Story-ID erstellen

### Schritt 2: Konflikte erkennen

Fuer jede Story vergleichen:
- Status
- Abgeschlossene Aufgaben-Anzahl
- Akzeptanzkriterien-Validierung
- TDD-Phase
- Zuweisung

Konflikterkennung:
```yaml
conflicts:
  US-001:
    field: status
    yaml_value: "in-progress"
    file_value: "🟢 Erledigt"
    yaml_timestamp: "2026-01-29T09:00:00Z"
    file_timestamp: "2026-01-29T10:00:00Z"
    resolution: "file"  # neuester gewinnt
```

### Schritt 3: Konflikte loesen

Loesungsstrategien:
1. **newest-wins** (Standard): Zuletzt geaenderten Wert verwenden
2. **yaml-wins**: Immer sprint-status.yaml bevorzugen
3. **files-win**: Immer Markdown-Dateien bevorzugen
4. **prompt**: Benutzer bei jedem Konflikt fragen

### Schritt 4: Dateien → YAML synchronisieren

sprint-status.yaml aktualisieren mit:
- Neue Stories aus Dateien gefunden
- Statusaenderungen aus Dateien
- Aufgaben-Updates aus Dateien
- AC-Validierung aus Dateien

### Schritt 5: YAML → Dateien synchronisieren

Markdown-Dateien aktualisieren mit:
- TDD-Phase (zum Metadaten-Kommentar hinzufuegen)
- Historie (zum Metadaten-Kommentar hinzufuegen)
- INVEST-Punktzahl (zum Metadaten-Kommentar hinzufuegen)
- Synchronisations-Zeitstempel

### Schritt 6: Verwaiste behandeln

- **Stories in YAML aber nicht in Dateien**: Als `archived` markieren oder warnen
- **Stories in Dateien aber nicht in YAML**: Zu sprint-status.yaml hinzufuegen

### Schritt 7: Zeitstempel aktualisieren

Letzten Sync-Zeitstempel zu beiden hinzufuegen:
- `.bmad/sprint-status.yaml`: `last_sync: "2026-01-29T10:00:00Z"`
- Story-Dateien: `<!-- last_sync: 2026-01-29T10:00:00Z -->`

## Ausgabeformat

```
🔄 Backlog-Synchronisation
==========================

## Richtung: Bidirektional

## Erkannte Aenderungen

### Dateien → YAML (4 Aenderungen)
| Story | Feld | Alt | Neu |
|-------|------|-----|-----|
| US-001 | status | in-progress | done |
| US-002 | tasks.completed | 2 | 3 |

### YAML → Dateien (2 Aenderungen)
| Story | Feld | Alt | Neu |
|-------|------|-----|-----|
| US-003 | tdd_phase | - | green |
| US-004 | invest_score | - | 5/6 |

## Geloeste Konflikte

| Story | Feld | Loesung | Wert |
|-------|------|---------|------|
| US-005 | status | newest-wins | done |

## Verwaiste

### Nur in YAML (archiviert):
- US-010: "Altes Feature" (archiviert am 2026-01-15)

### Nur in Dateien (zu YAML hinzugefuegt):
- US-015: "Neues Feature"

## Synchronisation abgeschlossen

✅ sprint-status.yaml aktualisiert
✅ 12 Story-Dateien aktualisiert
⏰ Letzte Sync: 2026-01-29T10:00:00Z

## Naechste Schritte
- Aenderungen in git diff ueberpruefen
- `/sprint:status` zur Verifizierung ausfuehren
```

## Dry Run-Ausgabe

```
🔄 Backlog-Synchronisation (DRY RUN)
====================================

⚠️ Es werden keine Aenderungen vorgenommen

## Wuerde aendern:

### sprint-status.yaml
- US-001.status: "in-progress" → "done"
- US-002.tasks.completed: 2 → 3

### Story-Dateien
- US-003: tdd_phase-Metadaten hinzufuegen
- US-004: invest_score-Metadaten hinzufuegen

Ohne --dry-run ausfuehren, um Aenderungen anzuwenden.
```

## Beispiel

```
/project:sync-backlog
/project:sync-backlog --direction files-to-yaml
/project:sync-backlog --direction yaml-to-files --dry-run
```

## Automatisierung

Zum pre-commit-Hook fuer automatische Synchronisation hinzufuegen:
```bash
# .bmad/hooks/pre-commit.sh
/project:sync-backlog --direction files-to-yaml
```
