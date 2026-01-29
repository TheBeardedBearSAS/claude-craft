---
description: BMAD Sprint-Status mit Routing-Informationen anzeigen
argument-hint: [--verbose]
---

# BMAD Sprint-Status

Den vollstaendigen Sprint-Status mit BMAD v6-Tracking und zustandsmaschinenbasiertem Routing anzeigen.

## Argumente

$ARGUMENTS (format: [--verbose])
- **--verbose** (optional): Aufgabendetails pro Story anzeigen

## Prozess

### Schritt 1: sprint-status.yaml laden

1. `.bmad/sprint-status.yaml` lesen
2. Metadaten, Stories, Routing-Regeln parsen
3. Falls Datei nicht existiert, `/project:migrate-backlog` vorschlagen

### Schritt 2: Metadaten extrahieren

Sprint-Informationen anzeigen:
- Sprint-ID und Name
- Start- und Enddatum
- Sprint-Ziel
- Verbleibende Tage

### Schritt 3: Stories nach Status zaehlen

Stories nach Zustand aggregieren:
- 📋 Backlog
- 🎯 Bereit fuer Entwicklung
- 🔄 In Bearbeitung
- 👀 Review
- ✅ Erledigt
- ⛔ Blockiert

Berechnen:
- Geplante Story Points gesamt
- Abgeschlossene Story Points
- Velocity (falls Historie verfuegbar)
- Burndown-Fortschritt

### Schritt 4: Zustandsmaschine anzeigen

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Schritt 5: Detailansicht anzeigen (falls --verbose)

Fuer jede Story:
- ID und Titel
- Aktueller Status und TDD-Phase
- Aufgabendetails (abgeschlossen/gesamt)
- Status der Akzeptanzkriterien
- Aktuelle Aufgabe
- Zeit im aktuellen Status

### Schritt 6: Auto-Routing-Vorschlaege

Pruefen, ob automatische Uebergaenge stattfinden sollten:
- Stories mit allen abgeschlossenen Aufgaben → Review vorschlagen
- Entsperrte Stories → Rueckkehr zum vorherigen Status vorschlagen

## Ausgabeformat

```
═══════════════════════════════════════════════════════
                  BMAD Sprint-Status
═══════════════════════════════════════════════════════

Sprint: {SPRINT_ID} - {SPRINT_NAME}
Zeitraum: {STARTDATUM} → {ENDDATUM} ({VERBLEIBENDE_TAGE} Tage verbleibend)
Ziel: {SPRINT_ZIEL}

Fortschritt: ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40% (24/60 Pkt.)

Stories nach Status:
──────────────────────────────────────────────────────
📋 Backlog:          2
🎯 Bereit fuer Dev:  3
🔄 In Bearbeitung:   2
👀 Review:           1
✅ Erledigt:         4
⛔ Blockiert:        1

In Bearbeitung:
──────────────────────────────────────────────────────
🔄 US-005: Benutzer-Authentifizierung
   TDD: 🟢 Green | Aufgaben: 3/5 | AC: 1/3
   Aktuelle Aufgabe: TASK-015 - JWT-Validierung implementieren

Blockiert:
──────────────────────────────────────────────────────
⛔ US-003: OAuth-Integration
   Grund: Warten auf API-Zugangsdaten
   Blockiert seit: 2026-01-27 (2 Tage)

Auto-Routing-Vorschlaege:
──────────────────────────────────────────────────────
💡 US-008 hat alle Aufgaben abgeschlossen → /sprint:transition US-008 review

Befehle:
  /sprint:next-story         Naechste Story uebernehmen
  /sprint:transition <ID>    Status aendern
  /sprint:auto-route        Auto-Uebergaenge anwenden
═══════════════════════════════════════════════════════
```

## Beispiel

```
/sprint:bmad-status
/sprint:bmad-status --verbose
```
