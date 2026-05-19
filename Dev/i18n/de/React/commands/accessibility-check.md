---
description: Barrierefreiheits-Überprüfung (A11y)
---

# Barrierefreiheits-Überprüfung (A11y)

Führe eine vollständige Barrierefreiheitsprüfung (A11y) der React-Anwendung durch.

## Was dieser Befehl macht

1. **Barrierefreiheitsanalyse**
   - Komponenten auf A11y-Probleme scannen
   - ARIA-Labels prüfen
   - Semantisches HTML verifizieren
   - Tastaturnavigation testen
   - Farbkontraste prüfen

2. **Verwendete Werkzeuge**
   - eslint-plugin-jsx-a11y
   - axe-core
   - Lighthouse
   - React DevTools

3. **Generierter Bericht**
   - Liste der A11y-Verstöße
   - Schweregrad (kritisch, ernst, moderat, gering)
   - Umsetzbare Empfehlungen
   - Code-Beispiele für Korrekturen

## Verwendung

```bash
# Barrierefreiheitsprüfung ausführen
npm run a11y:check

# Oder mit pnpm
pnpm a11y:check
```

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Was zu prüfen ist

### 1. Semantisches HTML

```typescript
// ❌ Schlecht - Nicht semantisch
<div onClick={handleClick}>Klick mich</div>

// ✅ Gut - Semantisch
<button onClick={handleClick}>Klick mich</button>
```

### 2. ARIA-Labels

```typescript
// ❌ Schlecht - Fehlendes Label
<input type="text" />

// ✅ Gut - Mit Label
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Gut - Mit aria-label
<button aria-label="Modal schließen" onClick={onClose}>
  <XIcon />
</button>
```

### 3. Tastaturnavigation

```typescript
// ✅ Gut - Tab-Navigation funktioniert
<button onClick={handleClick}>Aktion</button>

// ✅ Gut - Benutzerdefinierte Tastaturbehandlung
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Benutzerdefinierter Button
</div>
```

### 4. Farbkontrast

- Text muss ausreichendes Kontrastverhältnis haben
- WCAG AA: 4.5:1 für normalen Text
- WCAG AAA: 7:1 für normalen Text
- Werkzeuge zur Kontrastprüfung verwenden

### 5. Alt-Text für Bilder

```typescript
// ❌ Schlecht - Fehlendes Alt
<img src="foto.jpg" />

// ✅ Gut - Beschreibendes Alt
<img src="foto.jpg" alt="Unternehmens-Team bei der Jahreskonferenz" />

// ✅ Gut - Dekoratives Bild
<img src="dekoration.jpg" alt="" role="presentation" />
```

## Konfiguration

### ESLint (eslint-plugin-jsx-a11y)

```json
// .eslintrc.json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error"
  }
}
```

### Automatisiertes Testen mit axe-core

```typescript
// test/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from './MyComponent';

expect.extend(toHaveNoViolations);

describe('Barrierefreiheit', () => {
  it('sollte keine A11y-Verstöße haben', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Häufige Probleme und Lösungen

### Problem 1: Fehlende Formular-Labels

```typescript
// ❌ Problem
<input type="email" placeholder="Email" />

// ✅ Lösung
<label htmlFor="email">E-Mail</label>
<input id="email" type="email" placeholder="ihre@email.de" />
```

### Problem 2: Nicht-interaktive Elemente mit Click-Handlern

```typescript
// ❌ Problem
<div onClick={handleClick}>Klick mich</div>

// ✅ Lösung 1: Button verwenden
<button onClick={handleClick}>Klick mich</button>

// ✅ Lösung 2: Korrekte Rolle und Tastaturunterstützung hinzufügen
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Klick mich
</div>
```

### Problem 3: Fehlender Alt-Text

```typescript
// ❌ Problem
<img src="logo.png" />

// ✅ Lösung
<img src="logo.png" alt="Unternehmens-Logo" />
```

### Problem 4: Farbbasierte Information allein

```typescript
// ❌ Problem
<span style={{ color: 'red' }}>Fehler</span>

// ✅ Lösung
<span style={{ color: 'red' }} aria-label="Fehler">
  <ErrorIcon aria-hidden="true" /> Fehler
</span>
```

## Testen mit Lighthouse

```bash
# Lighthouse installieren
npm install -g lighthouse

# Audit ausführen
lighthouse http://localhost:3000 --view

# Bericht speichern
lighthouse http://localhost:3000 --output html --output-path ./report.html
```

## Best Practices

1. **Semantisches HTML verwenden** (button, nav, main, header, footer)
2. **ARIA-Labels hinzufügen** wo nötig
3. **Tastaturnavigation testen** (Tab, Enter, Escape)
4. **Farbkontraste prüfen** (WCAG AA Minimum)
5. **Alt-Text für Bilder** bereitstellen
6. **Screenreader unterstützen**
7. **Automatisiertes Testen** mit axe-core
8. **Manuelles Testen** mit Screenreadern (NVDA, JAWS, VoiceOver)

## Ressourcen

- [WCAG-Richtlinien](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Barrierefreiheit](https://developer.mozilla.org/de/docs/Web/Accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
