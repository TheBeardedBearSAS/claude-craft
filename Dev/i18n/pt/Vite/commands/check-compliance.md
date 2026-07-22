---
description: Verificar Conformidade Completa do Vite
argument-hint: [arguments]
---

# Verificar Conformidade Completa do Vite

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

Realizar uma auditoria de conformidade completa do projeto Vite orquestrando as 4 verificações principais: Config & Arquitetura Vite, TypeScript & Qualidade, Testes e Build Output & Performance. Produzir um relatório consolidado com uma pontuação geral de 100 pontos. **Lembrete de escopo**: esta auditoria cobre apenas o uso do Vite agnóstico de framework (aplicações vanilla JS/TS, criação de bibliotecas, aplicações multi-página, Workers/WASM). Não avaliar a integração de dev-server específica de React/Vue/Angular/Svelte — isso pertence à verificação de conformidade própria da stack correspondente.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença de arquivos de configuração (package.json, tsconfig.json, vite.config.ts)
- [ ] Listar os diretórios principais (src/, pages/, public/, tests/, etc.)
- [ ] Identificar o tipo de projeto: SPA vanilla, biblioteca (build.lib), aplicação multi-página, ou pontos de entrada Workers/WASM
- [ ] Identificar a versão do Vite e confirmar que nenhum plugin específico de framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) está no escopo desta auditoria

**Nota**: Se $ARGUMENTS for fornecido, utilizá-lo como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de Config & Arquitetura Vite (30 pontos)

Executar a verificação completa de configuração e arquitetura:

**Critérios Avaliados**:
- Correção do vite.config.ts (defineConfig, aliases sincronizados com tsconfig) (8 pts)
- Posicionamento do index.html na raiz do projeto, nunca dentro de public/ (6 pts)
- Configuração do build.lib para bibliotecas (entry, formats, external, vite-plugin-dts) (8 pts)
- rollupOptions.input para aplicações multi-página, convenção de nomeação de plugins (vite-plugin-*) (8 pts)

**Referência**: `.claude/agents/vite-reviewer.md` (seção 1)

### Etapa 3: Auditoria de TypeScript & Qualidade (20 pontos)

Executar a verificação de configuração TypeScript e qualidade da tipagem:

**Critérios Avaliados**:
- strict: true, moduleResolution: "bundler", target ES2022+ (6 pts)
- Tipos do Vite presentes (vite/client), import.meta.env corretamente tipado (5 pts)
- Correção do output do vite-plugin-dts (rollupTypes, zero any injustificado) (5 pts)
- Hooks de plugin customizados tipados via a interface Plugin (4 pts)

**Referência**: `.claude/agents/vite-reviewer.md` (seção 2)

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Critérios Avaliados**:
- Config do Vitest coerente (mergeConfig ou arquivo dedicado), sem divergência com o vite.config.ts (6 pts)
- Cobertura >= 80% na lógica de negócio / API pública (6 pts)
- Ambiente de teste corresponde à necessidade (node vs jsdom/happy-dom) (4 pts)
- Testes sobre o build publicado (dist/), não apenas o código-fonte (5 pts)
- Testes de integração/E2E para aplicações multi-página (4 pts)

**Referência**: `.claude/agents/vite-reviewer.md` (seção 3)

### Etapa 5: Auditoria de Build Output & Performance (25 pontos)

Executar a verificação de build output e performance:

**Critérios Avaliados**:
- Tree-shaking efetivo (sideEffects: false, named exports, exports map coerente) (6 pts)
- Dependências externalizadas para bibliotecas (peer deps não empacotadas) (6 pts)
- Code-splitting para aplicações multi-página (manualChunks, vendor compartilhado) (5 pts)
- Bundle dentro dos limiares, assetsInlineLimit controlado (4 pts)
- Hashing de assets, build.target apropriado, sourcemaps tratados corretamente em prod (4 pts)

**Referência**: `.claude/agents/vite-reviewer.md` (seção 4)

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (30 + 20 + 25 + 25 = 100 pontos)
- [ ] Identificar categorias críticas (<50% do seu máximo)
- [ ] Listar todos os problemas críticos transversais (ex.: index.html em public/, externalização de peer deps ausente)
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Avaliação**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 principais ações prioritárias em todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE VITE - RELATÓRIO COMPLETO
=============================================

PONTUAÇÃO GERAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

CONFIG & ARQUITETURA VITE    : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT & QUALIDADE       : XX/20  [██████████░░░░░░░░░░] XX%
TESTES                       : XX/25  [██████████░░░░░░░░░░] XX%
BUILD OUTPUT & PERFORMANCE   : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTOS FORTES GERAIS:
1. [Ponto forte identificado em múltiplas categorias]
2. [Outro ponto forte importante]
3. [Terceiro ponto forte]

MELHORIAS GERAIS:
1. [Melhoria transversal menor]
2. [Outra melhoria recomendada]
3. [Terceira melhoria]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoria afetada]
2. [Problema crítico #2 - categoria afetada]
3. [Problema crítico #3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ CONFIG & ARQUITETURA VITE (XX/30)            │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Correção do vite.config.ts       : XX/8
  • Posicionamento do index.html     : XX/6
  • Configuração do build.lib        : XX/8
  • rollupOptions.input / plugins    : XX/8

Pontos fortes:
- [Pontos fortes de arquitetura]

Problemas:
- [Problemas de arquitetura]

┌─────────────────────────────────────────────┐
│ TYPESCRIPT & QUALIDADE (XX/20)               │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • modo strict / moduleResolution   : XX/6
  • Tipos do Vite / import.meta.env  : XX/5
  • Output do vite-plugin-dts        : XX/5
  • Hooks de plugin tipados          : XX/4

Pontos fortes:
- [Pontos fortes de tipagem]

Problemas:
- [Problemas de tipagem]

┌─────────────────────────────────────────────┐
│ TESTES (XX/25)                               │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Coerência da config do Vitest    : XX/6
  • Cobertura >= 80%                 : XX/6
  • Adequação do ambiente de teste   : XX/4
  • Build publicado testado          : XX/5
  • Integração/E2E multi-página      : XX/4

Pontos fortes:
- [Pontos fortes de testes]

Problemas:
- [Problemas de testes]

┌─────────────────────────────────────────────┐
│ BUILD OUTPUT & PERFORMANCE (XX/25)           │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Efetividade do tree-shaking      : XX/6
  • Externalização de peer deps      : XX/6
  • Code-splitting multi-página      : XX/5
  • Limiares do bundle               : XX/4
  • Hashing / build.target / sourcemaps : XX/4

Pontos fortes:
- [Pontos fortes de performance]

Problemas:
- [Problemas de performance]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação #1]
   Categoria : [Arquitetura/TypeScript/Testes/Performance]
   Impacto   : [Alto/Médio/Baixo]
   Esforço   : [Alto/Médio/Baixo]
   Prioridade: IMEDIATA

   Descrição detalhada:
   [Explicação do problema e solução proposta]

   Arquivos afetados:
   - [file:line]

   Exemplo de correção:
   [Código ou comando de correção]

2. IMPORTANTE - [Ação #2]
   [Mesmo formato...]

3. RECOMENDADA - [Ação #3]
   [Mesmo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Alto Impacto / Baixo Esforço):

- [Quick win #1] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win #2] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win #3] - Categoria: [X] - Impacto: [X] - Esforço: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica #1]
- [ ] [Quick win prioritário]

SEMANA 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MÊS 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, os principais pontos fortes,
as principais fraquezas e a trajetória recomendada para melhorar a
conformidade. Mencionar se o projeto está pronto para produção,
requer correções, ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 categorias cobertas por `@vite-reviewer`
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com file:line para cada problema
- Priorizar ações com base na matriz Impacto/Esforço
- O posicionamento do index.html e a externalização de peer dependencies SEMPRE têm prioridade máxima quando violados (eles quebram o grafo de módulos ou incham o bundle de cada consumidor)
- Propor correções automatizáveis (scripts, hooks de pre-commit)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao tipo de projeto (aplicação vanilla / biblioteca / multi-página / Workers-WASM)
- NÃO avaliar a integração de dev-server específica de framework (React/Vue/Angular/Svelte) — fora do escopo desta auditoria
