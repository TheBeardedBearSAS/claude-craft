---
description: Backlog-Stories gegen INVEST-Kriterien validieren
argument-hint: [story-id]
---

# Backlog-Gate validieren

User Stories gegen die INVEST-Kriterien validieren.
Alle Stories muessen alle 6 INVEST-Kriterien erfuellen.

## Argumente

$ARGUMENTS (format: [story-id])
- **story-id** (optional): Spezifische Story zur Validierung (z.B. US-001). Falls ausgelassen, werden alle Stories validiert.

## INVEST-Kriterien

| Buchstabe | Kriterium | Beschreibung | Pruefungen |
|-----------|-----------|--------------|------------|
| **I** | Independent (Unabhaengig) | Kann eigenstaendig entwickelt werden | Keine blockierenden Abhaengigkeiten |
| **N** | Negotiable (Verhandelbar) | Details koennen diskutiert werden | Hat Beschreibung, nicht ueberspezifiziert |
| **V** | Valuable (Wertvoll) | Liefert Nutzerwert | Hat Akzeptanzkriterien |
| **E** | Estimable (Schaetzbar) | Kann geschaetzt werden | Hat Story Points |
| **S** | Small (Klein genug) | Passt in einen Sprint | ≤ 8 Story Points |
| **T** | Testable (Testbar) | Kann getestet werden | Hat Akzeptanzkriterien |

**Schwelle: 6/6 fuer jede Story**

## Ausgabeformat

### Alle Stories bestehen

```
═══════════════════════════════════════════════════════
          INVEST Backlog-Gate-Validierung
═══════════════════════════════════════════════════════

Validierung von 8 Stories...

Ergebnisse:
──────────────────────────────────────────────────────
✅ US-001: Benutzeranmeldung
   [I] ✓ Independent - Keine Abhaengigkeiten
   [N] ✓ Negotiable - Klare Beschreibung
   [V] ✓ Valuable - 3 Akzeptanzkriterien
   [E] ✓ Estimable - 5 Story Points
   [S] ✓ Small - 5 ≤ 8 Punkte
   [T] ✓ Testable - Gherkin-AC definiert
   Punktzahl: 6/6 ✅

Zusammenfassung:
──────────────────────────────────────────────────────
Validierte Stories: 8
Bestanden (6/6): 8
Warnungen (4-5/6): 0
Fehlgeschlagen (<4/6): 0

✅ BACKLOG-GATE BESTANDEN
═══════════════════════════════════════════════════════
```

### Fehlgeschlagene Stories

```
═══════════════════════════════════════════════════════
          INVEST Backlog-Gate-Validierung
═══════════════════════════════════════════════════════

⚠️ US-002: Benutzerregistrierung
   Punktzahl: 4/6 ⚠️
   Fehlend: [E] Estimable - Keine Story Points

❌ US-003: Komplette Auth-System-Ueberarbeitung
   Punktzahl: 3/6 ❌
   Fehlend: [I] Independent, [N] Negotiable, [S] Small

❌ BACKLOG-GATE FEHLGESCHLAGEN

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
US-002:
  → Story-Point-Schaetzung hinzufuegen
  → Ausfuehren: /project:update-story US-002 --points 3

US-003:
  → In kleinere Stories aufteilen (≤8 Punkte jeweils)
  → Ggf.: /project:split-story US-003

Nach Korrekturen erneut ausfuehren: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Wenn PASS (≥ Schwellenwert):                            ║
║  → /gate:validate-sprint                                 ║
║    Sprint-Bereitschaft validieren                        ║
║                                                          ║
║  Wenn FAIL (< Schwellenwert):                            ║
║  → Identifizierte Probleme beheben                       ║
║  → /gate:validate-backlog (erneut nach Korrekturen)      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
