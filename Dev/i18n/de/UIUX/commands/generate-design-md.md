---
description: Generiert eine DESIGN.md im Projektstamm aus dem Claude Craft Template + Analyse vorhandener UI-Quellen (Tailwind, Tokens, CSS).
argument-hint: [--from-tailwind] [--from-tokens=<path>] [--interactive]
---

# DESIGN.md generieren

Erstellt eine `DESIGN.md`-Datei im Projektstamm als zentrale Wahrheitsquelle des Design Systems, die von allen KI-Agenten gelesen wird (siehe Skill `design-md-convention`).

## Wann verwenden

- Neues Projekt mit UI
- Bestehendes Projekt ohne DESIGN.md (und damit häufigen UI-Inkonsistenzen)
- Migration eines Figma-Design-Systems in KI-freundliches Format

## Verwendung

```bash
# Einfache Template-Kopie (manuell auszufüllen)
/uiux:generate-design-md

# Aus tailwind.config.* vorausfüllen
/uiux:generate-design-md --from-tailwind

# Aus JSON-Token-Datei vorausfüllen
/uiux:generate-design-md --from-tokens=./design-tokens.json

# Interaktiver Modus (gezielte Fragen)
/uiux:generate-design-md --interactive
```

## Prozess

### 1. Überprüfung

```bash
# Prüfen ob DESIGN.md bereits existiert
if [[ -f "DESIGN.md" ]]; then
  echo "⚠️  DESIGN.md existiert bereits. --force verwenden zum Überschreiben."
  exit 1
fi
```

### 2. UI-Quellen erkennen

Auto-Erkennung des bereits Definierten:
- `tailwind.config.{js,ts,mjs}` → `theme.colors`, `fontFamily`, `fontSize`, `spacing`, `screens` extrahieren
- `design-tokens.json` / `tokens.json` → W3C Design Tokens Format
- `src/styles/_variables.scss` / `styles.css` mit `:root { --color-* }`
- `theme.ts` (Chakra, Mantine, MUI)

### 3. Template kopieren

Basis: `.claude/templates/DESIGN.md.template` (7 Pflichtabschnitte).

### 4. Intelligentes Vorausfüllen

Bei `--from-tailwind`:
- `tailwind.config.*` via `tw-loader` oder JSON-Lesevorgänge parsen
- Farben zu `color.{role}.{shade}` mappen
- Breakpoints in den Grid-Abschnitt extrahieren
- `fontSize`-Werte in den Typografie-Abschnitt extrahieren

Bei `--from-tokens`:
- W3C Design Tokens Format einhalten (W3C Community Group Spec)
- `{color.primary.500.value}` auf DESIGN.md-Tokens mappen

### 5. Interaktiver Modus

Bei `--interactive`, dem Benutzer diese Fragen stellen:

1. **Produkt-Persönlichkeit**: professionell / modern / warm / minimalistisch?
2. **Primärfarbe**: Hex oder Auswahl aus Tailwind-Palette?
3. **Hauptschrift**: System / Google Font / Custom?
4. **Ziel-Barrierefreiheitsniveau**: WCAG 2.2 AA (Standard) oder AAA (streng)?
5. **Vorhandene Komponentenbibliothek**: keine / shadcn/ui / MUI / Chakra / Mantine / custom?

### 6. Output

- `DESIGN.md` im Projektstamm erstellen
- Eintrag in `.gitignore` hinzufügen? Nein, DESIGN.md soll versioniert werden.
- Referenz in Projekt-`CLAUDE.md` hinzufügen: `@DESIGN.md`
- Verlinkung von README.md vorschlagen

## Nach der Generierung

Die DESIGN.md benötigt eine **menschliche Überprüfung**:
- Extrahierte Farben validieren
- Wenig dokumentierte Abschnitte ergänzen (Interaktionsmuster, a11y)
- Externe Referenzen hinzufügen (Figma, inspiriertes Design System)

**Zielzeit:** 30-60 Min. für eine vollständige und nützliche DESIGN.md.

## Validierung

Checkliste nach der Generierung:

- [ ] Die 7 Pflichtabschnitte vorhanden
- [ ] Konsistente Tokens (keine Farbe außerhalb der Palette)
- [ ] Explizites a11y-Niveau (AA oder AAA)
- [ ] DO/DON'T für die Hauptkomponenten
- [ ] Keine hardcodierten Werte außerhalb der Tokens
- [ ] Im Repo eingecheckt

## Integration

- **Skill `design-md-convention`** — Schreibregeln
- **Template** `.claude/templates/DESIGN.md.template`
- **Konsumierende Agenten**: `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@{react,vue,angular}-reviewer`
- **Verwandte Befehle**: `/uiux:design-tokens`, `/uiux:audit`, `/uiux:a11y-audit`

## Beispiele

### React + Tailwind Projekt

```bash
/uiux:generate-design-md --from-tailwind --interactive
# Interaktive Fragen
# → DESIGN.md generiert mit Tailwind-Palette + Breakpoints + Typografie
```

### Projekt ohne erkennbaren UI-Stack

```bash
/uiux:generate-design-md --interactive
# Template-Kopie + Fragen
# → DESIGN.md manuell auszufüllen
```

## Ressourcen

- Skill: `.claude/skills/design-md-convention/SKILL.md`
- Template: `.claude/templates/DESIGN.md.template`
- [W3C Design Tokens Spec](https://design-tokens.github.io/community-group/format/)
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) — 55+ Beispiele
