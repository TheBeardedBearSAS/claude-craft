---
description: Vollstaendigen Quality Gates-Bericht anzeigen
argument-hint: [--detailed]
---

# Quality Gates-Bericht

Einen vollstaendigen Bericht aller BMAD Quality Gates generieren.

## Argumente

$ARGUMENTS (format: [--detailed])
- **--detailed** (optional): Validierungsdetails fuer jedes Gate einschliessen

## Prozess

### Schritt 1: Anwendbare Gates identifizieren

Bestimmen, welche Gates basierend auf dem Projektstatus gelten:
- Gate PRD: Falls PRD-Datei existiert
- Gate Tech Spec: Falls Tech Spec-Datei existiert
- Gate Backlog: Falls Stories existieren
- Gate Sprint Ready: Falls Sprint-Metadaten existieren
- Gates Story: Fuer jede Story in-progress/review

### Schritt 2: Validierungen ausfuehren

Jeden anwendbaren Gate-Validator ausfuehren.

### Schritt 3: Ergebnisse aggregieren

Ergebnisse in einem zusammenfassenden Bericht kompilieren.

### Schritt 4: Empfehlungen generieren

Basierend auf Fehlern priorisierte Massnahmen vorschlagen.

## Ausgabeformat

```
═══════════════════════════════════════════════════════
            BMAD Quality Gates-Bericht
═══════════════════════════════════════════════════════

Projekt: claude-craft
Sprint: sprint-3 - Benutzerverwaltung
Generiert: 2026-01-29 10:00:00

Gate-Zusammenfassung:
══════════════════════════════════════════════════════
| Gate | Schwelle | Punktzahl | Status |
|------|----------|-----------|--------|
| PRD | 80% | 90% | ✅ BESTANDEN |
| Tech Spec | 90% | 92% | ✅ BESTANDEN |
| Backlog | 6/6 | 5.8/6 Durchschn. | ⚠️ WARNUNG |
| Sprint Ready | 100% | 100% | ✅ BESTANDEN |
| Story DoD | 100% | variabel | 📊 |

DoD-Status pro Story:
──────────────────────────────────────────────────────
| Story | Status | DoD-Punktzahl | Gate |
|-------|--------|---------------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Gesamtzustand: 🟢 Gut
──────────────────────────────────────────────────────
4/5 Gates bestanden
8/10 Stories auf Kurs
Keine kritischen Blocker

Empfehlungen:
──────────────────────────────────────────────────────
1. ⚠️ US-002 fehlen Story Points (INVEST: E)
   Ausfuehren: /project:update-story US-002 --points 3

2. ⚠️ US-012 benoetigt Code Review zur Fertigstellung
   PR erstellen und Review anfordern

Befehle:
  /gate:validate-prd       PRD-Gate erneut ausfuehren
  /gate:validate-backlog   Backlog-Gate erneut ausfuehren
  /gate:validate-story US-012  Spezifische Story pruefen
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:report
/gate:report --detailed
```
