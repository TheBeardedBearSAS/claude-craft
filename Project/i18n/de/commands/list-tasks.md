---
description: Aufgaben auflisten
argument-hint: [arguments]
---

# Aufgaben auflisten

Liste der Aufgaben mit Filterung nach User Story, Sprint, Typ oder Status anzeigen.

## Argumente

$ARGUMENTS (optional, Format: [Filter] [Wert])
- **us US-XXX**: Nach User Story filtern
- **sprint N**: Nach Sprint filtern
- **type TYP**: Nach Typ filtern (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- **status STATUS**: Nach Status filtern (todo, in-progress, blocked, done)

## Prozess

### Schritt 1: Aufgaben lesen

1. Aufgabenverzeichnisse scannen:
   - `project-management/sprints/sprint-XXX/tasks/`
   - `project-management/backlog/tasks/` (falls vorhanden)
2. Jede Datei TASK-XXX.md lesen
3. Metadaten extrahieren

### Schritt 2: Filtern

Filter gemäß $ARGUMENTS anwenden.

### Schritt 3: Berechnen

- Gesamt geschätzte Stunden
- Abgeschlossene Stunden
- Aufschlüsselung nach Typ
- Aufschlüsselung nach Status

### Schritt 4: Anzeigen

Formatierte Tabelle generieren.

## Ausgabeformat - Nach User Story

```
🔧 Aufgaben - US-001: Benutzer-Login

| ID | Typ | Beschreibung | Status | Schätz. | Aufgew. |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | User Entity | 🟢 Done | 2h | 2h |
| TASK-002 | [BE] | User Repository | 🟢 Done | 3h | 3.5h |
| TASK-003 | [BE] | Login API Endpoint | 🟡 In Progress | 4h | 2h |
| TASK-004 | [FE-WEB] | Auth Controller | 🔴 To Do | 3h | - |
| TASK-005 | [FE-MOB] | Login Screen | ⏸️ Blocked | 6h | - |
| TASK-006 | [TEST] | AuthService Tests | 🔴 To Do | 3h | - |

───────────────────────────────────────────────────
US-001: 6 Aufgaben | 21h geschätzt | 7.5h abgeschlossen (36%)
🔴 2 | 🟡 1 | ⏸️ 1 | 🟢 2
```

## Ausgabeformat - Nach Sprint

```
🔧 Aufgaben - Sprint 1

Nach Status:
🔴 To Do (8 Aufgaben, 24h)
🟡 In Progress (3 Aufgaben, 10h)
⏸️ Blocked (2 Aufgaben, 8h)
🟢 Done (12 Aufgaben, 35h)

Nach Typ:
[DB]     ████████░░ 5 Aufgaben
[BE]     ██████████ 8 Aufgaben
[FE-WEB] ██████░░░░ 4 Aufgaben
[FE-MOB] ████░░░░░░ 3 Aufgaben
[TEST]   ██████░░░░ 4 Aufgaben
[DOC]    ██░░░░░░░░ 1 Aufgabe

───────────────────────────────────────────────────
Sprint 1: 25 Aufgaben | 77h geschätzt | 35h abgeschlossen (45%)
```

## Ausgabeformat - Blockiert

```
⏸️ Blockierte Aufgaben

| ID | US | Typ | Beschreibung | Blocker |
|----|-----|------|-------------|----------|
| TASK-005 | US-001 | [FE-MOB] | Login Screen | Warte auf Auth API |
| TASK-012 | US-003 | [BE] | Email Service | Fehlende SMTP-Konfiguration |

───────────────────────────────────────────────────
2 blockierte Aufgaben | 14h wartend

Aktionen:
  TASK-005 lösen: Zuerst TASK-003 abschließen
  TASK-012 lösen: SMTP in .env konfigurieren
```

## Beispiele

```
# Alle Aufgaben auflisten
/project:list-tasks

# Aufgaben einer US auflisten
/project:list-tasks us US-001

# Aufgaben von Sprint 1 auflisten
/project:list-tasks sprint 1

# Backend-Aufgaben auflisten
/project:list-tasks type BE

# Aufgaben in Bearbeitung auflisten
/project:list-tasks status in-progress

# Blockierte Aufgaben auflisten
/project:list-tasks status blocked
```

## Status-Farbcodes

| Icon | Status | Bedeutung |
|-------|--------|---------------|
| 🔴 | To Do | Nicht gestartet |
| 🟡 | In Progress | In Bearbeitung |
| ⏸️ | Blocked | Blockiert |
| 🟢 | Done | Abgeschlossen |
