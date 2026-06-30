---
description: "Backlog-Stories gegen INVEST-Kriterien validieren"
argument-hint: "[story-id] [--no-gate]"
---

# Backlog-Gate validieren

User Stories gegen die INVEST-Kriterien validieren.
Alle Stories müssen alle 6 INVEST-Kriterien erfüllen.

## Argumente

$ARGUMENTS (format: [story-id] [--no-gate])
- **story-id** (optional): Spezifische Story zur Validierung (z.B. US-001). Falls ausgelassen, werden alle Stories validiert.
- **--no-gate** (optional): Nur einfache INVEST-Validierung durchführen (Gate-Qualitätsprüfung, Bewertungsschwellen und Pass/Fail-Urteil überspringen). Nützlich für schnelle Überprüfungen während des Refinements ohne Blockierung durch Gate-Kriterien.

## INVEST-Kriterien

| Buchstabe | Kriterium | Beschreibung | Prüfungen |
|-----------|-----------|--------------|-----------|
| **I** | Independent (Unabhängig) | Kann eigenständig entwickelt werden | Keine blockierenden Abhängigkeiten |
| **N** | Negotiable (Verhandelbar) | Details können diskutiert werden | Hat Beschreibung, nicht überspezifiziert |
| **V** | Valuable (Wertvoll) | Liefert Nutzerwert | Hat Akzeptanzkriterien, Benefit-Statement |
| **E** | Estimable (Schätzbar) | Kann geschätzt werden | Hat Story Points |
| **S** | Small (Klein genug) | Passt in einen Sprint | ≤ 8 Story Points |
| **T** | Testable (Testbar) | Kann getestet werden | Hat Akzeptanzkriterien |

**Schwelle: 6/6 für jede Story**

## Prozess

### Schritt 1: Stories laden

1. `.bmad/sprint-status.yaml` lesen
2. Spezifische Story oder alle Stories abrufen
3. Story-Details laden

### Schritt 2: INVEST für jede Story validieren

Für jedes Kriterium:
- **Unabhängig**: Prüfen, ob `blocked_by` leer ist
- **Verhandelbar**: Beschreibungslänge und Aufgabenanzahl prüfen
- **Wertvoll**: Prüfen, ob Akzeptanzkriterien vorhanden sind
- **Schätzbar**: Prüfen, ob Story Points > 0
- **Klein genug**: Prüfen, ob Story Points ≤ 8
- **Testbar**: Prüfen, ob Anzahl der Akzeptanzkriterien > 0

### Schritt 3: Punkte berechnen

INVEST-Punktzahl pro Story (0-6)

### Schritt 4: Bericht generieren

Einzel- und Gesamtergebnisse anzeigen.

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
   [I] ✓ Independent - Keine Abhängigkeiten
   [N] ✓ Negotiable - Klare Beschreibung
   [V] ✓ Valuable - 3 Akzeptanzkriterien
   [E] ✓ Estimable - 5 Story Points
   [S] ✓ Small - 5 ≤ 8 Punkte
   [T] ✓ Testable - Gherkin-AC definiert
   Punktzahl: 6/6 ✅

✅ US-002: Benutzerregistrierung
   Punktzahl: 6/6 ✅

Zusammenfassung:
──────────────────────────────────────────────────────
Validierte Stories: 8
Bestanden (6/6): 8
Warnungen (4-5/6): 0
Fehlgeschlagen (<4/6): 0

✅ BACKLOG-GATE BESTANDEN

Alle Stories erfüllen die INVEST-Kriterien.
Bereit für Sprint-Planung.
═══════════════════════════════════════════════════════
```

### Fehlgeschlagene Stories

```
═══════════════════════════════════════════════════════
          INVEST Backlog-Gate-Validierung
═══════════════════════════════════════════════════════

Validierung von 8 Stories...

Ergebnisse:
──────────────────────────────────────────────────────
✅ US-001: Benutzeranmeldung
   Punktzahl: 6/6 ✅

⚠️ US-002: Benutzerregistrierung
   [I] ✓ Independent
   [N] ✓ Negotiable
   [V] ✓ Valuable
   [E] ✗ Estimable - Keine Story Points
   [S] ? Small - Ohne Punkte nicht prüfbar
   [T] ✓ Testable
   Punktzahl: 4/6 ⚠️

❌ US-003: Komplette Auth-System-Überarbeitung
   [I] ✗ Independent - Blockiert durch US-001, US-002
   [N] ✗ Negotiable - 15 Aufgaben (zu spezifiziert)
   [V] ✓ Valuable
   [E] ✓ Estimable - 13 Punkte
   [S] ✗ Small - 13 > 8 Punkte
   [T] ✓ Testable
   Punktzahl: 3/6 ❌

Zusammenfassung:
──────────────────────────────────────────────────────
Validierte Stories: 8
Bestanden (6/6): 6
Warnungen (4-5/6): 1
Fehlgeschlagen (<4/6): 1

❌ BACKLOG-GATE FEHLGESCHLAGEN

Erforderliche Maßnahmen:
──────────────────────────────────────────────────────
US-002:
  → Story-Point-Schätzung hinzufügen
  → Ausführen: /project:update-story US-002 --points 3

US-003:
  → In kleinere Stories aufteilen (≤8 Punkte jeweils)
  → Unnötige Aufgabendetails entfernen
  → Abhängigkeiten auflösen oder neu ordnen
  → Ggf.: /project:split-story US-003

Nach Korrekturen erneut ausführen: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

### Einzelne Story validieren

```
═══════════════════════════════════════════════════════
          INVEST-Validierung: US-005
═══════════════════════════════════════════════════════

📖 US-005: E-Mail-Verifizierung

INVEST-Analyse:
──────────────────────────────────────────────────────
[I] ✓ Independent
    Keine blockierenden Abhängigkeiten

[N] ✓ Negotiable
    Beschreibung: 45 Wörter
    Aufgaben: 4 (angemessen)

[V] ✓ Valuable
    "Als Benutzer möchte ich meine E-Mail verifizieren
     um mein Konto zu sichern"
    Akzeptanzkriterien: 3

[E] ✓ Estimable
    Story Points: 3

[S] ✓ Small
    3 Punkte ≤ 8 Punkte

[T] ✓ Testable
    3 Gherkin-Szenarien definiert

Punktzahl: 6/6 ✅
──────────────────────────────────────────────────────

✅ Story erfüllt INVEST-Kriterien

Status: ready-for-dev
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Häufige Probleme beheben

### Story zu groß (S)
```
/project:split-story US-003
```

### Fehlende Story Points (E)
```
/project:update-story US-002 --points 3
```

### Fehlende Akzeptanzkriterien (V, T)
```
/project:add-ac US-002 "Given... When... Then..."
```

Gate-Konfiguration: `.bmad/gates/backlog-gate.yaml`

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
