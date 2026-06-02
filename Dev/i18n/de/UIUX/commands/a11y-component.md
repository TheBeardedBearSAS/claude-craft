---
description: Barrierefreiheits-Spezifikation für Komponenten
argument-hint: [arguments]
---

# Barrierefreiheits-Spezifikation für Komponenten

Sie sind ein zertifizierter Barrierefreiheitsexperte. Sie müssen vollständige Barrierefreiheitsspezifikationen für eine UI-Komponente erstellen.

## Argumente
$ARGUMENTS

Argumente:
- Komponentenname
- (Optional) Typ: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Beispiel: `/uiux:a11y-component Modal` oder `/uiux:a11y-component "Datumsauswahl" type:input`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Bevor Claude mit der Ausführung beginnt, aktiviert es den Plan-Modus, um den betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## AUFTRAG

### Schritt 1: ARIA-Muster identifizieren

Konsultieren Sie den ARIA Authoring Practices Guide (APG) für das entsprechende Muster.

### Schritt 2: Spezifikation erstellen

```
══════════════════════════════════════════════════════════════
♿ BARRIEREFREIHEITSSPEZIFIKATION: {KOMPONENTENNAME}
══════════════════════════════════════════════════════════════

Typ: {Button | Input | Dialog | Listbox | Tabs | ...}
APG-Muster: {Link zum offiziellen Muster}
Datum: {date}

──────────────────────────────────────────────────────────────
📋 HTML-SEMANTIK
──────────────────────────────────────────────────────────────

### Empfohlenes natives Element

```html
<!-- Immer das native Element bevorzugen -->
<{element} ...>
  {Inhalt}
</{element}>
```

### Falls eine benutzerdefinierte Komponente erforderlich ist

```html
<div role="{role}" ...>
  {Inhalt}
</div>
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
  <div id="{id}-description">{Beschreibung}</div>
  {Inhalt}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ARIA-ATTRIBUTE
──────────────────────────────────────────────────────────────

### Erforderliche Attribute

| Attribut | Wert | Wann | Beschreibung |
|----------|------|------|--------------|
| role | {role} | Immer (falls benutzerdefiniert) | Definiert den Typ |
| aria-label | "{text}" | Falls kein sichtbares Label | Barrierefreies Label |
| aria-labelledby | "{id}" | Falls sichtbares Label | Verweis auf Label |

### Bedingte Attribute

| Attribut | Wert | Wann | Beschreibung |
|----------|------|------|--------------|
| aria-describedby | "{id}" | Falls Beschreibung vorhanden | Verweis auf Beschreibung |
| aria-expanded | "true"/"false" | Falls erweiterbar | Geöffnet/geschlossen-Zustand |
| aria-controls | "{id}" | Falls anderes Element gesteuert wird | ID des gesteuerten Elements |
| aria-owns | "{id}" | Falls separates DOM | Eltern-Kind-Beziehung |
| aria-haspopup | "dialog"/"menu"/"listbox" | Falls Popup vorhanden | Popup-Typ |
| aria-pressed | "true"/"false" | Falls Umschalter | Gedrückt-Zustand |
| aria-selected | "true"/"false" | Falls Auswahl | Ausgewählt-Zustand |
| aria-checked | "true"/"false"/"mixed" | Falls Kontrollkästchen | Aktiviert-Zustand |
| aria-disabled | "true" | Falls deaktiviert | Deaktiviert-Zustand |
| aria-invalid | "true" | Falls Fehler | Ungültig-Zustand |
| aria-required | "true" | Falls Pflichtfeld | Pflichtfeld |
| aria-busy | "true" | Falls Laden | In Bearbeitung |
| aria-live | "polite"/"assertive" | Falls dynamisch | Änderung ankündigen |
| aria-atomic | "true" | Mit aria-live | Alles ankündigen |

### Zustände nach Interaktion

| Zustand | ARIA-Attribute |
|---------|----------------|
| Standard | {Basisattribute} |
| Hover | Keine ARIA-Änderung |
| Fokus | Keine ARIA-Änderung |
| Erweitert | aria-expanded="true" |
| Eingeklappt | aria-expanded="false" |
| Ausgewählt | aria-selected="true" |
| Deaktiviert | aria-disabled="true" |
| Wird geladen | aria-busy="true" |
| Fehler | aria-invalid="true", aria-errormessage="{id}" |

──────────────────────────────────────────────────────────────
⌨️ TASTATURNAVIGATION
──────────────────────────────────────────────────────────────

### Haupttasten

| Taste | Aktion | Detail |
|-------|--------|--------|
| Tab | Fokus auf Komponente | Betritt die Komponente |
| Shift+Tab | Vorheriger Fokus | Verlässt die Komponente |
| Enter | Aktivieren | Primäre Aktion |
| Space | Aktivieren (Umschalten) | Für Umschalter-Schaltflächen |
| Escape | Schließen/Abbrechen | Falls Popup/Modal |
| ↑ Pfeil oben | Vorheriges Element | Listennavigation |
| ↓ Pfeil unten | Nächstes Element | Listennavigation |
| ← Pfeil links | Vorheriges Element (horizontal) | Reiter, Schieberegler |
| → Pfeil rechts | Nächstes Element (horizontal) | Reiter, Schieberegler |
| Home | Erstes Element | Schnellnavigation |
| End | Letztes Element | Schnellnavigation |

### Fokusverwaltung

| Situation | Verhalten |
|-----------|-----------|
| Öffnen | Fokus auf {erstes fokussierbares Element} |
| Schließen | Fokus kehrt zu {auslösendes Element} zurück |
| Interne Navigation | Wandernder tabindex ODER aria-activedescendant |
| Fokus-Trap | {Ja bei Modal / Nein bei Dropdown} |

### Wandernder tabindex (falls zutreffend)

```html
<!-- Immer nur ein fokussierbares Element gleichzeitig -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Reiter 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Reiter 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Reiter 3</button>
</div>
```

──────────────────────────────────────────────────────────────
🎯 SICHTBARER FOKUS
──────────────────────────────────────────────────────────────

### Erforderlicher Stil (WCAG 2.4.11 AAA)

```css
.{komponente}:focus-visible {
  /* Sichtbare Umrandung */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;

  /* Kontrastverhältnis ≥ 3:1 */
  /* Fokusfläche ≥ sichtbarer Umfang */
}

/* Zurücksetzen bei Mausbedienung */
.{komponente}:focus:not(:focus-visible) {
  outline: none;
}
```

### Überprüfungen

| Kriterium | Wert | Status |
|-----------|------|--------|
| Umrandungsdicke | ≥ 2px | ✅ |
| Umrandungskontrast | ≥ 3:1 | ✅ |
| Sichtbare Fläche | ≥ Umfang | ✅ |
| Sichtbar auf allen Hintergründen | Ja | ✅ |

──────────────────────────────────────────────────────────────
🔊 SCREENREADER-ANKÜNDIGUNGEN
──────────────────────────────────────────────────────────────

### Beim Eintreten (Fokus)

```
"{Label}, {Rolle}, {Zustand}"

Beispiele:
- "Absenden, Schaltfläche"
- "Hauptmenü, Menü, eingeklappt"
- "Name, Textfeld, Pflichtfeld"
- "Newsletter, Kontrollkästchen, nicht aktiviert"
```

### Während der Interaktion

| Aktion | Ankündigung |
|--------|-------------|
| Erweiterung | "erweitert" / "eingeklappt" |
| Auswahl | "ausgewählt" |
| Umschalten | "ein" / "aus" |
| Laden | "Wird geladen" |
| Erfolg | "{Erfolgsmeldung}" |
| Fehler | "Fehler: {Meldung}" |

### Dynamischer Inhalt (aria-live)

```html
<!-- Höfliche Benachrichtigungen (nicht dringend) -->
<div aria-live="polite" aria-atomic="true">
  {Toast-Nachricht}
</div>

<!-- Dringende Benachrichtigungen (Fehler) -->
<div aria-live="assertive" aria-atomic="true">
  {Fehlermeldung}
</div>
```

──────────────────────────────────────────────────────────────
📏 KONTRAST (WCAG AAA)
──────────────────────────────────────────────────────────────

### Text

| Typ | Erforderliches Verhältnis | Überprüfung |
|-----|--------------------------|-------------|
| Normaler Text (< 18px) | ≥ 7:1 | {Farbe} / {Hintergrund} = {Verhältnis} |
| Großer Text (≥ 18px oder 14px fett) | ≥ 4.5:1 | {Farbe} / {Hintergrund} = {Verhältnis} |

### UI-Elemente

| Element | Erforderliches Verhältnis | Überprüfung |
|---------|--------------------------|-------------|
| Rahmen | ≥ 3:1 | {Farbe} / {Hintergrund} = {Verhältnis} |
| Symbole | ≥ 3:1 | {Farbe} / {Hintergrund} = {Verhältnis} |
| Fokusumrandung | ≥ 3:1 | {Farbe} / {Hintergrund} = {Verhältnis} |

### Zustände

| Zustand | Kontrastüberprüfung |
|---------|---------------------|
| Standard | ✅ {Verhältnis} |
| Hover | ✅ {Verhältnis} |
| Fokus | ✅ {Verhältnis} |
| Deaktiviert | ⚠️ Nicht erforderlich, aber empfohlen |

──────────────────────────────────────────────────────────────
📐 TOUCH-ZIELE (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

### Mindestabmessungen

| Kriterium | Wert | Status |
|-----------|------|--------|
| Mindestgröße | 44 × 44 CSS-Pixel | ✅/❌ |
| Abstand zwischen Zielen | ≥ 8px | ✅/❌ |

### Implementierung

```css
.{komponente} {
  min-width: 44px;
  min-height: 44px;
  /* ODER Innenabstand, um 44px zu erreichen */
  padding: 10px 16px; /* falls Texthöhe ~24px */
}

/* Symbol-Schaltflächen */
.{komponente}-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

──────────────────────────────────────────────────────────────
🧪 DURCHZUFÜHRENDE TESTS
──────────────────────────────────────────────────────────────

### Automatisiert

- [ ] axe DevTools: 0 Verstöße
- [ ] Lighthouse Barrierefreiheit: 100/100
- [ ] ESLint jsx-a11y: 0 Fehler

### Manuell

- [ ] Vollständige Tastaturnavigation
- [ ] Sichtbarer Fokus bei jedem Schritt
- [ ] Keine Tastaturfalle
- [ ] Logische Fokusreihenfolge

### Screenreader

- [ ] VoiceOver (macOS/iOS): korrekte Ankündigungen
- [ ] NVDA (Windows): Listen-/Tabellennavigation
- [ ] TalkBack (Android): falls mobil

### Randfälle

- [ ] 400 % Zoom: kein Inhaltsverlust
- [ ] Hochkontrastmodus: sichtbar
- [ ] Reduzierte Bewegung: Animationen berücksichtigt

──────────────────────────────────────────────────────────────
💻 IMPLEMENTIERUNGSBEISPIEL
──────────────────────────────────────────────────────────────

```tsx
// {Component}.tsx
import { forwardRef, useId } from 'react';

interface {Component}Props {
  label: string;
  description?: string;
  disabled?: boolean;
  // ...weitere Props
}

export const {Component} = forwardRef<HTML{Element}Element, {Component}Props>(
  ({ label, description, disabled, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <{element}
        ref={ref}
        id={id}
        role="{role}"
        aria-label={label}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Inhalt */}

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </{element}>
    );
  }
);

{Component}.displayName = '{Component}';
```

──────────────────────────────────────────────────────────────
✅ VALIDIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### Semantik
- [ ] Natives HTML-Element verwendet, wenn möglich
- [ ] Korrekte ARIA-Rolle bei benutzerdefinierter Komponente
- [ ] Logische DOM-Struktur

### ARIA
- [ ] Erforderliche Attribute vorhanden
- [ ] Bedingte Attribute korrekt
- [ ] Keine ARIA-Überladung (nativ > ARIA)

### Tastatur
- [ ] Fokussierbar (passender tabindex)
- [ ] Alle Aktionen per Tastatur erreichbar
- [ ] Keine Tastaturfalle
- [ ] Konformer sichtbarer Fokus

### Ankündigungen
- [ ] Label wird bei Fokus angekündigt
- [ ] Zustände werden bei Änderung angekündigt
- [ ] Fehler mit aria-live assertive

### Kontrast
- [ ] Text ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
- [ ] Fokus ≥ 3:1

### Touch
- [ ] Ziele ≥ 44×44px
- [ ] Abstände ≥ 8px
```
