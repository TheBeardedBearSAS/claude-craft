---
description: Generate a DESIGN.md at the project root from the Claude Craft template + analysis of existing UI sources (Tailwind, tokens, CSS).
argument-hint: [--from-tailwind] [--from-tokens=<path>] [--interactive]
---

# Generate DESIGN.md

Creates a `DESIGN.md` file at the project root to serve as the design system source of truth, read by all AI agents (see the `design-md-convention` skill).

## When to Use

- New project with UI
- Existing project without DESIGN.md (and therefore frequent UI inconsistencies)
- Migrating a Figma design system to AI-friendly format

## Usage

```bash
# Simple template copy (to be filled in manually)
/uiux:generate-design-md

# Pre-fill from tailwind.config.*
/uiux:generate-design-md --from-tailwind

# Pre-fill from JSON token file
/uiux:generate-design-md --from-tokens=./design-tokens.json

# Interactive mode (targeted questions)
/uiux:generate-design-md --interactive
```

## Process

### 1. Verification

```bash
# Check if DESIGN.md already exists
if [[ -f "DESIGN.md" ]]; then
  echo "⚠️  DESIGN.md already exists. Use --force to overwrite."
  exit 1
fi
```

### 2. UI Source Detection

Auto-detect what is already defined:
- `tailwind.config.{js,ts,mjs}` → extract `theme.colors`, `fontFamily`, `fontSize`, `spacing`, `screens`
- `design-tokens.json` / `tokens.json` → W3C Design Tokens format
- `src/styles/_variables.scss` / `styles.css` with `:root { --color-* }`
- `theme.ts` (Chakra, Mantine, MUI)

### 3. Template Copy

Base: `.claude/templates/DESIGN.md.template` (7 required sections).

### 4. Intelligent Pre-fill

If `--from-tailwind`:
- Parse `tailwind.config.*` via `tw-loader` or JSON reading
- Map colors to `color.{role}.{shade}`
- Extract breakpoints to the grid section
- Extract `fontSize` to the typography section

If `--from-tokens`:
- Respect W3C Design Tokens format (W3C Community Group spec)
- Map `{color.primary.500.value}` to DESIGN.md tokens

### 5. Interactive Mode

If `--interactive`, ask the user these questions:

1. **Product personality**: professional / modern / warm / minimalist?
2. **Primary color**: hex or choice from Tailwind palette?
3. **Main font**: system / Google Font / custom?
4. **Target accessibility level**: WCAG 2.2 AA (standard) or AAA (strict)?
5. **Existing component library**: none / shadcn/ui / MUI / Chakra / Mantine / custom?

### 6. Output

- Create `DESIGN.md` at the project root
- Add entry in `.gitignore`? No, DESIGN.md should be versioned.
- Add reference in project `CLAUDE.md`: `@DESIGN.md`
- Suggest linking from README.md

## Post-generation

The DESIGN.md requires a **human review**:
- Validate the extracted colors
- Complete poorly documented sections (interaction patterns, a11y)
- Add external references (Figma, inspired design system)

**Target time:** 30-60 min for a complete and useful DESIGN.md.

## Validation

Post-generation checklist:

- [ ] The 7 required sections are present
- [ ] Consistent tokens (no color outside the palette)
- [ ] Explicit a11y level (AA or AAA)
- [ ] DO/DON'T for the main components
- [ ] No hardcoded values outside tokens
- [ ] Committed to the repo

## Integration

- **`design-md-convention` skill** — writing rules
- **Template** `.claude/templates/DESIGN.md.template`
- **Consumer agents**: `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@{react,vue,angular}-reviewer`
- **Related commands**: `/uiux:design-tokens`, `/uiux:audit`, `/uiux:a11y-audit`

## Examples

### React + Tailwind project

```bash
/uiux:generate-design-md --from-tailwind --interactive
# Interactive questions
# → DESIGN.md generated with Tailwind palette + breakpoints + typography
```

### Project without detectable UI stack

```bash
/uiux:generate-design-md --interactive
# Template copy + questions
# → DESIGN.md to be filled in manually
```

## Resources

- Skill: `.claude/skills/design-md-convention/SKILL.md`
- Template: `.claude/templates/DESIGN.md.template`
- [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/)
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) — 55+ examples
