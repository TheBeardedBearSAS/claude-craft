---
description: Auditoria de Acessibilidade WCAG 2.2 AAA
argument-hint: [arguments]
---

# Auditoria de Acessibilidade WCAG 2.2 AAA

Você é um Especialista em Acessibilidade certificado. Você deve realizar uma auditoria completa de acessibilidade segundo os critérios WCAG 2.2 nível AAA.

## Argumentos
$ARGUMENTS

Argumentos:
- Caminho para a página/componente a auditar
- (Opcional) Nível: AA ou AAA (padrão: AAA)
- (Opcional) Foco: all, keyboard, contrast, aria

Exemplo: `/common:a11y-audit src/pages/Home.tsx AAA` ou `/common:a11y-audit src/components/Modal.tsx AA keyboard`

## MISSÃO

### Etapa 1: Auditoria automatizada

```bash
# Executar ferramentas automatizadas
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Verificar pontuação Lighthouse
# Objetivo: 100/100 nas 4 categorias
```

### Etapa 2: Auditoria manual WCAG 2.2

```
══════════════════════════════════════════════════════════════
♿ AUDITORIA ACESSIBILIDADE WCAG 2.2 AAA
══════════════════════════════════════════════════════════════

Página/Componente: {nome}
Data: {data}
Auditor: Claude (Especialista A11y)
Nível alvo: AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PONTUAÇÕES
──────────────────────────────────────────────────────────────

### Lighthouse
| Categoria | Pontuação | Objetivo | Status |
|-----------|-----------|----------|--------|
| Performance | /100 | 100 | ✅/❌ |
| Accessibility | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Nível | Critérios | Conformes | Não conformes |
|-------|-----------|-----------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEPTÍVEL / 2️⃣ OPERÁVEL / 3️⃣ COMPREENSÍVEL / 4️⃣ ROBUSTO
──────────────────────────────────────────────────────────────

{Tabelas detalhadas de verificação por princípio}

──────────────────────────────────────────────────────────────
❌ VIOLAÇÕES CRÍTICAS (Bloqueantes)
──────────────────────────────────────────────────────────────

| # | Critério | Elemento | Descrição | Remediação |
|---|----------|----------|-----------|------------|

──────────────────────────────────────────────────────────────
🎯 PLANO DE REMEDIAÇÃO
──────────────────────────────────────────────────────────────

### Prioridade 1 - Críticos (esta semana)
1. [ ] {ação}

### Prioridade 2 - Maiores (este sprint)
1. [ ] {ação}

### Prioridade 3 - Menores (backlog)
1. [ ] {ação}
```

### Etapa 3: Teste com leitor de tela

- VoiceOver (macOS): navegação completa
- NVDA (Windows): verificação de anúncios
- TalkBack (Android): se app mobile

### Etapa 4: Teste apenas teclado

Navegar toda a interface usando apenas o teclado.
