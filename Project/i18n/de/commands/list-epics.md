---
description: EPICs auflisten
argument-hint: [arguments]
---

# EPICs auflisten

Liste aller EPICs mit ihrem Status und Fortschritt anzeigen.

## Argumente

$ARGUMENTS (optional, Format: [Status] [Priorität])
- **Status** (optional): todo, in-progress, blocked, done, all (Standard: all)
- **Priorität** (optional): high, medium, low

## Prozess

### Schritt 1: EPICs lesen

1. Verzeichnis `project-management/backlog/epics/` scannen
2. Jede Datei EPIC-XXX-*.md lesen
3. Metadaten aus jedem EPIC extrahieren

### Schritt 2: Filtern (falls Argumente)

Gewünschte Filter anwenden:
- Nach Status
- Nach Priorität

### Schritt 3: Statistiken berechnen

Für jedes EPIC:
- Gesamt-USs zählen
- USs nach Status zählen
- Fortschritt in Prozent berechnen

### Schritt 4: Anzeigen

Formatierte Tabelle mit Ergebnissen generieren.

## Ausgabeformat

```
📋 Projekt-EPICs

| ID | Name | Status | Priorität | US | Fortschritt |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Authentifizierung | 🟡 In Progress | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Katalog | 🔴 To Do | Medium | 8 | ░░░░░░░░░░ 0% |
| EPIC-003 | Warenkorb | 🔴 To Do | High | 6 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Zusammenfassung: 3 EPICs | 🔴 2 To Do | 🟡 1 In Progress | 🟢 0 Done
```

## Kompaktformat (falls viele EPICs)

```
📋 EPICs (12 gesamt)

🔴 To Do (5):
   EPIC-002, EPIC-003, EPIC-004, EPIC-007, EPIC-010

🟡 In Progress (4):
   EPIC-001 (40%), EPIC-005 (60%), EPIC-008 (25%), EPIC-011 (80%)

⏸️ Blocked (1):
   EPIC-006 - Blockiert durch externe Abhängigkeit

🟢 Done (2):
   EPIC-009 ✓, EPIC-012 ✓
```

## Beispiele

```
# Alle EPICs auflisten
/project:list-epics

# EPICs in Bearbeitung auflisten
/project:list-epics in-progress

# EPICs mit hoher Priorität auflisten
/project:list-epics all high

# Blockierte EPICs auflisten
/project:list-epics blocked
```

## EPIC-Details

Um Details eines bestimmten EPICs anzuzeigen, vorschlagen:
```
Details anzeigen: cat project-management/backlog/epics/EPIC-001-*.md
```
