---
description: Story in einen neuen Status uebergeben
argument-hint: <story-id> <ziel-status>
---

# Sprint-Uebergang

Eine Story mit Validierung und Historie-Tracking in einen neuen Status uebergeben.

## Argumente

$ARGUMENTS (format: <story-id> <ziel-status>)
- **story-id** (erforderlich): Story-Identifikator (z.B. US-001)
- **ziel-status** (erforderlich): Zielstatus

Gueltige Status:
- `backlog` - Story im Product Backlog
- `ready-for-dev` - Verfeinert und entwicklungsbereit
- `in-progress` - In aktiver Entwicklung
- `review` - Code fertig, wartet auf Review
- `done` - Definition of Done erreicht
- `blocked` - Durch externen Faktor blockiert

## Prozess

### Schritt 1: Story-Existenz validieren

1. `.bmad/sprint-status.yaml` lesen
2. Story nach ID finden
3. Aktuellen Status abrufen

### Schritt 2: Uebergang validieren

Zustandsmaschinen-Regeln pruefen:
```
Erlaubte Uebergaenge:
  backlog → ready-for-dev
  ready-for-dev → in-progress
  in-progress → review
  review → done
  review → in-progress (Aenderungen angefordert)
  * → blocked (jeder Status kann blockiert werden)
  blocked → previous_status (fortsetzen)
```

### Schritt 3: Gate-Anforderungen pruefen

Vor Uebergang Gate-Anforderungen pruefen:

**→ ready-for-dev**
- [ ] Akzeptanzkriterien definiert
- [ ] Story Points geschaetzt
- [ ] Aufgaben heruntergebrochen

**→ in-progress**
- [ ] Keine blockierenden Abhaengigkeiten
- [ ] Entwickler zugewiesen (optional)

**→ review**
- [ ] Alle Aufgaben abgeschlossen
- [ ] Tests bestanden (TDD green oder refactor)
- [ ] Code gepusht

**→ done**
- [ ] Code reviewed
- [ ] Alle AC validiert
- [ ] DoD-Checkliste vollstaendig

**→ blocked**
- blocked_reason angeben

### Schritt 4: Uebergang ausfuehren

1. Vorherigen Status speichern
2. Statusfeld aktualisieren
3. Zeitstempel setzen
4. TDD-Phase aktualisieren falls zutreffend
5. In Historie aufzeichnen

### Schritt 5: Nebeneffekte

Je nach Uebergang:

**→ in-progress**
- `tdd_phase` auf `red` setzen
- `current_task` auf erste Aufgabe setzen

**→ review**
- `tdd_phase` auf `refactor` setzen
- `current_task` leeren

**→ done**
- `tdd_phase` leeren
- Abschlusszeit aufzeichnen

**→ blocked**
- `blocked_reason` speichern
- `previous_status` fuer Fortsetzung speichern

### Schritt 6: Historie aktualisieren

Eintrag hinzufuegen:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "Alle Aufgaben abgeschlossen"
```

## Ausgabeformat

### Erfolgreicher Uebergang

```
═══════════════════════════════════════════════════════
              Story-Uebergang
═══════════════════════════════════════════════════════

📖 US-005: Benutzer-Authentifizierung

Status: in-progress → review ✅

Gate-Pruefungen:
──────────────────────────────────────────────────────
✅ Alle Aufgaben abgeschlossen (5/5)
✅ Tests bestanden
✅ Code gepusht

Historie aktualisiert:
──────────────────────────────────────────────────────
• 2026-01-29 10:00 - in-progress → review (manuell)
• 2026-01-27 09:00 - ready-for-dev → in-progress
• 2026-01-25 14:00 - backlog → ready-for-dev

Naechste Schritte:
──────────────────────────────────────────────────────
Die Story ist jetzt im Review. Reviewer zuweisen oder ausfuehren:
  /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Gate fehlgeschlagen

```
═══════════════════════════════════════════════════════
              Uebergang blockiert
═══════════════════════════════════════════════════════

📖 US-005: Benutzer-Authentifizierung

Angefordert: in-progress → review ❌

Gate-Fehler:
──────────────────────────────────────────────────────
❌ Aufgaben unvollstaendig: 3/5
❌ TDD-Phase ist 'red' - Tests muessen zuerst bestehen

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
1. Verbleibende Aufgaben abschliessen:
   □ TASK-015: JWT-Validierung implementieren
   □ TASK-016: Refresh-Token-Unterstuetzung hinzufuegen

2. TDD-Phase auf green setzen:
   /sprint:tdd green

Dann erneut versuchen: /sprint:transition US-005 review
═══════════════════════════════════════════════════════
```

### Ungueltiger Uebergang

```
═══════════════════════════════════════════════════════
              Ungueltiger Uebergang
═══════════════════════════════════════════════════════

📖 US-005: Benutzer-Authentifizierung

Aktuell: in-progress
Angefordert: done ❌

Ungueltig: Kann nicht direkt von 'in-progress' nach 'done' uebergehen

Gueltige Uebergaenge von 'in-progress':
──────────────────────────────────────────────────────
• review - Code fertig, bereit fuer Review
• blocked - Story blockiert

Zustandsmaschine:
  backlog → ready-for-dev → in-progress → review → done
═══════════════════════════════════════════════════════
```

## Beispiel

```
/sprint:transition US-005 review
/sprint:transition US-003 blocked "Warten auf API-Zugangsdaten"
/sprint:transition US-003 in-progress  # Von blocked fortsetzen
```

## Sonderfaelle

### Story blockieren
```
/sprint:transition US-003 blocked "Warten auf externe API"
```
Speichert den Grund und bewahrt den vorherigen Status fuer Fortsetzung.

### Story entsperren
```
/sprint:transition US-003 in-progress
```
Bei Uebergang von blocked wird zum vorherigen Status zurueckgekehrt.

### Aenderungen im Review anfordern
```
/sprint:transition US-005 in-progress
```
Gueltiger Rueckwaerts-Uebergang von review zur Feedback-Bearbeitung.
