---
description: "Batch-Warteschlange von Stories verarbeiten"
argument-hint: "[--parallel N] [--auto] [--resume]"
---

# Warteschlange ausfuehren

Stories in der Batch-Warteschlange sequentiell oder parallel verarbeiten.

## Argumente

$ARGUMENTS (format: [--parallel N] [--auto] [--resume])
- **--parallel N** (optional): N Stories parallel verarbeiten. Standard: 1 (sequentiell)
- **--auto** (optional): Verarbeitung sofort ohne Bestaetigung starten
- **--resume** (optional): Vom letzten Checkpoint fortsetzen

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## Prozess

### Schritt 1: Warteschlange laden

1. `.bmad/batch-queue.yaml` lesen
2. Alle Stories mit Status `pending` abrufen
3. Nach Prioritaet sortieren

### Schritt 2: Abhaengigkeiten pruefen

Fuer jede Story:
- Pruefen, ob Abhaengigkeiten abgeschlossen sind
- Ueberspringen, falls durch wartende Story blockiert
- Markieren, falls durch fehlgeschlagene Story blockiert

### Schritt 3: Stories verarbeiten

Fuer jede berechtigte Story:
1. Als `running` markieren
2. `started_at` Zeitstempel setzen
3. Entwicklungs-Workflow ausfuehren:
   - In in-progress uebergehen
   - TDD-Zyklus (red → green → refactor)
   - Tests ausfuehren
   - Code-Review
   - Quality Gate-Validierung
4. Als `completed` oder `failed` markieren
5. Checkpoint aktualisieren

### Schritt 4: Fehler behandeln

Wenn eine Story fehlschlaegt:
- Als `failed` mit Fehlermeldung markieren
- `resume_on_failure`-Einstellung pruefen
- Fortsetzen oder stoppen je nach Konfiguration

### Schritt 5: Ergebnisse berichten

Endstatus und Metriken anzeigen.

## Ausgabeformat

### Verarbeitung

```
═══════════════════════════════════════════════════════
              Batch-Warteschlange verarbeiten
═══════════════════════════════════════════════════════

Modus: Sequentiell
Warteschlange: 5 wartend

Verarbeitung:
──────────────────────────────────────────────────────

[1/5] US-010: Benutzerregistrierung
      Starten... ✅
      TDD Red → Green → Refactor ✅
      Tests bestanden ✅
      Quality Gate ✅
      Abgeschlossen in 45 Min.

      Checkpoint gespeichert.

[2/5] US-011: Benutzeranmeldung
      Starten... ✅
      TDD Red → Green → Refactor ✅
      Tests bestanden ✅
      Quality Gate ✅
      Abgeschlossen in 38 Min.

      Checkpoint gespeichert.

[3/5] US-012: Profilseite
      Starten... ✅
      TDD Red... 🔄 laeuft

      (Strg+C fuer Pause, wird vom Checkpoint fortgesetzt)
```

### Abgeschlossen

```
═══════════════════════════════════════════════════════
              Batch-Warteschlange abgeschlossen
═══════════════════════════════════════════════════════

Ergebnisse:
──────────────────────────────────────────────────────
✅ Abgeschlossen: 5
❌ Fehlgeschlagen: 0
⏭️ Uebersprungen: 0

Verarbeitete Stories:
| Story | Status | Dauer |
|-------|--------|-------|
| US-010 | ✅ done | 45 Min. |
| US-011 | ✅ done | 38 Min. |
| US-012 | ✅ done | 52 Min. |
| US-013 | ✅ done | 28 Min. |
| US-014 | ✅ done | 35 Min. |

Gesamtzeit: 3h 18min
Durchschnitt pro Story: 40 Min.

Sprint-Status:
──────────────────────────────────────────────────────
📋 Backlog: 2
🎯 Ready: 0
🔄 In Bearbeitung: 0
👀 Review: 0
✅ Erledigt: 8

Befehle:
  /sprint:status --bmad    Aktualisierten Status sehen
  /gate:report          Qualitaetsbericht
═══════════════════════════════════════════════════════
```

### Mit Fehlern

```
═══════════════════════════════════════════════════════
              Batch-Warteschlange unterbrochen
═══════════════════════════════════════════════════════

Ergebnisse:
──────────────────────────────────────────────────────
✅ Abgeschlossen: 3
❌ Fehlgeschlagen: 1
⏭️ Uebersprungen: 1 (Abhaengigkeit fehlgeschlagen)

Fehlerdetails:
──────────────────────────────────────────────────────
❌ US-012: Profilseite
   Fehler: Fehlgeschlagene Tests in ProfileController
   TDD-Phase: red
   Letzter Checkpoint: TASK-033

   Stack-Trace:
   AssertionError: Expected 200, got 401
   at ProfileControllerTest.testGetProfile

Aktionen:
──────────────────────────────────────────────────────
1. Fehlgeschlagenen Test korrigieren
2. Verarbeitung fortsetzen:
   /project:run-queue --resume

Oder zuruecksetzen und erneut versuchen:
   /project:queue-reset US-012
   /project:run-queue
═══════════════════════════════════════════════════════
```

### Parallelmodus

```
═══════════════════════════════════════════════════════
              Batch-Warteschlange verarbeiten
═══════════════════════════════════════════════════════

Modus: Parallel (3 Worker)
Warteschlange: 5 wartend

Verarbeitung:
──────────────────────────────────────────────────────

Worker 1: US-010 - Benutzerregistrierung 🔄
Worker 2: (wartet auf Abhaengigkeiten)
Worker 3: (wartet auf Abhaengigkeiten)

[10:05] US-010 gestartet
[10:08] US-010: TDD-Phase Green
[10:12] US-010: Tests bestanden
[10:15] US-010 abgeschlossen ✅

[10:15] Abhaengigkeiten geloest, paralleler Batch startet:
Worker 1: US-011 - Benutzeranmeldung 🔄
Worker 2: US-012 - Profilseite 🔄
Worker 3: US-014 - E-Mail-Verifizierung 🔄

[10:20] US-014 abgeschlossen ✅
[10:22] US-011 abgeschlossen ✅
Worker 3: US-013 - Passwort zuruecksetzen 🔄 (deps: US-010, US-011 ✅)
[10:25] US-012 abgeschlossen ✅
[10:30] US-013 abgeschlossen ✅

Alle Worker abgeschlossen.
═══════════════════════════════════════════════════════
```

## Beispiel

```
/project:run-queue
/project:run-queue --auto
/project:run-queue --parallel 3
/project:run-queue --resume
```

## Konfiguration

Warteschlangenparameter in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # oder "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600

settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

## Checkpoints

Checkpoints werden nach jeder Story gespeichert:
```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

Vom Checkpoint fortsetzen:
```
/project:run-queue --resume
```
