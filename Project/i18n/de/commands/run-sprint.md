---
description: "Alle bereiten Stories des aktuellen Sprints ausfuehren"
argument-hint: "[--auto] [--dry-run]"
---

# Sprint ausfuehren

Alle entwicklungsbereiten Stories des aktuellen Sprints in die Warteschlange stellen und ausfuehren.

## Argumente

$ARGUMENTS (format: [--auto] [--dry-run])
- **--auto** (optional): Verarbeitung sofort starten
- **--dry-run** (optional): Ausfuehrungsplan vorschauen ohne Aenderungen

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## Prozess

### Schritt 1: Sprint validieren

1. `/gate:validate-sprint` ausfuehren, um Sprint-Bereitschaft sicherzustellen
2. Bei Gate-Fehler Probleme anzeigen und beenden
3. Sprint-Metadaten abrufen

### Schritt 2: Bereite Stories sammeln

1. Alle Stories mit Status `ready-for-dev` abrufen
2. Nach Prioritaet (falls definiert) oder ID sortieren
3. Gesamte Story Points berechnen

### Schritt 3: Ausfuehrungsplan erstellen

Geordnete Warteschlange erstellen:
1. Abhaengigkeiten zwischen Stories analysieren
2. Abhaengigkeitsgraph aufbauen
3. Ausfuehrungsreihenfolge bestimmen
4. Parallelisierbare Gruppen identifizieren

### Schritt 4: Stories in Warteschlange stellen

Alle Stories zu `.bmad/batch-queue.yaml` hinzufuegen mit:
- Prioritaet basierend auf Abhaengigkeiten und Reihenfolge
- Abhaengigkeiten gemappt
- Status auf `pending` gesetzt

### Schritt 5: Ausfuehren (falls --auto)

Warteschlangenverarbeitung starten:
- Standardmaessig sequentiell
- `--parallel N` fuer parallele Ausfuehrung verwenden
- Checkpoint nach jeder Story

## Ausgabeformat

### Dry Run

```
═══════════════════════════════════════════════════════
           Sprint ausfuehren: sprint-3 (DRY RUN)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Benutzerverwaltung
Zeitraum: 2026-01-29 → 2026-02-12

Sprint-Gate: ✅ VALIDIERT

Bereite Stories: 5
Gesamtpunkte: 21

Ausfuehrungsplan:
──────────────────────────────────────────────────────

Phase 1 (keine Abhaengigkeiten):
  📖 US-010: Benutzerregistrierung (5 Pkt.)

Phase 2 (nach US-010):
  📖 US-011: Benutzeranmeldung (5 Pkt.)
  📖 US-012: Profilseite (5 Pkt.)
  📖 US-014: E-Mail-Verifizierung (3 Pkt.)

Phase 3 (nach US-010, US-011):
  📖 US-013: Passwort zuruecksetzen (3 Pkt.)

Parallelisierungsmoeglichkeiten:
──────────────────────────────────────────────────────
• Phase 2: US-011, US-012, US-014 koennen parallel laufen
• Maximale Parallelitaet: 3 Stories

Geschaetzte Dauer:
──────────────────────────────────────────────────────
Sequentiell: ~3,5 Stunden (durchschn. 42 Min./Story)
Parallel (3): ~2 Stunden

⚠️ DRY RUN - Keine Aenderungen vorgenommen

Zum Ausfuehren:
  /project:run-sprint
  /project:run-sprint --auto
  /project:run-sprint --auto --parallel 3
═══════════════════════════════════════════════════════
```

### In Warteschlange stellen

```
═══════════════════════════════════════════════════════
              Sprint ausfuehren: sprint-3
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Benutzerverwaltung
Zeitraum: 2026-01-29 → 2026-02-12

Sprint validieren...
  ✅ Sprint-Metadaten vollstaendig
  ✅ Sprint-Ziel definiert
  ✅ 5 Stories bereit
  ✅ Alle Stories geschaetzt

Stories in Warteschlange stellen...
──────────────────────────────────────────────────────
✅ US-010: Benutzerregistrierung (Prioritaet 1)
✅ US-011: Benutzeranmeldung (Prioritaet 2)
✅ US-012: Profilseite (Prioritaet 3)
✅ US-013: Passwort zuruecksetzen (Prioritaet 4)
✅ US-014: E-Mail-Verifizierung (Prioritaet 5)

Warteschlangen-Zusammenfassung:
──────────────────────────────────────────────────────
Stories in Warteschlange: 5
Gesamtpunkte: 21
Abhaengigkeiten gemappt: 4

Batch-Warteschlange aktualisiert: .bmad/batch-queue.yaml

Um Verarbeitung zu starten:
  /project:run-queue

Oder fuer automatische Ausfuehrung:
  /project:run-sprint --auto
═══════════════════════════════════════════════════════
```

### Automatische Ausfuehrung

```
═══════════════════════════════════════════════════════
              Sprint ausfuehren: sprint-3 (AUTO)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Benutzerverwaltung

Validieren... ✅
In Warteschlange stellen... ✅
Ausfuehrung starten...

──────────────────────────────────────────────────────

[1/5] US-010: Benutzerregistrierung
      ⏳ In in-progress uebergehen
      🔴 TDD Red: Fehlschlagende Tests schreiben
      🟢 TDD Green: Code implementieren
      🔵 TDD Refactor: Bereinigen
      ✅ Tests bestanden
      👀 Bereit fuer Review
      ✅ Abgeschlossen

      Fortschritt: ████░░░░░░░░░░░░░░░░ 20%

[2/5] US-011: Benutzeranmeldung
      ⏳ In in-progress uebergehen
      🔴 TDD Red: Fehlschlagende Tests schreiben
      ...

Sprint-Fortschritt:
──────────────────────────────────────────────────────
█████████░░░░░░░░░░░ 45%

Abgeschlossen: 2/5 Stories (9/21 Pkt.)
In Bearbeitung: US-012 - Profilseite
Verstrichene Zeit: 1h 23m
Geschaetzte Restzeit: 1h 45m
═══════════════════════════════════════════════════════
```

### Fertigstellung

```
═══════════════════════════════════════════════════════
              Sprint abgeschlossen!
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Benutzerverwaltung

Ergebnisse:
──────────────────────────────────────────────────────
✅ Abgeschlossen: 5/5 Stories
📊 Punkte: 21/21 geliefert
⏱️ Dauer: 3h 18min

Story-Zusammenfassung:
| Story | Punkte | Dauer | Status |
|-------|--------|-------|--------|
| US-010 | 5 | 45m | ✅ done |
| US-011 | 5 | 38m | ✅ done |
| US-012 | 5 | 52m | ✅ done |
| US-013 | 3 | 28m | ✅ done |
| US-014 | 3 | 35m | ✅ done |

Quality Gates:
──────────────────────────────────────────────────────
✅ Alle Stories haben DoD bestanden
✅ Alle Tests bestanden
✅ Code reviewed

Sprint-Status:
──────────────────────────────────────────────────────
📋 Backlog: 3 (naechster Sprint)
✅ Erledigt: 5

🎉 Sprint-Ziel erreicht!

Naechste Schritte:
  /sprint:retrospective    Retrospektive starten
  /sprint:plan            Naechsten Sprint planen
═══════════════════════════════════════════════════════
```

## Beispiel

```
/project:run-sprint --dry-run
/project:run-sprint
/project:run-sprint --auto
/project:run-sprint --auto --parallel 3
```

## Konfiguration

Sprint-Ausfuehrungsparameter in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
```

## Unterbrechung und Wiederaufnahme

Bei Unterbrechung (Strg+C oder Fehler):
```
/project:run-queue --resume
```

Der Checkpoint wird nach jeder abgeschlossenen Story gespeichert.

## Integration

Funktioniert mit:
- `/sprint:status --bmad` - Fortschritt sehen
- `/gate:report` - Qualitaetsmetriken
- Ralph (falls konfiguriert) - Externe Orchestrierung
