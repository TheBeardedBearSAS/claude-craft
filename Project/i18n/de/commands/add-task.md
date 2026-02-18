---
description: Eine Aufgabe hinzufügen
argument-hint: [arguments]
---

# Eine Aufgabe hinzufügen

Eine neue technische Aufgabe erstellen und einer User Story zuordnen.

## Argumente

$ARGUMENTS (Format: US-XXX "[TYP] Beschreibung" Schätzung)
- **US-ID** (erforderlich): Übergeordnete User Story-ID (z.B. US-001)
- **Beschreibung** (erforderlich): Beschreibung mit Typ in Klammern
- **Schätzung** (erforderlich): Schätzung in Stunden (z.B. 4h, 2h, 0.5h)

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Aufgabentypen

| Typ | Präfix | Beschreibung |
|------|---------|-------------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

## Prozess

### Schritt 1: Argumente analysieren

Aus $ARGUMENTS extrahieren:
- User Story-ID
- Typ (in Klammern)
- Beschreibung
- Schätzung in Stunden

### Schritt 2: User Story validieren

1. Prüfen, dass US in `project-management/backlog/user-stories/` existiert
2. Zugewiesenen Sprint abrufen (falls zutreffend)
3. Falls US nicht gefunden, Fehler anzeigen

### Schritt 3: Schätzung validieren

- Minimum: 0.5h
- Maximum: 8h
- Ideal: 2-4h
- Falls > 8h, Aufteilung der Aufgabe vorschlagen

### Schritt 4: ID generieren

1. Letzte verwendete Aufgaben-ID finden
2. Inkrementieren, um neue ID zu erhalten

### Schritt 5: Datei erstellen

1. Template `Scrum/templates/task.md` verwenden
2. Platzhalter ersetzen:
   - `{ID}`: Generierte ID
   - `{DESCRIPTION}`: Kurzbeschreibung
   - `{US_ID}`: User Story-ID
   - `{TYPE}`: Aufgabentyp
   - `{ESTIMATION}`: Schätzung in Stunden
   - `{DATE}`: Aktuelles Datum (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Detaillierte Beschreibung

3. Pfad bestimmen:
   - Falls US im Sprint: `project-management/sprints/sprint-XXX/tasks/TASK-{ID}.md`
   - Sonst: `project-management/backlog/tasks/TASK-{ID}.md`

### Schritt 6: User Story aktualisieren

1. US-Datei lesen
2. Aufgabe zur Aufgabentabelle hinzufügen
3. Fortschritt aktualisieren
4. Speichern

### Schritt 7: Board aktualisieren (falls Sprint)

Falls US in einem Sprint ist:
1. `project-management/sprints/sprint-XXX/board.md` lesen
2. Aufgabe zu "🔴 To Do" hinzufügen
3. Metriken aktualisieren
4. Speichern

## Ausgabeformat

```
✅ Aufgabe erfolgreich erstellt!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Typ: {TYPE}
   Status: 🔴 To Do
   Schätzung: {ESTIMATION}h
   Datei: {PATH}

Nächste Schritte:
  /project:move-task TASK-{ID} in-progress  # Aufgabe starten
  /project:board                             # Kanban anzeigen
```

## Beispiele

```
# Backend-Aufgabe
/project:add-task US-001 "[BE] Login API endpoint" 4h

# Datenbank-Aufgabe
/project:add-task US-001 "[DB] User entity with email/password fields" 2h

# Mobile Frontend-Aufgabe
/project:add-task US-001 "[FE-MOB] Login screen with validation" 6h

# Test-Aufgabe
/project:add-task US-001 "[TEST] AuthService unit tests" 3h
```

## Validierung

- [ ] Typ ist gültig (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- [ ] Schätzung liegt zwischen 0.5h und 8h
- [ ] User Story existiert
- [ ] ID ist eindeutig
