---
description: "Gera um DESIGN.md na raíz do projeto a partir do template do Claude Craft + análise de fontes UI existentes (Tailwind, tokens, CSS)."
argument-hint: "[--from-tailwind] [--from-tokens=<path>] [--interactive]"
---

# Gerar DESIGN.md

Cria um ficheiro `DESIGN.md` na raíz do projeto para servir de fonte de verdade do design system, lido por todos os agentes IA (ver skill `design-md-convention`).

## Quando usar

- Novo projeto com UI
- Projeto existente sem DESIGN.md (e portanto inconsistências UI frequentes)
- Migração de um design system do Figma para formato AI-friendly

## Uso

```bash
# Cópia simples do template (a preencher manualmente)
/uiux:generate-design-md

# Pré-preencher a partir de tailwind.config.*
/uiux:generate-design-md --from-tailwind

# Pré-preencher a partir de ficheiro de tokens JSON
/uiux:generate-design-md --from-tokens=./design-tokens.json

# Modo interativo (perguntas dirigidas)
/uiux:generate-design-md --interactive
```

## Processo

### 1. Verificação

```bash
# Verificar se DESIGN.md já existe
if [[ -f "DESIGN.md" ]]; then
  echo "⚠️  DESIGN.md já existe. Usar --force para sobrescrever."
  exit 1
fi
```

### 2. Deteção de fontes UI

Auto-detetar o que já está definido:
- `tailwind.config.{js,ts,mjs}` → extrair `theme.colors`, `fontFamily`, `fontSize`, `spacing`, `screens`
- `design-tokens.json` / `tokens.json` → formato W3C Design Tokens
- `src/styles/_variables.scss` / `styles.css` com `:root { --color-* }`
- `theme.ts` (Chakra, Mantine, MUI)

### 3. Cópia do template

Base: `.claude/templates/DESIGN.md.template` (7 secções obrigatórias).

### 4. Pré-preenchimento inteligente

Se `--from-tailwind`:
- Parsear `tailwind.config.*` via `tw-loader` ou leitura JSON
- Mapear as cores para `color.{role}.{shade}`
- Extrair os breakpoints para a secção de grelha
- Extrair os `fontSize` para a secção de tipografia

Se `--from-tokens`:
- Respeitar o formato W3C Design Tokens (spec do W3C Community Group)
- Mapear `{color.primary.500.value}` para tokens do DESIGN.md

### 5. Modo interativo

Se `--interactive`, colocar estas perguntas ao utilizador:

1. **Personalidade do produto**: profissional / moderno / caloroso / minimalista?
2. **Cor primária**: hex ou escolha da paleta Tailwind?
3. **Fonte principal**: sistema / Google Font / personalizada?
4. **Nível de acessibilidade alvo**: WCAG 2.2 AA (padrão) ou AAA (estrito)?
5. **Biblioteca de componentes existente**: nenhuma / shadcn/ui / MUI / Chakra / Mantine / personalizada?

### 6. Output

- Criar `DESIGN.md` na raíz do projeto
- Adicionar entrada em `.gitignore`? Não, DESIGN.md deve ser versionado.
- Adicionar referência no `CLAUDE.md` do projeto: `@DESIGN.md`
- Sugerir ligação a partir do README.md

## Pós-geração

O DESIGN.md requer uma **revisão humana**:
- Validar as cores extraídas
- Completar as secções pouco documentadas (padrões de interação, a11y)
- Adicionar referências externas (Figma, design system de inspiração)

**Tempo alvo:** 30-60 min para um DESIGN.md completo e útil.

## Validação

Checklist pós-geração:

- [ ] As 7 secções obrigatórias presentes
- [ ] Tokens coerentes (sem cor fora da paleta)
- [ ] Nível a11y explícito (AA ou AAA)
- [ ] DO/DON'T para os componentes principais
- [ ] Sem valores hardcoded fora dos tokens
- [ ] Commit no repo

## Integração

- **Skill `design-md-convention`** — regras de redação
- **Template** `.claude/templates/DESIGN.md.template`
- **Agentes consumidores**: `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@{react,vue,angular}-reviewer`
- **Comandos relacionados**: `/uiux:design-tokens`, `/uiux:audit`, `/uiux:a11y-audit`

## Exemplos

### Projeto React + Tailwind

```bash
/uiux:generate-design-md --from-tailwind --interactive
# Perguntas interativas
# → DESIGN.md gerado com paleta Tailwind + breakpoints + tipografia
```

### Projeto sem stack UI detetável

```bash
/uiux:generate-design-md --interactive
# Cópia do template + perguntas
# → DESIGN.md a preencher manualmente
```

## Recursos

- Skill: `.claude/skills/design-md-convention/SKILL.md`
- Template: `.claude/templates/DESIGN.md.template`
- [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/)
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) — 55+ exemplos
