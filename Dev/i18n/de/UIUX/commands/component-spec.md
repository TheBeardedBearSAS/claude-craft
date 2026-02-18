---
description: Vollständige Komponenten-Spezifikation UI/UX/A11y
argument-hint: [arguments]
---

# Vollständige Komponenten-Spezifikation UI/UX/A11y

Du bist der UI/UX Orchestrator. Du musst eine vollständige Komponenten-Spezifikation erstellen, indem du die 3 Experten einbeziehst: UX für Verhalten, UI für Visuelles, A11y für Barrierefreiheit.

## Argumente
$ARGUMENTS

Argumente:
- Name der zu spezifizierenden Komponente
- (Optional) Nutzungskontext

Beispiel: `/uiux:component-spec Button` oder `/uiux:component-spec "Reisekarte" kontext:"Tourismus SaaS"`

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## MISSION

### Schritt 1: UX-Analyse (UX-Experte)

Verhalten und Nutzung definieren:
- Ziel der Komponente
- Hauptanwendungsfälle
- Erwartete Interaktionen
- Funktionale Zustände

### Schritt 2: UI-Spezifikation (UI-Experte)

Visuelles definieren:
- Anatomie und Struktur
- Varianten
- Visuelle Zustände
- Verwendete Tokens
- Responsive

### Schritt 3: A11y-Spezifikation (A11y-Experte)

Barrierefreiheit definieren:
- HTML-Semantik
- ARIA-Attribute
- Tastaturnavigation
- Screenreader-Ankündigungen

### Schritt 4: Synthese

```
══════════════════════════════════════════════════════════════
📦 KOMPONENTEN-SPEZIFIKATION: {NAME}
══════════════════════════════════════════════════════════════

Kategorie: Atom | Molekül | Organismus
Datum: {datum}
Version: 1.0

──────────────────────────────────────────────────────────────
🧠 VERHALTEN (UX)
──────────────────────────────────────────────────────────────

### Ziel
{Beschreibung der Rolle und des Wertes für den Benutzer}

### Anwendungsfälle
| Fall | Kontext | Erwartetes Verhalten |
|------|---------|---------------------|
| Primär | {Kontext} | {Verhalten} |
| Sekundär | {Kontext} | {Verhalten} |

### Funktionale Zustände
| Zustand | Auslöser | Verhalten |
|---------|----------|-----------|
| default | Initial | {Verhalten} |
| loading | Aktion läuft | {Verhalten} |
| success | Aktion erfolgreich | {Verhalten} |
| error | Fehler | {Verhalten} |
| empty | Keine Daten | {Verhalten} |

### Benutzer-Feedback
| Aktion | Feedback | Verzögerung |
|--------|----------|-------------|
| Klick | {Feedback} | Sofort |
| Hover | {Feedback} | Sofort |
| Submit | {Feedback} | < 200ms |

──────────────────────────────────────────────────────────────
🎨 VISUELL (UI)
──────────────────────────────────────────────────────────────

### Anatomie
```
┌─────────────────────────────────┐
│ [Icon]  Label          [Aktion] │
│         Beschreibung            │
└─────────────────────────────────┘
```

- **Slot 1**: {Beschreibung}
- **Slot 2**: {Beschreibung}

### Dimensionen
| Eigenschaft | Mobil | Tablet | Desktop |
|-------------|-------|--------|---------|
| min-width | {Wert} | {Wert} | {Wert} |
| height | {Wert} | {Wert} | {Wert} |
| padding | {Wert} | {Wert} | {Wert} |

### Varianten
| Variante | Verwendung | Visuelle Unterschiede |
|----------|------------|----------------------|
| primary | Haupt-CTA | {Tokens} |
| secondary | Sekundäre Aktion | {Tokens} |
| ghost | Tertiäre Aktion | {Tokens} |
| destructive | Löschen | {Tokens} |

### Visuelle Zustände
| Zustand | Hintergrund | Border | Text | Andere |
|---------|-------------|--------|------|--------|
| default | --color-{x} | --color-{x} | --color-{x} | |
| hover | --color-{x} | --color-{x} | --color-{x} | cursor: pointer |
| focus | --color-{x} | --color-{x} | --color-{x} | outline: 2px |
| active | --color-{x} | --color-{x} | --color-{x} | transform |
| disabled | --color-{x} | --color-{x} | --color-{x} | opacity: 0.5 |
| loading | --color-{x} | --color-{x} | --color-{x} | spinner |

### Mikro-Interaktionen
| Auslöser | Animation | Dauer | Easing |
|----------|-----------|-------|--------|
| hover | {Effekt} | 150ms | ease-out |
| click | {Effekt} | 100ms | ease-in |
| focus | {Effekt} | 0ms | - |

### Verwendete Tokens
```css
/* Farben */
--color-primary-500
--color-neutral-100
--color-error-500

/* Typografie */
--font-size-sm
--font-weight-medium

/* Abstände */
--spacing-2
--spacing-4

/* Andere */
--radius-md
--shadow-sm
--transition-fast
```

──────────────────────────────────────────────────────────────
♿ BARRIEREFREIHEIT (A11y)
──────────────────────────────────────────────────────────────

### HTML-Semantik
```html
<button type="button" class="{komponente}">
  <!-- Natives Element verwenden -->
</button>
```

### ARIA-Attribute
| Attribut | Wert | Bedingung |
|----------|------|-----------|
| aria-label | "{Text}" | Falls nur Icon |
| aria-describedby | "{id}" | Falls Beschreibung |
| aria-disabled | "true" | Falls deaktiviert |
| aria-busy | "true" | Falls ladend |

### Tastaturnavigation
| Taste | Aktion |
|-------|--------|
| Tab | Fokus auf Element |
| Enter | Aktivieren |
| Space | Aktivieren |
| Escape | Abbrechen (falls zutreffend) |

### Fokus-Management
- **Initialer Fokus**: Automatisch via tabindex
- **Fokus-Stil**: outline 2px solid, offset 2px, ratio ≥ 3:1
- **Trap**: Nicht zutreffend (kein Modal)

### Kontrast (AAA)
| Element | Erforderliches Ratio | Aktuelles Ratio |
|---------|---------------------|-----------------|
| Label-Text | ≥ 7:1 | ✅ {ratio} |
| Icon | ≥ 3:1 | ✅ {ratio} |
| Border | ≥ 3:1 | ✅ {ratio} |

### Screenreader-Ankündigungen
| Zeitpunkt | Ankündigung |
|-----------|-------------|
| Fokus | "{label}, Button" |
| Ladend | "Lädt" |
| Erfolg | "Aktion erfolgreich" |
| Fehler | "Fehler: {Nachricht}" |

### Touch-Ziel
- Mindestgröße: 44×44px ✅
- Abstand: ≥ 8px ✅

──────────────────────────────────────────────────────────────
💻 IMPLEMENTIERUNG
──────────────────────────────────────────────────────────────

### Props-Interface (TypeScript)
```typescript
interface {Komponente}Props {
  /** Visuelle Variante */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Komponentengröße */
  size?: 'sm' | 'md' | 'lg';
  /** Deaktivierter Zustand */
  disabled?: boolean;
  /** Ladezustand */
  loading?: boolean;
  /** Linkes Icon */
  leftIcon?: ReactNode;
  /** Rechtes Icon */
  rightIcon?: ReactNode;
  /** Klick-Handler */
  onClick?: () => void;
  /** Inhalt */
  children: ReactNode;
}
```

### Verwendungsbeispiel
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleClick}
>
  Hinzufügen
</Button>
```

──────────────────────────────────────────────────────────────
✅ VALIDIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### UX
- [ ] Klares Ziel definiert
- [ ] Alle funktionalen Zustände dokumentiert
- [ ] Benutzer-Feedback spezifiziert

### UI
- [ ] Alle Varianten definiert
- [ ] Alle visuellen Zustände spezifiziert
- [ ] Responsive dokumentiert
- [ ] Nur Tokens (kein Hardcode)

### A11y
- [ ] Korrekte HTML-Semantik
- [ ] Minimales und korrektes ARIA
- [ ] Vollständige Tastaturnavigation
- [ ] AAA-Kontraste verifiziert
- [ ] Touch-Ziele ≥ 44px
```
