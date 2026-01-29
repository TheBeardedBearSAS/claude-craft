---
description: Status der Batch-Verarbeitungswarteschlange anzeigen
argument-hint: [--history]
---

# Batch-Status

Den aktuellen Status der Batch-Verarbeitungswarteschlange anzeigen.

## Argumente

$ARGUMENTS (format: [--history])
- **--history** (optional): Verlauf abgeschlossener/fehlgeschlagener Stories anzeigen

## Prozess

### Schritt 1: Warteschlange laden

1. `.bmad/batch-queue.yaml` lesen
2. Warteschlangen-Eintraege parsen
3. Checkpoint-Daten laden

### Schritt 2: Stories kategorisieren

Nach Status gruppieren:
- `pending` - Wartet auf Verarbeitung
- `running` - Wird aktuell verarbeitet
- `completed` - Erfolgreich abgeschlossen
- `failed` - Fehler aufgetreten
- `skipped` - Uebersprungen wegen Abhaengigkeitsfehler

### Schritt 3: Warteschlangenstatus anzeigen

Aktuellen Warteschlangenstatus mit Details anzeigen.

### Schritt 4: Verlauf anzeigen (falls angefordert)

Abgeschlossene und fehlgeschlagene Stories mit Timing anzeigen.

## Ausgabeformat

### Aktive Warteschlange

```
═══════════════════════════════════════════════════════
              Batch-Warteschlangenstatus
═══════════════════════════════════════════════════════

Modus: Sequentiell
Checkpoint: US-011 (2026-01-29 10:45:00)

Warteschlangen-Zusammenfassung:
──────────────────────────────────────────────────────
⏳ Wartend:      3
🔄 Laufend:      1
✅ Abgeschlossen: 2
❌ Fehlgeschlagen: 0
⏭️ Uebersprungen: 0

Gesamt: 6 Stories

Laufend:
──────────────────────────────────────────────────────
🔄 US-012: Profilseite
   Prioritaet: 3
   Gestartet: 2026-01-29 10:45:00 (vor 15 Min.)
   TDD-Phase: green
   Aufgabe: 2/4

Wartend:
──────────────────────────────────────────────────────
[4] US-013: Passwort zuruecksetzen
    Abhaengigkeiten: US-010 ✅, US-011 ✅

[5] US-014: E-Mail-Verifizierung
    Abhaengigkeiten: US-010 ✅

[6] US-015: Einstellungsseite
    Abhaengigkeiten: keine

Fortschritt:
──────────────────────────────────────────────────────
██████████░░░░░░░░░░ 50% (3/6 Stories)

Geschaetzte Restzeit: ~1h 30m
═══════════════════════════════════════════════════════
```

### Mit Verlauf

```
═══════════════════════════════════════════════════════
              Batch-Warteschlangenstatus
═══════════════════════════════════════════════════════

Modus: Sequentiell
Letzter Checkpoint: US-014

Warteschlangen-Zusammenfassung:
──────────────────────────────────────────────────────
⏳ Wartend:      0
🔄 Laufend:      0
✅ Abgeschlossen: 5
❌ Fehlgeschlagen: 1
⏭️ Uebersprungen: 1

Abgeschlossene Historie:
──────────────────────────────────────────────────────
| Story | Gestartet | Beendet | Dauer |
|-------|-----------|---------|-------|
| US-010 | 10:00 | 10:42 | 42m |
| US-011 | 10:42 | 11:18 | 36m |
| US-012 | 11:18 | 12:05 | 47m |
| US-014 | 12:05 | 12:38 | 33m |
| US-015 | 12:38 | 13:10 | 32m |

Fehlgeschlagen:
──────────────────────────────────────────────────────
❌ US-013: Passwort zuruecksetzen
   Gestartet: 12:05
   Fehlgeschlagen: 12:22
   Dauer: 17m
   Fehler: Test-Assertion fehlgeschlagen in PasswordResetTest
   TDD-Phase: red

Uebersprungen:
──────────────────────────────────────────────────────
⏭️ US-016: Admin-Panel
   Grund: Haengt ab von US-013, das fehlgeschlagen ist

Statistiken:
──────────────────────────────────────────────────────
Gesamtzeit: 3h 10m
Durchschnitt pro Story: 38m
Erfolgsrate: 83% (5/6)
Abgeschlossene Punkte: 18/21

Aktionen:
──────────────────────────────────────────────────────
Um fehlgeschlagene Stories erneut zu versuchen:
  /project:queue-retry US-013

Um Warteschlange zu leeren:
  /project:queue-clear
═══════════════════════════════════════════════════════
```

### Leere Warteschlange

```
═══════════════════════════════════════════════════════
              Batch-Warteschlangenstatus
═══════════════════════════════════════════════════════

Die Warteschlange ist leer.

Keine Story ist derzeit in der Verarbeitungswarteschlange.

Um Stories hinzuzufuegen:
  /project:run-epic EPIC-001    Ein Epic in die Warteschlange stellen
  /project:run-sprint           Sprint-Stories in die Warteschlange stellen

Oder einzelne Story hinzufuegen:
  .bmad/lib/batch-executor.sh add US-001
═══════════════════════════════════════════════════════
```

## Beispiel

```
/project:batch-status
/project:batch-status --history
```

## Warteschlangenverwaltung

### Story zur Warteschlange hinzufuegen
```bash
.bmad/lib/batch-executor.sh add US-001 1
```

### Fehlgeschlagene Story erneut versuchen
```
/project:queue-retry US-013
```

### Warteschlange leeren
```
/project:queue-clear --force
```

### Vom Checkpoint fortsetzen
```
/project:run-queue --resume
```

## Konfiguration

Warteschlangendatei: `.bmad/batch-queue.yaml`

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```
