---
description: Komponenten-Barrierefreiheit-Spezifikation
argument-hint: [arguments]
---

# Komponenten-Barrierefreiheit-Spezifikation

Du bist ein zertifizierter Barrierefreiheit-Experte. Du musst vollständige Barrierefreiheit-Spezifikationen für eine UI-Komponente erstellen.

## Argumente
$ARGUMENTS

Argumente:
- Komponentenname
- (Optional) Typ: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Beispiel: `/uiux:a11y-component Modal` oder `/uiux:a11y-component "Datumsauswahl" typ:input`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: ARIA-Pattern identifizieren

Die ARIA Authoring Practices Guide (APG) für das entsprechende Pattern konsultieren.

### Schritt 2: Spezifikation erstellen

```
══════════════════════════════════════════════════════════════
♿ BARRIEREFREIHEIT-SPEZIFIKATION: {KOMPONENTEN_NAME}
══════════════════════════════════════════════════════════════

Typ: {Button | Input | Dialog | Listbox | Tabs | ...}
APG-Pattern: {Link zum offiziellen Pattern}
Datum: {datum}

──────────────────────────────────────────────────────────────
📋 HTML-SEMANTIK
──────────────────────────────────────────────────────────────

### Empfohlenes natives Element
```html
<!-- Immer natives Element bevorzugen -->
<{element} ...>
  {Inhalt}
</{element}>
```

### Vollständige Struktur
```html
<!-- Vollständiges Beispiel mit ARIA -->
<div
  role="{role}"
  aria-{attribut}="{wert}"
  tabindex="0"
>
  <span id="{id}-label">{Label}</span>
  {Inhalt}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ARIA-ATTRIBUTE
──────────────────────────────────────────────────────────────

### Erforderliche Attribute
| Attribut | Wert | Wann | Beschreibung |
|----------|------|------|--------------|
| role | {role} | Immer (falls custom) | Definiert den Typ |
| aria-label | "{text}" | Falls kein sichtbares Label | Barrierefreies Label |

### Bedingte Attribute
| Attribut | Wert | Wann | Beschreibung |
|----------|------|------|--------------|
| aria-expanded | "true"/"false" | Falls erweiterbar | Offen/geschlossen |
| aria-disabled | "true" | Falls deaktiviert | Deaktiviert |

──────────────────────────────────────────────────────────────
⌨️ TASTATURNAVIGATION
──────────────────────────────────────────────────────────────

| Taste | Aktion | Detail |
|-------|--------|--------|
| Tab | Fokus auf Komponente | Betritt Komponente |
| Enter | Aktivieren | Primäre Aktion |
| Space | Aktivieren (Toggle) | Für Toggle-Buttons |
| Escape | Schließen/Abbrechen | Falls Popup/Modal |
| Pfeile | Interne Navigation | In Listen |

──────────────────────────────────────────────────────────────
🔊 SCREENREADER-ANKÜNDIGUNGEN
──────────────────────────────────────────────────────────────

### Bei Eintritt (Fokus)
```
"{Label}, {Rolle}, {Zustand}"
Beispiele:
- "Absenden, Button"
- "Hauptmenü, Menü, eingeklappt"
```

### Während Interaktion
| Aktion | Ankündigung |
|--------|-------------|
| Erweiterung | "erweitert" / "eingeklappt" |
| Fehler | "Fehler: {Nachricht}" |

──────────────────────────────────────────────────────────────
📐 TOUCH-ZIELE (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

| Kriterium | Wert | Status |
|-----------|------|--------|
| Mindestgröße | 44 × 44 CSS Pixel | ✅/❌ |
| Abstand zwischen Zielen | ≥ 8px | ✅/❌ |

──────────────────────────────────────────────────────────────
✅ VALIDIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### Semantik
- [ ] Natives HTML-Element verwendet falls möglich
- [ ] Korrekte ARIA-Rolle falls custom
- [ ] Logische DOM-Struktur

### ARIA
- [ ] Erforderliche Attribute vorhanden
- [ ] Keine ARIA-Überladung (nativ > ARIA)

### Tastatur
- [ ] Fokussierbar (passender tabindex)
- [ ] Alle Aktionen per Tastatur
- [ ] Keine Tastaturfalle
- [ ] Konformer sichtbarer Fokus

### Kontrast
- [ ] Text ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
```
