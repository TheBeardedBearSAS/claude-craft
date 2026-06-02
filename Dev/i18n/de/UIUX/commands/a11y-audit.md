---
description: WCAG 2.2 AAA Barrierefreiheit-Audit
argument-hint: [arguments]
---

# WCAG 2.2 AAA Barrierefreiheit-Audit

Sie sind ein zertifizierter Barrierefreiheits-Experte. Sie müssen ein vollständiges Barrierefreiheits-Audit gemäß den WCAG 2.2 Level AAA-Kriterien durchführen.

## Argumente
$ARGUMENTS

Argumente:
- Pfad zur zu auditierenden Seite/Komponente
- (Optional) Stufe: AA oder AAA (Standard: AAA)
- (Optional) Fokus: all, keyboard, contrast, aria

Beispiel: `/uiux:a11y-audit src/pages/Home.tsx AAA` oder `/uiux:a11y-audit src/components/Modal.tsx AA keyboard`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

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
| Barrierefreiheit | /100 | 100 | ✅/❌ |
| Best Practices | /100 | 100 | ✅/❌ |
| SEO | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Stufe | Kriterien | Konform | Nicht konform |
|-------|-----------|---------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ WAHRNEHMBAR
──────────────────────────────────────────────────────────────

### 1.1 Textalternativen

#### 1.1.1 Nicht-Textinhalt (A)
| Element | Alt-Text | Status | Aktion |
|---------|----------|--------|--------|
| img.logo | "Logo {name}" | ✅ | - |
| img.hero | "" (fehlt) | ❌ | Beschreibenden Alt-Text hinzufügen |
| img.icon | aria-hidden="true" | ✅ | - |

### 1.3 Anpassbar

#### 1.3.1 Informationen und Beziehungen (A)
| Prüfung | Status | Detail |
|---------|--------|--------|
| Überschriftenstruktur | ✅/❌ | h1 → h2 → h3 sequenziell |
| ARIA-Landmarks | ✅/❌ | header, nav, main, footer |
| Semantische Listen | ✅/❌ | ul/ol/dl angemessen |
| Tabellen | ✅/❌ | th, scope, caption |
| Formulare | ✅/❌ | label + fieldset/legend |

### 1.4 Unterscheidbar

#### 1.4.3 Kontrast (Minimum) (AA) / 1.4.6 Kontrast (Verbessert) (AAA)
| Element | Farben | Verhältnis | Erforderlich | Status |
|---------|--------|------------|--------------|--------|
| Fließtext | #333 / #fff | 12,6:1 | 7:1 | ✅ |
| Gedämpfter Text | #666 / #fff | 5,7:1 | 7:1 | ❌ |
| Primärer Button | #fff / #3B82F6 | 4,5:1 | 4,5:1 | ✅ |
| Platzhalter | #9CA3AF / #fff | 2,9:1 | 4,5:1 | ❌ |

#### 1.4.10 Umfluss (AA)
| Test | Status | Problem |
|------|--------|---------|
| 320px Breite | ✅/❌ | {horizontales Scrollen?} |
| 400% Zoom | ✅/❌ | {Inhalt abgeschnitten?} |

#### 1.4.11 Kontrast bei Nicht-Text-Inhalt (AA)
| UI-Element | Verhältnis | Status |
|------------|------------|--------|
| Eingabe-Rahmen | 3:1 | ✅/❌ |
| Button-Rahmen | 3:1 | ✅/❌ |
| Aktions-Icon | 3:1 | ✅/❌ |
| Fokusring | 3:1 | ✅/❌ |

──────────────────────────────────────────────────────────────
2️⃣ BEDIENBAR
──────────────────────────────────────────────────────────────

### 2.1 Tastaturbedienbar

#### 2.1.1 Tastatur (A) / 2.1.3 Tastatur (keine Ausnahme) (AAA)
| Element | Tab | Enter | Escape | Pfeiltasten | Status |
|---------|-----|-------|--------|-------------|--------|
| Links | ✅ | ✅ | - | - | ✅ |
| Buttons | ✅ | ✅ | - | - | ✅ |
| Eingaben | ✅ | ✅ | - | - | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modal | ✅ | ✅ | ✅ | - | ✅ |
| Benutzerdefiniertes div | ❌ | ❌ | - | - | ❌ |

#### 2.1.2 Keine Tastaturfalle (A)
| Zone | Eintritt | Austritt | Status |
|------|----------|---------|--------|
| Modal | Fokus-Trap OK | Escape OK | ✅ |
| Dropdown | Tab OK | Tab/Escape OK | ✅ |
| Seitenleiste | Tab OK | Tab OK | ✅ |

### 2.4 Navigierbar

#### 2.4.1 Blöcke überspringen (A)
| Skip-Link | Ziel | Status |
|-----------|------|--------|
| "Zum Inhalt springen" | #main-content | ✅/❌ |
| "Zur Navigation springen" | #nav | ✅/❌ |

#### 2.4.3 Fokus-Reihenfolge (A)
| Reihenfolge | Erwartet | Tatsächlich | Status |
|-------------|----------|-------------|--------|
| 1 | Skip-Link | Skip-Link | ✅ |
| 2 | Logo | Logo | ✅ |
| 3 | Navigationselement 1 | Navigationselement 1 | ✅ |
| ... | ... | ... | ... |

#### 2.4.7 Fokus sichtbar (AA) / 2.4.11 Fokus (Verbessert) (AA)
| Element | Umriss | Versatz | Verhältnis | Status |
|---------|--------|---------|------------|--------|
| Links | 2px solid | 2px | 3:1 | ✅ |
| Buttons | 2px solid | 2px | 3:1 | ✅ |
| Eingaben | 2px solid | 0 | 3:1 | ✅ |
| Karten | ❌ | - | - | ❌ |

#### 2.5.5 Zielgröße (AAA)
| Element | Größe | Min. erforderlich | Status |
|---------|-------|-------------------|--------|
| Buttons | 44×40px | 44×44px | ❌ |
| Menü-Links | 120×48px | 44×44px | ✅ |
| Icon-Buttons | 32×32px | 44×44px | ❌ |
| Checkboxen | 24×24px | 44×44px | ❌ |

──────────────────────────────────────────────────────────────
3️⃣ VERSTÄNDLICH
──────────────────────────────────────────────────────────────

### 3.1 Lesbar

#### 3.1.1 Sprache der Seite (A)
```html
<html lang="de"> <!-- ✅ Vorhanden -->
```

#### 3.1.2 Sprache von Teilen (AA)
| Element | Sprache | lang-Attribut | Status |
|---------|---------|---------------|--------|
| Fremdsprachiges Zitat | Englisch | ❌ | ❌ |
| Technischer Begriff | Englisch | ❌ | ⚠️ |

### 3.3 Eingabeunterstützung

#### 3.3.1 Fehlererkennung (A)
| Feld | Fehlermeldung | In Text | Status |
|------|---------------|---------|--------|
| E-Mail | "Ungültige E-Mail" | ✅ | ✅ |
| Passwort | Nur roter Rahmen | ❌ | ❌ |

#### 3.3.2 Beschriftungen oder Anweisungen (A)
| Eingabe | Label | Zuordnung | Status |
|---------|-------|-----------|--------|
| E-Mail | "E-Mail" | htmlFor OK | ✅ |
| Suche | ❌ | Kein Label | ❌ |
| Telefon | Nur Platzhalter | Kein Label | ❌ |

──────────────────────────────────────────────────────────────
4️⃣ ROBUST
──────────────────────────────────────────────────────────────

### 4.1.2 Name, Rolle, Wert (A)
| Komponente | role | aria-* | Status |
|------------|------|--------|--------|
| Modal | dialog | aria-modal, aria-labelledby | ✅ |
| Dropdown | listbox | aria-expanded, aria-activedescendant | ✅ |
| Tabs | tablist/tab | aria-selected, aria-controls | ❌ |
| Accordion | - | aria-expanded | ❌ |

### 4.1.3 Statusmeldungen (AA)
| Meldung | aria-live | aria-atomic | Status |
|---------|-----------|-------------|--------|
| Toast Erfolg | polite | true | ✅ |
| Toast Fehler | assertive | true | ✅ |
| Laden | polite | false | ❌ |
| Formularfehler | assertive | - | ❌ |

──────────────────────────────────────────────────────────────
❌ KRITISCHE VERSTÖSSE (Blockierend)
──────────────────────────────────────────────────────────────

| # | Kriterium | Element | Beschreibung | Behebung |
|---|-----------|---------|--------------|----------|
| 1 | 1.4.6 | .text-muted | Kontrast 5,7:1 < 7:1 | color: #595959 |
| 2 | 2.5.5 | .btn-icon | Größe 32px < 44px | min-width: 44px |
| 3 | 3.3.2 | input[type="search"] | Kein Label | Label hinzufügen |

──────────────────────────────────────────────────────────────
⚠️ SCHWERWIEGENDE VERSTÖSSE
──────────────────────────────────────────────────────────────

| # | Kriterium | Element | Beschreibung | Behebung |
|---|-----------|---------|--------------|----------|
| 4 | 2.1.1 | .card-clickable | div nicht fokussierbar | Button verwenden |
| 5 | 4.1.2 | .tabs | Falsches ARIA | role="tablist" hinzufügen |

──────────────────────────────────────────────────────────────
ℹ️ GERINGFÜGIGE VERSTÖSSE
──────────────────────────────────────────────────────────────

| # | Kriterium | Element | Beschreibung | Behebung |
|---|-----------|---------|--------------|----------|
| 6 | 3.1.2 | blockquote | Englischer Text ohne lang | lang="en" |

──────────────────────────────────────────────────────────────
✅ BEMERKENSWERTE KONFORME PUNKTE
──────────────────────────────────────────────────────────────

- Korrekte semantische Struktur (Überschriften, Landmarks)
- Skip-Link vorhanden und funktional
- Korrekter Fokus-Trap bei Modals
- Klare Text-Fehlermeldungen

──────────────────────────────────────────────────────────────
🎯 BEHEBUNGSPLAN
──────────────────────────────────────────────────────────────

### Priorität 1 - Kritisch (diese Woche)
1. [ ] .text-muted Kontrast beheben → #595959
2. [ ] Touch-Ziele auf mindestens 44px vergrößern
3. [ ] Labels zu Eingaben ohne Label hinzufügen

### Priorität 2 - Schwerwiegend (diesen Sprint)
4. [ ] Klickbare Divs durch Button ersetzen
5. [ ] ARIA bei Tabs-Komponente korrigieren
6. [ ] aria-live bei Ladezuständen hinzufügen

### Priorität 3 - Geringfügig (Backlog)
7. [ ] lang="en" bei englischsprachigem Text hinzufügen
```

### Schritt 3: Screenreader-Test

- VoiceOver (macOS): vollständige Navigation
- NVDA (Windows): Ankündigungsüberprüfung
- TalkBack (Android): falls mobile App

### Schritt 4: Nur-Tastatur-Test

Die gesamte Oberfläche nur mit der Tastatur navigieren.
