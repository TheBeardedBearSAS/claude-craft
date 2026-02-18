---
description: Sprint-Status
argument-hint: [arguments]
---

# Sprint-Status

Detaillierte Metriken und Sprint-Fortschritt anzeigen.

## Argumente

$ARGUMENTS (optional, Format: [sprint N])
- **sprint N** (optional): Sprint-Nummer
- Falls nicht angegeben, aktuellen Sprint anzeigen

## Prozess

### Schritt 1: Sprint identifizieren

1. Angeforderten Sprint oder aktuellen Sprint finden
2. sprint-goal.md lesen

### Schritt 2: Daten sammeln

1. Alle Sprint User Stories lesen
2. Alle zugehörigen Aufgaben lesen
3. Metriken berechnen

### Schritt 3: Bericht generieren

Detaillierten Bericht erstellen mit:
- Übersicht
- Fortschritt nach US
- Zeitmetriken
- Burndown-Chart (Text)
- Blockern
- Risiken

## Ausgabeformat

```
╔══════════════════════════════════════════════════════════════════╗
║  📊 SPRINT 1 - STATUS-BERICHT                                    ║
║  Generiert: 2024-01-22 14:30                                     ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 SPRINT-ZIEL                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Walking Skeleton - Vollständige Authentifizierung und erste     │
│ Seite                                                            │
│ Zeitraum: 2024-01-15 → 2024-01-29 (Tag 8/14)                   │
└──────────────────────────────────────────────────────────────────┘

══════════════════════════════════════════════════════════════════════════
📈 ÜBERSICHT

Gesamtfortschritt:
██████████████░░░░░░░░░░░░░░░░░░ 45%

│ Metrik              │ Aktuell│ Ziel   │ Status │
├─────────────────────┼────────┼────────┼────────┤
│ Punkte abgeschlossen│ 5      │ 10     │ 🟡 50% │
│ Aufgaben abgeschl.  │ 8      │ 16     │ 🟡 50% │
│ Stunden abgeschl.   │ 28h    │ 62h    │ 🟡 45% │
│ Verbleibende Tage   │ 6      │ -      │        │

══════════════════════════════════════════════════════════════════════════
📖 FORTSCHRITT NACH USER STORY

│ US      │ Name               │ Punkte │ Aufgaben │ Status          │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-001  │ Benutzer-Login     │ 5      │ 6/10     │ 🟡 In Progress  │
│         │                    │        │ 60%      │ ██████░░░░      │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-002  │ Produktliste       │ 5      │ 2/6      │ 🔴 To Do        │
│         │                    │        │ 33%      │ ███░░░░░░░      │

══════════════════════════════════════════════════════════════════════════
⏱️ ZEITMETRIKEN

Geschätzt vs. Tatsächlich (Stunden):
│ Typ     │ Schätz.│ Tatsäch│ Diff   │
├─────────┼────────┼────────┼────────┤
│ [DB]    │ 6h     │ 5.5h   │ -0.5h  │ ✅
│ [BE]    │ 20h    │ 12h    │ -      │ 🟡 In Bearbeitung
│ [FE-WEB]│ 12h    │ 3h     │ -      │ 🟡 In Bearbeitung
│ [FE-MOB]│ 14h    │ 0h     │ -      │ ⏸️ Blockiert
│ [TEST]  │ 10h    │ 7.5h   │ -2.5h  │ ✅ Unterschätzt

Tägliche Velocity: 4h/Tag (Ziel: 4.4h/Tag)

══════════════════════════════════════════════════════════════════════════
📉 BURNDOWN (vereinfacht)

Verbleibende Stunden pro Tag:
62h │████████████████████████████████████████████████████████████████
    │█████████████████████████████████████████████████████░░░░░░░░░░░
    │██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← Ideal
34h │████████████████████████████████████████████████ ← Tatsächlich
    └───────────────────────────────────────────────────────────────
    T1  T2  T3  T4  T5  T6  T7  T8  T9  T10 T11 T12 T13 T14

Status: 🟡 Leicht im Rückstand (6h)

══════════════════════════════════════════════════════════════════════════
⚠️ BLOCKER

│ Aufgabe  │ US     │ Blocker                      │ Seit   │
├──────────┼────────┼──────────────────────────────┼────────┤
│ TASK-008 │ US-001 │ Warte auf Auth API           │ 2 Tage │
│ TASK-021 │ US-002 │ Fehlende SMTP-Konfiguration  │ 1 Tag  │

Auswirkung: 14h blockiert (22% des Sprints)

══════════════════════════════════════════════════════════════════════════
🚨 RISIKEN

│ Level  │ Beschreibung                        │ Abschwächung            │
├────────┼─────────────────────────────────────┼─────────────────────────┤
│ 🔴 Hoch│ Mobile seit 2 Tagen blockiert       │ TASK-005 priorisieren   │
│ 🟡 Mit.│ 6h hinter Zeitplan                  │ Mögliche Überstunden    │
│ 🟢 Ger.│ Tests unterschätzt                  │ Puffer in Sprint 2 add. │

══════════════════════════════════════════════════════════════════════════
📋 EMPFOHLENE AKTIONEN

1. 🔴 DRINGEND: TASK-008 durch Abschluss von TASK-005 entblocken
2. 🟡 SMTP konfigurieren, um TASK-021 zu entblocken
3. 🟢 Test-Schätzungen für zukünftige Sprints überprüfen

══════════════════════════════════════════════════════════════════════════

Aktionen:
  /project:board                    # Kanban anzeigen
  /project:move-task TASK-XXX done  # Aufgabe abschließen
  /project:list-tasks status blocked # Alle Blocker anzeigen
```

## Beispiele

```
# Aktueller Sprint-Status
/sprint:status

# Sprint 2-Status
/sprint:status sprint 2
```

## Berichtsgenerierung

Bericht wird auch gespeichert in:
`project-management/sprints/sprint-XXX/status-YYYY-MM-DD.md`

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Nächste Story auswählen                               ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Entwicklung fortsetzen                                ║
║                                                          ║
║  → /workflow:review                                      ║
║    Sprint-Review (wenn Sprint abgeschlossen)             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
