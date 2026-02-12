---
description: User Stories auflisten
argument-hint: [arguments]
---

# User Stories auflisten

Liste der User Stories mit Filterung nach EPIC, Sprint oder Status anzeigen.

## Argumente

$ARGUMENTS (optional, Format: [Filter] [Wert])
- **epic EPIC-XXX**: Nach EPIC filtern
- **sprint N**: Nach Sprint filtern
- **status STATUS**: Nach Status filtern (todo, in-progress, blocked, done)
- **backlog**: Nur nicht zugewiesene USs anzeigen

## Prozess

### Schritt 1: User Stories lesen

1. Verzeichnis `project-management/backlog/user-stories/` scannen
2. Jede Datei US-XXX-*.md lesen
3. Metadaten aus jeder US extrahieren

### Schritt 2: Filtern

Filter gemäß $ARGUMENTS anwenden:
- Nach übergeordnetem EPIC
- Nach zugewiesenem Sprint
- Nach Status
- Nicht zugewiesen (Backlog)

### Schritt 3: Statistiken berechnen

Für jede US:
- Gesamt-Aufgaben zählen
- Aufgaben nach Status zählen
- Fortschritt in Prozent berechnen

### Schritt 4: Anzeigen

Formatierte Tabelle generieren, gruppiert nach EPIC oder Sprint je nach Kontext.

## Ausgabeformat - Nach EPIC

```
📖 User Stories - EPIC-001: Authentifizierung

| ID | Name | Sprint | Status | Punkte | Aufgaben | Fortschritt |
|----|-----|--------|--------|--------|-------|-------------|
| US-001 | Benutzer-Login | Sprint 1 | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registrierung | Sprint 1 | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Passwort vergessen | Backlog | 🔴 To Do | 3 | - | - |

───────────────────────────────────────────────────
Gesamt: 3 US | 11 Punkte | 🔴 2 | 🟡 1 | 🟢 0
```

## Ausgabeformat - Nach Sprint

```
📖 User Stories - Sprint 1

| ID | EPIC | Name | Status | Punkte | Aufgaben | Fortschritt |
|----|------|-----|--------|--------|-------|-------------|
| US-001 | EPIC-001 | Benutzer-Login | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | EPIC-001 | Registrierung | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-005 | EPIC-002 | Produktliste | 🟢 Done | 5 | 6/6 | ██████████ 100% |

───────────────────────────────────────────────────
Sprint 1: 3 US | 13 Punkte | Erledigt: 5 Pts (38%)
```

## Ausgabeformat - Backlog

```
📖 Backlog (Nicht zugewiesene USs)

| ID | EPIC | Name | Priorität | Punkte | Status |
|----|------|-----|----------|--------|--------|
| US-003 | EPIC-001 | Passwort vergessen | High | 3 | 🔴 To Do |
| US-006 | EPIC-002 | Produktdetail | Medium | 5 | 🔴 To Do |
| US-007 | EPIC-002 | Suche | Low | 8 | 🔴 To Do |

───────────────────────────────────────────────────
Backlog: 3 US | 16 Punkte zu planen
```

## Beispiele

```
# Alle USs auflisten
/project:list-stories

# USs eines EPICs auflisten
/project:list-stories epic EPIC-001

# USs des aktuellen Sprints auflisten
/project:list-stories sprint 1

# USs in Bearbeitung auflisten
/project:list-stories status in-progress

# Blockierte USs auflisten
/project:list-stories status blocked

# Backlog (nicht zugewiesen) auflisten
/project:list-stories backlog
```

## Vorgeschlagene Aktionen

Je nach Kontext vorschlagen:
```
Aktionen:
  /sprint:transition US-XXX sprint-2     # Sprint zuweisen
  /sprint:transition US-XXX in-progress  # Status ändern
  /project:add-task US-XXX "[BE] ..." 4h  # Aufgabe hinzufügen
```
