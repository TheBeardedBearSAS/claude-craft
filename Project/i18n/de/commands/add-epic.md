---
description: Ein EPIC hinzufügen
argument-hint: [arguments]
---

# Ein EPIC hinzufügen

Ein neues EPIC im Backlog erstellen.

## Argumente

$ARGUMENTS (Format: "EPIC-Name" [Priorität])
- **Name** (erforderlich): EPIC-Titel
- **Priorität** (optional): High, Medium, Low (Standard: Medium)

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Prozess

### Schritt 1: Argumente analysieren

Extrahieren:
- EPIC-Name aus $ARGUMENTS
- Priorität (falls angegeben, sonst Medium)

### Schritt 2: ID generieren

1. Dateien in `project-management/backlog/epics/` lesen
2. Letzte verwendete ID finden (Format EPIC-XXX)
3. Inkrementieren, um neue ID zu erhalten

### Schritt 3: Informationen sammeln

Benutzer fragen (falls nicht angegeben):
- EPIC-Beschreibung
- MMF (Minimum Marketable Feature)
- Geschäftsziele (2-3 Punkte)
- Erfolgskriterien

### Schritt 4: Datei erstellen

1. Template `Scrum/templates/epic.md` verwenden
2. Platzhalter ersetzen:
   - `{ID}`: Generierte ID
   - `{NOM}`: EPIC-Name
   - `{PRIORITE}`: Gewählte Priorität
   - `{MINIMUM_MARKETABLE_FEATURE}`: MMF
   - `{DESCRIPTION}`: Beschreibung
   - `{DATE}`: Aktuelles Datum (YYYY-MM-DD)
   - `{OBJECTIF_1}`, `{OBJECTIF_2}`: Geschäftsziele
   - `{CRITERE_1}`, `{CRITERE_2}`: Erfolgskriterien

3. Datei erstellen: `project-management/backlog/epics/EPIC-{ID}-{slug}.md`

### Schritt 5: Index aktualisieren

1. `project-management/backlog/index.md` lesen
2. EPIC zur EPICs-Tabelle hinzufügen
3. Zusammenfassungszähler aktualisieren
4. Speichern

## Ausgabeformat

```
✅ EPIC erfolgreich erstellt!

📋 EPIC-{ID}: {NAME}
   Status: 🔴 To Do
   Priorität: {PRIORITY}
   Datei: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Nächste Schritte:
  /project:add-story EPIC-{ID} "User Story Name"
```

## Beispiel

```
/project:add-epic "Authentication System" High
```

Erstellt:
- `project-management/backlog/epics/EPIC-001-authentication-system.md`

## Validierung

- [ ] Name ist nicht leer
- [ ] Priorität ist gültig (High/Medium/Low)
- [ ] Verzeichnis `project-management/backlog/epics/` existiert
- [ ] ID ist eindeutig
