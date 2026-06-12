---
description: Genera un DESIGN.md en la raíz del proyecto a partir del template de Claude Craft + análisis de fuentes UI existentes (Tailwind, tokens, CSS).
argument-hint: [--from-tailwind] [--from-tokens=<path>] [--interactive]
---

# Generar DESIGN.md

Crea un fichero `DESIGN.md` en la raíz del proyecto para servir como fuente de verdad del design system, leído por todos los agentes IA (ver skill `design-md-convention`).

## Cuándo usar

- Nuevo proyecto con UI
- Proyecto existente sin DESIGN.md (y por tanto inconsistencias UI frecuentes)
- Migración de un design system de Figma a formato AI-friendly

## Uso

```bash
# Copia simple del template (a rellenar manualmente)
/uiux:generate-design-md

# Pre-rellenar desde tailwind.config.*
/uiux:generate-design-md --from-tailwind

# Pre-rellenar desde fichero de tokens JSON
/uiux:generate-design-md --from-tokens=./design-tokens.json

# Modo interactivo (preguntas dirigidas)
/uiux:generate-design-md --interactive
```

## Proceso

### 1. Verificación

```bash
# Comprobar si DESIGN.md ya existe
if [[ -f "DESIGN.md" ]]; then
  echo "⚠️  DESIGN.md ya existe. Usar --force para sobreescribir."
  exit 1
fi
```

### 2. Detección de fuentes UI

Auto-detectar lo que ya está definido:
- `tailwind.config.{js,ts,mjs}` → extraer `theme.colors`, `fontFamily`, `fontSize`, `spacing`, `screens`
- `design-tokens.json` / `tokens.json` → formato W3C Design Tokens
- `src/styles/_variables.scss` / `styles.css` con `:root { --color-* }`
- `theme.ts` (Chakra, Mantine, MUI)

### 3. Copia del template

Base: `.claude/templates/DESIGN.md.template` (7 secciones obligatorias).

### 4. Pre-relleno inteligente

Si `--from-tailwind`:
- Parsear `tailwind.config.*` via `tw-loader` o lectura JSON
- Mapear los colores a `color.{role}.{shade}`
- Extraer los breakpoints a la sección de cuadrícula
- Extraer los `fontSize` a la sección de tipografía

Si `--from-tokens`:
- Respetar el formato W3C Design Tokens (spec del W3C Community Group)
- Mapear `{color.primary.500.value}` a tokens del DESIGN.md

### 5. Modo interactivo

Si `--interactive`, hacer estas preguntas al usuario:

1. **Personalidad del producto**: ¿profesional / moderno / cálido / minimalista?
2. **Color primario**: ¿hex o elección de la paleta Tailwind?
3. **Fuente principal**: ¿sistema / Google Font / personalizada?
4. **Nivel de accesibilidad objetivo**: ¿WCAG 2.2 AA (estándar) o AAA (estricto)?
5. **Biblioteca de componentes existente**: ¿ninguna / shadcn/ui / MUI / Chakra / Mantine / personalizada?

### 6. Output

- Crear `DESIGN.md` en la raíz del proyecto
- ¿Añadir entrada en `.gitignore`? No, DESIGN.md debe estar versionado.
- Añadir referencia en el `CLAUDE.md` del proyecto: `@DESIGN.md`
- Sugerir enlace desde README.md

## Post-generación

El DESIGN.md requiere una **revisión humana**:
- Validar los colores extraídos
- Completar las secciones poco documentadas (patrones de interacción, a11y)
- Añadir referencias externas (Figma, design system de inspiración)

**Tiempo objetivo:** 30-60 min para un DESIGN.md completo y útil.

## Validación

Checklist post-generación:

- [ ] Las 7 secciones obligatorias presentes
- [ ] Tokens coherentes (sin color fuera de la paleta)
- [ ] Nivel a11y explícito (AA o AAA)
- [ ] DO/DON'T para los componentes principales
- [ ] Sin valores hardcoded fuera de los tokens
- [ ] Commit en el repo

## Integración

- **Skill `design-md-convention`** — reglas de redacción
- **Template** `.claude/templates/DESIGN.md.template`
- **Agentes consumidores**: `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@{react,vue,angular}-reviewer`
- **Comandos relacionados**: `/uiux:design-tokens`, `/uiux:audit`, `/uiux:a11y-audit`

## Ejemplos

### Proyecto React + Tailwind

```bash
/uiux:generate-design-md --from-tailwind --interactive
# Preguntas interactivas
# → DESIGN.md generado con paleta Tailwind + breakpoints + tipografía
```

### Proyecto sin stack UI detectable

```bash
/uiux:generate-design-md --interactive
# Copia del template + preguntas
# → DESIGN.md a completar manualmente
```

## Recursos

- Skill: `.claude/skills/design-md-convention/SKILL.md`
- Template: `.claude/templates/DESIGN.md.template`
- [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/)
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) — 55+ ejemplos
