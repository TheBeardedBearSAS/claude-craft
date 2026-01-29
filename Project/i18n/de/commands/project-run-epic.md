---
description: Alle Stories eines Epics im Batch-Modus ausfuehren
argument-hint: <epic-id> [--dry-run]
---

# Epic ausfuehren

Alle Stories eines Epics im Batch-Modus in die Warteschlange stellen und verarbeiten.

## Argumente

$ARGUMENTS (format: <epic-id> [--dry-run])
- **epic-id** (erforderlich): Epic-Identifikator (z.B. EPIC-001)
- **--dry-run** (optional): Vorschau ohne Ausfuehrung

## Prozess

### Schritt 1: Epic-Stories identifizieren

1. `.bmad/sprint-status.yaml` lesen
2. Alle Stories mit passender `epic_id` finden
3. Nach Prioritaet oder ID sortieren

### Schritt 2: Story-Bereitschaft pruefen

Fuer jede Story pruefen:
- Story existiert und hat erforderliche Felder
- Noch nicht abgeschlossen
- Nicht blockiert (oder zur Ueberpruefung markieren)

### Schritt 3: Ausfuehrungswarteschlange aufbauen

Priorisierte Warteschlange erstellen:
1. Stories ohne Abhaengigkeiten zuerst
2. Niedrigere ID = hoehere Prioritaet
3. Explizite Prioritaet beachten falls definiert

### Schritt 4: Zur Batch-Warteschlange hinzufuegen

`.bmad/batch-queue.yaml` aktualisieren:
```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-002"
    priority: 2
    dependencies: ["US-001"]
```

### Schritt 5: Ausfuehren (ausser bei --dry-run)

Fuer jede Story in Reihenfolge:
1. In in-progress uebergehen
2. Entwicklungs-Workflow ausfuehren
3. Quality Gates ausfuehren
4. Durch Status uebergehen
5. Nach jeder Story Checkpoint setzen

## Ausgabeformat

### Dry Run

```
═══════════════════════════════════════════════════════
           Epic ausfuehren: EPIC-002 (DRY RUN)
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Benutzerverwaltung
Stories: 5

Ausfuehrungsplan:
──────────────────────────────────────────────────────
[1] US-010: Benutzerregistrierung (5 Pkt.)
    Status: ready-for-dev → in-progress → review → done
    Abhaengigkeiten: keine

[2] US-011: Benutzeranmeldung (5 Pkt.)
    Status: ready-for-dev → in-progress → review → done
    Abhaengigkeiten: US-010

[3] US-012: Profilseite (5 Pkt.)
    Status: ready-for-dev → in-progress → review → done
    Abhaengigkeiten: US-010

[4] US-013: Passwort zuruecksetzen (3 Pkt.)
    Status: ready-for-dev → in-progress → review → done
    Abhaengigkeiten: US-010, US-011

[5] US-014: E-Mail-Verifizierung (3 Pkt.)
    Status: ready-for-dev → in-progress → review → done
    Abhaengigkeiten: US-010

Gesamtpunkte: 21

Ausfuehrungsreihenfolge (Abhaengigkeiten beachtend):
  1. US-010 (keine Deps)
  2. US-011, US-012, US-014 (parallel nach US-010)
  3. US-013 (nach US-010, US-011)

Geschaetzter Workflow pro Story:
  • In in-progress uebergehen
  • TDD-Zyklen (red → green → refactor)
  • Code-Review
  • Quality Gate-Validierung
  • In done uebergehen

⚠️ DRY RUN - Keine Aenderungen vorgenommen

Ohne --dry-run ausfuehren zum Starten.
═══════════════════════════════════════════════════════
```

### Ausfuehrung

```
═══════════════════════════════════════════════════════
              Epic ausfuehren: EPIC-002
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Benutzerverwaltung
Modus: Sequentiell
Stories: 5

Stories in Warteschlange stellen...
──────────────────────────────────────────────────────
✅ US-010 hinzugefuegt (Prioritaet 1)
✅ US-011 hinzugefuegt (Prioritaet 2, abhaengig von US-010)
✅ US-012 hinzugefuegt (Prioritaet 3, abhaengig von US-010)
✅ US-013 hinzugefuegt (Prioritaet 4, abhaengig von US-010, US-011)
✅ US-014 hinzugefuegt (Prioritaet 5, abhaengig von US-010)

Warteschlangenstatus:
──────────────────────────────────────────────────────
⏳ Wartend: 5
🔄 Laufend: 0
✅ Abgeschlossen: 0
❌ Fehlgeschlagen: 0

Naechste Schritte:
──────────────────────────────────────────────────────
Warteschlange ausfuehren:
  /project:run-queue

Oder automatisch verarbeiten:
  /project:run-queue --auto

Fortschritt ueberwachen:
  /project:batch-status
═══════════════════════════════════════════════════════
```

## Beispiel

```
/project:run-epic EPIC-002 --dry-run
/project:run-epic EPIC-002
```

## Parallele Ausfuehrung

Fuer unabhaengige Stories Parallelmodus aktivieren:
```
/project:run-queue --parallel 3
```

Dies verarbeitet bis zu 3 Stories gleichzeitig, wenn sie keine Abhaengigkeiten haben.

## Wiederaufnahme

Falls Ausfuehrung unterbrochen wird:
```
/project:run-queue --resume
```

Setzt vom letzten Checkpoint fort.

## Ralph-Integration

Falls Ralph konfiguriert ist, integriert sich die Batch-Ausfuehrung:
```yaml
# ralph.yml
bmad_integration:
  enabled: true
  batch_queue_file: ".bmad/batch-queue.yaml"
```
