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

Realizar uma auditoria de conformidade completa do projeto Vite orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação geral de 100 pontos.

> **Lembrete de escopo**: esta auditoria cobre apenas o uso do Vite independente de framework (aplicações JS/TS vanilla, criação de bibliotecas com `build.lib`, aplicações multipágina, entradas Workers/WASM). Não avaliar a integração do dev-server específica de React/Vue/Angular/Svelte; ela pertence à verificação de conformidade própria de cada um desses stacks.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença de arquivos de configuração (package.json, tsconfig.json, vite.config.ts)
- [ ] Listar os diretórios principais (src/, pages/, public/, tests/, etc.)
- [ ] Identificar o tipo de projeto: SPA vanilla, biblioteca (build.lib), aplicação multipágina ou pontos de entrada Workers/WASM
- [ ] Identificar a versão do Vite e confirmar que nenhum plugin específico de framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) está no escopo

**Nota**: Se $ARGUMENTS for fornecido, utilizá-lo como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Usar o slash command `/vite:check-architecture` ou seguir manualmente os passos em `check-architecture.md`

**Critérios Avaliados**:
- Detecção da forma do projeto e pontos de entrada (index.html na raiz, entrada build.lib, input multipágina, padrão `new URL` de Worker/WASM) (6 pts)
- Estrutura do vite.config.ts (defineConfig, forma funcional, ordem das chaves) (5 pts)
- Organização de plugins personalizados (vite-plugins/, nomenclatura vite-plugin-*, uma responsabilidade por plugin) (4 pts)
- Externalização de dependências e mapa exports do package.json (biblioteca) (6 pts)
- Estrutura de saída (dist/ ignorado, ES + CJS + .d.ts via vite-plugin-dts, nomes de chunks estáveis) (4 pts)

**Referência**: `check-architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Usar o slash command `/vite:check-code-quality` ou seguir manualmente os passos em `check-code-quality.md`

**Critérios Avaliados**:
- Análise do ESLint (no-explicit-any, no-restricted-imports, no-console) (5 pts)
- Rigor do TypeScript (strict, moduleResolution: "bundler", tipos vite/client) (6 pts)
- Detecção de vazamento de framework (sem acoplamento a React/Vue/Angular/Svelte) (5 pts)
- Complexidade do código (tamanho de funções/arquivos, complexidade ciclomática, aninhamento) (4 pts)
- Qualidade específica do Vite (config funcional, plugins extraídos, variáveis VITE_* apenas públicas, padrões Worker/WASM estáticos) (5 pts)

**Referência**: `check-code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Usar o slash command `/vite:check-testing` ou seguir manualmente os passos em `check-testing.md`

**Critérios Avaliados**:
- Cobertura de código com Vitest (>= 80 % instruções, branches, funções, linhas) (7 pts)
- Organização e isolamento dos testes (4 pts)
- Testes de módulos vanilla (funções puras, casos limite, ambiente node) (4 pts)
- Testes de Workers (lógica do handler extraída, contrato de mensagens) (4 pts)
- Testes de wrappers WASM (`?init` simulado, um teste de integração com um .wasm real) (3 pts)
- Testes da saída de build da biblioteca em dist/ (ESM, CJS, mapa exports) (3 pts)

**Referência**: `check-testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Usar o slash command `/vite:check-security` ou seguir manualmente os passos em `check-security.md`

**Critérios Avaliados**:
- Vazamento de segredos via env / `define()` (prefixo VITE_*, segredos no código) (7 pts)
- Cobertura de CSP em todas as entradas (multipágina, aplicação no servidor/CDN) (5 pts)
- Isolamento de WASM (COOP/COEP, wasm-unsafe-eval, objeto de imports mínimo) (4 pts)
- Validação de mensagens de Worker (verificação de formato, sem eval, verificação de origem) (5 pts)
- Vulnerabilidades de dependências (npm audit) (4 pts)

**Referência**: `check-security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máximo de 100 pontos)
- [ ] Identificar categorias críticas (<50 %)
- [ ] Listar todos os problemas transversais críticos (p. ex. index.html em public/, segredos expostos via VITE_*, falta de externalização de peer deps)
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Avaliação**:
- 90-100: Excelente — Projeto de referência
- 75-89: Muito Bom — Algumas melhorias menores
- 60-74: Aceitável — Requer melhorias
- 40-59: Insuficiente — Refatoração significativa necessária
- 0-39: Crítico — Revisão completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 ações prioritárias em todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir ganhos rápidos (alta relação impacto/esforço)

> **Projetos de biblioteca**: `/vite:check-library-build` complementa esta auditoria em projetos de biblioteca (saída build.lib, mapa exports, declarações de tipos, tree-shaking). Executá-lo adicionalmente quando o projeto publicar um pacote.

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE VITE - RELATÓRIO COMPLETO
=============================================

PONTUAÇÃO GERAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

ARQUITETURA       : XX/25  [██████████░░░░░░░░░░] XX%
QUALIDADE DE CÓDIGO: XX/25  [██████████░░░░░░░░░░] XX%
TESTES            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURANÇA         : XX/25  [██████████░░░░░░░░░░] XX%

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
1. [Problema crítico - categoria afetada #1]
2. [Problema crítico - categoria afetada #2]
3. [Problema crítico - categoria afetada #3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)
└─────────────────────────────────────────────┘

Subpontuações:
  • Detecção da forma do projeto e pontos de entrada (index.html na raiz, entrada build.lib, input multipágina, padrão `new URL` de Worker/WASM) : XX/6
  • Estrutura do vite.config.ts (defineConfig, forma funcional, ordem das chaves) : XX/5
  • Organização de plugins personalizados (vite-plugins/, nomenclatura vite-plugin-*, uma responsabilidade por plugin) : XX/4
  • Externalização de dependências e mapa exports do package.json (biblioteca) : XX/6
  • Estrutura de saída (dist/ ignorado, ES + CJS + .d.ts via vite-plugin-dts, nomes de chunks estáveis) : XX/4

Pontos fortes:
- [Pontos fortes da arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções semelhantes para Qualidade de Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DAS AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação #1]
   Categoria: [Architecture/Code Quality/Tests/Security]
   Impacto  : [Alto/Médio/Baixo]
   Esforço  : [Alto/Médio/Baixo]
   Prioridade: IMEDIATA

   Descrição detalhada:
   [Explicação do problema e da solução proposta]

   Arquivos afetados:
   - [file:line]

   Exemplo de correção:
   [Código ou comando de correção]

2. IMPORTANTE - [Ação #2]
   [Mesmo formato...]

3. RECOMENDADO - [Ação #3]
   [Mesmo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GANHOS RÁPIDOS (Alto impacto / Baixo esforço):

- [Quick win #1] - Categoria: [X] - Impacto  : [X] - Esforço  : [X]
- [Quick win #2] - Categoria: [X] - Impacto  : [X] - Esforço  : [X]
- [Quick win #3] - Categoria: [X] - Impacto  : [X] - Esforço  : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica n.º 1]
- [ ] [Ganho rápido prioritário]

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante n.º 2]
- [ ] [Outros ganhos rápidos]

MÊS 2-3 (Médio prazo):
- [ ] [Ação recomendada n.º 3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de síntese sobre o estado geral do projeto, seus
principais pontos fortes, suas principais fraquezas e a trajetória
recomendada para melhorar a conformidade. Indicar se o projeto está
pronto para produção, requer correções ou precisa de refatoração.]

Recomendação geral: [Pronto para produção / Correções menores /
Refatoração significativa / Revisão completa necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas (`/vite:check-architecture`, `/vite:check-code-quality`, `/vite:check-testing`, `/vite:check-security`)
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com arquivo:linha para cada problema
- Priorizar ações com base na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima (primeiro os segredos expostos via VITE_* ou define())
- Propor correções automatizáveis (scripts, hooks de pré-commit)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao tipo de projeto (aplicação vanilla / biblioteca / multipágina / Workers-WASM)
- NÃO avaliar a integração do dev-server específica de um framework (React/Vue/Angular/Svelte); fora do escopo desta auditoria
