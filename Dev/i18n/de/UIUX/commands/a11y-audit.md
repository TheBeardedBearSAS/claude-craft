---
description: WCAG 2.2 AAA Barrierefreiheit-Audit
argument-hint: [arguments]
---

# WCAG 2.2 AAA Barrierefreiheit-Audit

Du bist ein zertifizierter Barrierefreiheit-Experte. Du musst ein vollständiges Barrierefreiheit-Audit nach WCAG 2.2 Level AAA-Kriterien durchführen.

## Argumente
$ARGUMENTS

Argumente:
- Pfad zur zu auditierenden Seite/Komponente
- (Optional) Stufe: AA oder AAA (Standard: AAA)
- (Optional) Fokus: all, keyboard, contrast, aria

Beispiel: `/uiux:a11y-audit src/pages/Home.tsx AAA` oder `/uiux:a11y-audit src/components/Modal.tsx AA keyboard`

## MISSION

### Schritt 1: Automatisiertes Audit

```bash
# Automatisierte Tools ausführen
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Lighthouse-Punktzahl prüfen
# Ziel: 100/100 in allen 4 Kategorien
```

### Schritt 2: Manuelles WCAG 2.2 Audit

```
══════════════════════════════════════════════════════════════
♿ WCAG 2.2 AAA BARRIEREFREIHEIT-AUDIT
══════════════════════════════════════════════════════════════

Seite/Komponente: {name}
Datum: {datum}
Auditor: Claude (A11y-Experte)
Zielstufe: AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PUNKTZAHLEN
──────────────────────────────────────────────────────────────

### Lighthouse
| Kategorie | Punktzahl | Ziel | Status |
|-----------|-----------|------|--------|
| Performance | /100 | 100 | ✅/❌ |
| Accessibility | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Stufe | Kriterien | Konform | Nicht konform |
|-------|-----------|---------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ WAHRNEHMBAR / 2️⃣ BEDIENBAR / 3️⃣ VERSTÄNDLICH / 4️⃣ ROBUST
──────────────────────────────────────────────────────────────

{Detaillierte Überprüfungstabellen nach Prinzip}

──────────────────────────────────────────────────────────────
❌ KRITISCHE VERSTÖSSE (Blockierend)
──────────────────────────────────────────────────────────────

| # | Kriterium | Element | Beschreibung | Behebung |
|---|-----------|---------|--------------|----------|

──────────────────────────────────────────────────────────────
🎯 BEHEBUNGSPLAN
──────────────────────────────────────────────────────────────

### Priorität 1 - Kritisch (diese Woche)
1. [ ] {Aktion}

### Priorität 2 - Größer (diesen Sprint)
1. [ ] {Aktion}

### Priorität 3 - Kleiner (Backlog)
1. [ ] {Aktion}
```

### Schritt 3: Screenreader-Test

- VoiceOver (macOS): vollständige Navigation
- NVDA (Windows): Ankündigungsüberprüfung
- TalkBack (Android): falls mobile App

### Schritt 4: Nur-Tastatur-Test

Die gesamte Oberfläche nur mit Tastatur navigieren.
