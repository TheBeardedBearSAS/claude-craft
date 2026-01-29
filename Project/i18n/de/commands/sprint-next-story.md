---
description: Naechste entwicklungsbereite Story abrufen
argument-hint: [--claim]
---

# Sprint naechste Story

Die naechste entwicklungsbereite Story im Sprint finden und optional uebernehmen.

## Argumente

$ARGUMENTS (format: [--claim])
- **--claim** (optional): Story automatisch in in-progress uebergeben

## Prozess

### Schritt 1: Sprint-Status laden

1. `.bmad/sprint-status.yaml` lesen
2. Alle Stories mit Status `ready-for-dev` abrufen
3. Nach Prioritaet (falls definiert) oder nach ID sortieren

### Schritt 2: Voraussetzungen pruefen

Fuer jede bereite Story pruefen:
- [ ] Keine blockierenden Abhaengigkeiten
- [ ] Story Points geschaetzt
- [ ] Aufgaben heruntergebrochen
- [ ] Akzeptanzkriterien definiert

### Schritt 3: Naechste Story auswaehlen

Prioritaetsreihenfolge:
1. Stories ohne blockierende Abhaengigkeiten
2. Niedrigere Story-ID (frueher im Backlog)
3. Niedrigere Story Points (einfachere zuerst)

### Schritt 4: Story-Details anzeigen

Vollstaendige Informationen anzeigen:
- ID und Titel
- Story Points
- Epic-Zuordnung
- Zusammenfassung der Akzeptanzkriterien
- Aufgabenlisten-Vorschau
- Eventuelle Hinweise oder Kontext

### Schritt 5: Story uebernehmen (falls --claim)

Falls `--claim`-Flag gesetzt:
1. Story in `in-progress` uebergeben
2. `tdd_phase` auf `red` setzen
3. `current_task` auf erste Aufgabe setzen
4. Uebergang in Historie aufzeichnen

### Schritt 6: Anweisungen bereitstellen

Naechste Schritte anzeigen:
- Erste zu bearbeitende Aufgabe
- TDD-Workflow-Erinnerung
- Zugehoerige Befehle

## Ausgabeformat

```
═══════════════════════════════════════════════════════
              Naechste entwicklungsbereite Story
═══════════════════════════════════════════════════════

📖 US-012: Benutzer-Profilseite implementieren
   Epic: EPIC-003 (Benutzerverwaltung)
   Punkte: 5
   Prioritaet: Hoch

Beschreibung:
──────────────────────────────────────────────────────
Als registrierter Benutzer
Moechte ich mein Profil sehen und bearbeiten koennen
Um meine Informationen aktuell zu halten

Akzeptanzkriterien (3):
──────────────────────────────────────────────────────
□ AC1: Benutzer kann seine Profilinformationen sehen
□ AC2: Benutzer kann Name und E-Mail aendern
□ AC3: Aenderungen werden vor dem Speichern validiert

Aufgaben (4):
──────────────────────────────────────────────────────
□ TASK-031 [BE] Profil-API-Endpoint erstellen
□ TASK-032 [BE] Profil-Validierung hinzufuegen
□ TASK-033 [FE] Profil-Komponente erstellen
□ TASK-034 [FE] Formular-Validierung hinzufuegen

Voraussetzungen:
──────────────────────────────────────────────────────
✅ Keine blockierenden Abhaengigkeiten
✅ Story Points geschaetzt
✅ Aufgaben heruntergebrochen
✅ Akzeptanzkriterien definiert

Um mit der Arbeit zu beginnen:
──────────────────────────────────────────────────────
/sprint:transition US-012 in-progress

Oder verwenden: /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Keine Story verfuegbar

```
═══════════════════════════════════════════════════════
              Keine entwicklungsbereite Story
═══════════════════════════════════════════════════════

📋 Backlog-Status:
   - 3 Stories im Backlog (benoetigen Refinement)
   - 2 Stories in Bearbeitung
   - 1 Story blockiert

Vorschlaege:
──────────────────────────────────────────────────────
1. Backlog-Stories verfeinern: /project:update-stories
2. Bei Stories in Bearbeitung unterstuetzen
3. US-003 entsperren: Wartet auf API-Zugangsdaten

Befehle:
  /sprint:bmad-status    Vollstaendigen Sprint-Status sehen
  /gate:validate-backlog Story-Bereitschaft pruefen
═══════════════════════════════════════════════════════
```

## Beispiel

```
/sprint:next-story
/sprint:next-story --claim
```

## TDD-Workflow

Nach Uebernahme einer Story:
1. 🔴 RED: Fehlschlagenden Test fuer erstes AC/Aufgabe schreiben
2. 🟢 GREEN: Minimalen Code implementieren, um Test zu bestehen
3. 🔵 REFACTOR: Bereinigen und Tests gruen halten
4. Fuer jede Aufgabe wiederholen

`/sprint:tdd-cycle` verwenden, um Phasenuebergaenge zu verfolgen.
