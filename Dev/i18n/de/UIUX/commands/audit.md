---
description: Vollständiges UI/UX/Barrierefreiheit-Audit
argument-hint: [arguments]
---

# Vollständiges UI/UX/Barrierefreiheit-Audit

Du bist der UI/UX Orchestrator. Du musst ein vollständiges Schnittstellenaudit durchführen, indem du sequenziell die 3 Experten einbeziehst: Barrierefreiheit, UX/Ergonomie, dann UI-Design.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) URL oder Pfad zur zu auditierenden Seite/Komponente
- (Optional) WCAG-Stufe: AA oder AAA (Standard: AAA)

Beispiel: `/uiux:audit src/pages/Dashboard.tsx AAA`

## MISSION

### Schritt 1: Barrierefreiheit-Audit (A11y-Experte)

#### 1.1 Automatisiertes Audit
```bash
# Ausführen falls verfügbar
npx axe-cli {URL}
npx pa11y {URL}
# Oder Lighthouse prüfen
```

#### 1.2 Manuelle WCAG 2.2 AAA Überprüfung

**Wahrnehmbar**
- [ ] Bilder mit Alt-Text
- [ ] Semantische Struktur (h1-h6, Landmarks)
- [ ] Kontrast ≥ 7:1 (AAA)
- [ ] Reflow bei 320px

**Bedienbar**
- [ ] Vollständige Tastaturnavigation
- [ ] Keine Tastaturfalle
- [ ] Sichtbarer Fokus (≥ 2px)
- [ ] Touch-Ziele ≥ 44px

**Verständlich**
- [ ] lang auf html
- [ ] Labels auf Inputs
- [ ] Klare Fehlermeldungen

**Robust**
- [ ] Korrektes ARIA
- [ ] aria-live für Dynamisches

### Schritt 2: UX/Ergonomie-Audit (UX-Experte)

#### 2.1 Nielsen-Heuristiken

| Heuristik | Bewertung (1-5) | Beobachtungen |
|-----------|-----------------|---------------|
| Sichtbarkeit des Systemstatus | | |
| Übereinstimmung mit der Realität | | |
| Benutzerkontrolle | | |
| Konsistenz | | |
| Fehlervermeidung | | |
| Erkennung vs. Erinnerung | | |
| Flexibilität | | |
| Minimalismus | | |
| Fehlerbehebung | | |
| Hilfe | | |

#### 2.2 Journey-Analyse

- Friktionspunkte identifiziert
- Kognitive Last bewertet
- Interaktionsmuster konsistent?

### Schritt 3: UI-Design-Audit (UI-Experte)

#### 3.1 Design System

- Tokens konsistent?
- Zustände vollständig?
- Responsive korrekt?

#### 3.2 Visuelle Konsistenz

- Einheitliche Typografie?
- Systematische Abstände?
- Konsistente Ikonografie?

### Schritt 4: Synthese und Priorisierung

```
══════════════════════════════════════════════════════════════
🎨 UI/UX/A11Y AUDIT-BERICHT
══════════════════════════════════════════════════════════════

Seite/Komponente: {name}
Datum: {datum}
Zielstufe: WCAG 2.2 AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 GESAMTPUNKTZAHLEN
──────────────────────────────────────────────────────────────

| Bereich | Punktzahl | Status |
|---------|-----------|--------|
| Barrierefreiheit | /100 | ✅/❌ |
| UX/Ergonomie | /100 | ✅/❌ |
| UI-Design | /100 | ✅/❌ |
| **Gesamt** | **/100** | |

Lighthouse:
| Performance | Accessibility | Best Practices | SEO |
|-------------|---------------|----------------|-----|
| /100 | /100 | /100 | /100 |

──────────────────────────────────────────────────────────────
❌ KRITISCHE PROBLEME (Blockierend)
──────────────────────────────────────────────────────────────

### A11y
| # | WCAG-Kriterium | Beschreibung | Behebung |
|---|----------------|--------------|----------|

### UX
| # | Heuristik | Beschreibung | Behebung |
|---|-----------|--------------|----------|

### UI
| # | Aspekt | Beschreibung | Behebung |
|---|--------|--------------|----------|

──────────────────────────────────────────────────────────────
⚠️ GRÖSSERE PROBLEME (Wichtig)
──────────────────────────────────────────────────────────────

{Ähnliche Tabelle}

──────────────────────────────────────────────────────────────
ℹ️ VORGESCHLAGENE VERBESSERUNGEN
──────────────────────────────────────────────────────────────

{Ähnliche Tabelle}

──────────────────────────────────────────────────────────────
✅ POSITIVE PUNKTE
──────────────────────────────────────────────────────────────

- {gute Praxis 1}
- {gute Praxis 2}

──────────────────────────────────────────────────────────────
🎯 PRIORISIERTER AKTIONSPLAN
──────────────────────────────────────────────────────────────

### Priorität 1 - Kritisch (sofort)
1. [ ] {Aktion}
2. [ ] {Aktion}

### Priorität 2 - Größer (diese Woche)
1. [ ] {Aktion}
2. [ ] {Aktion}

### Priorität 3 - Verbesserungen (Backlog)
1. [ ] {Aktion}
2. [ ] {Aktion}

──────────────────────────────────────────────────────────────
📋 GETROFFENE ARBITRIERUNGEN
──────────────────────────────────────────────────────────────

Bei Konflikten zwischen Empfehlungen:
1. Barrierefreiheit AAA (nicht verhandelbar)
2. Lighthouse 100/100
3. UX vor UI
4. Mobile-first
5. Design System Konsistenz
```

## Arbitrierungsregeln

| Priorität | Regel |
|-----------|-------|
| 1 | Barrierefreiheit AAA nicht verhandelbar |
| 2 | Lighthouse 100/100 obligatorisch |
| 3 | UX > Ästhetik |
| 4 | Mobile-first |
| 5 | Design System Konsistenz |
