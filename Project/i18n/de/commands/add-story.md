---
description: Eine User Story hinzufügen
argument-hint: [arguments]
---

# Eine User Story hinzufügen

Eine neue User Story erstellen und einem EPIC zuordnen.

## Argumente

$ARGUMENTS (Format: EPIC-XXX "US-Name" [Punkte])
- **EPIC-ID** (erforderlich): Übergeordnete EPIC-ID (z.B. EPIC-001)
- **Name** (erforderlich): User Story-Titel
- **Punkte** (optional): Story Points in Fibonacci (1, 2, 3, 5, 8)

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Prozess

### Schritt 1: Argumente analysieren

Aus $ARGUMENTS extrahieren:
- EPIC-ID
- User Story-Name
- Story Points (falls angegeben)

### Schritt 2: EPIC validieren

1. Prüfen, dass EPIC in `project-management/backlog/epics/` existiert
2. Falls nicht gefunden, Fehler mit verfügbaren EPICs anzeigen

### Schritt 3: ID generieren

1. Dateien in `project-management/backlog/user-stories/` lesen
2. Letzte verwendete ID finden (Format US-XXX)
3. Inkrementieren, um neue ID zu erhalten

### Schritt 4: Informationen sammeln

Benutzer fragen:
- **Persona**: Wer ist der Benutzer? (P-XXX oder Beschreibung)
- **Aktion**: Was möchte er tun?
- **Nutzen**: Warum möchte er es?
- **Abnahmekriterien**: Mindestens 2 im Gherkin-Format
- **Punkte**: Falls nicht angegeben, schätzen (Fibonacci: 1, 2, 3, 5, 8)

### Schritt 5: Datei erstellen

1. Template `Scrum/templates/user-story.md` verwenden
2. Platzhalter ersetzen:
   - `{ID}`: Generierte ID
   - `{NOM}`: US-Name
   - `{EPIC_ID}`: Übergeordnete EPIC-ID
   - `{SPRINT}`: "Backlog" (nicht zugewiesen)
   - `{POINTS}`: Story Points
   - `{PERSONA}`: Identifizierte Persona
   - `{PERSONA_ID}`: Persona-ID
   - `{ACTION}`: Gewünschte Aktion
   - `{BENEFICE}`: Erwarteter Nutzen
   - `{DATE}`: Aktuelles Datum (YYYY-MM-DD)

3. Abnahmekriterien im Gherkin-Format hinzufügen

4. Datei erstellen: `project-management/backlog/user-stories/US-{ID}-{slug}.md`

### Schritt 6: EPIC aktualisieren

1. EPIC-Datei lesen
2. US zur User Stories-Tabelle hinzufügen
3. Fortschritt aktualisieren
4. Speichern

### Schritt 7: Index aktualisieren

1. `project-management/backlog/index.md` lesen
2. US zum Abschnitt "Priorisiertes Backlog" hinzufügen
3. Zähler aktualisieren
4. Speichern

## Ausgabeformat

```
✅ User Story erfolgreich erstellt!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Status: 🔴 To Do
   Punkte: {POINTS}
   Datei: project-management/backlog/user-stories/US-{ID}-{slug}.md

Nächste Schritte:
  /sprint:transition US-{ID} sprint-X    # Sprint zuweisen
  /project:add-task US-{ID} "[BE] ..." 4h # Aufgaben hinzufügen
```

## Beispiel

```
/project:add-story EPIC-001 "User login" 5
```

Erstellt:
- `project-management/backlog/user-stories/US-001-user-login.md`

## INVEST-Validierung

Prüfen, dass US INVEST folgt:
- **I**ndependent: Kann alleine entwickelt werden
- **N**egotiable: Details können diskutiert werden
- **V**aluable: Bringt Wert für Persona
- **E**stimable: Kann geschätzt werden (Punkte angegeben)
- **S**mall: ≤ 8 Punkte (sonst Aufteilung vorschlagen)
- **T**estable: Hat klare Abnahmekriterien
