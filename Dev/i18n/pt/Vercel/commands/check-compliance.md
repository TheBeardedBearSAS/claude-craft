---
description: Check Complete Vercel Compliance
argument-hint: [arguments]
---

# Verificar Conformidade Completa Vercel

## Argumentos

$ARGUMENTS (opcional: caminho do projeto a analisar)

## Modo Plan

> O modo plan é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

Realizar uma auditoria de conformidade completa da configuração de deployment Vercel e do código de superfície da plataforma, orquestrando as 4 verificações principais: vercel.json & Arquitetura, Functions & Escolha de Runtime, Segurança & Tratamento de Env, e ISR/Caching & Testes. Produzir um relatório consolidado com uma pontuação geral em 100 pontos. **Lembrete de escopo**: esta auditoria cobre apenas o uso da plataforma Vercel agnóstico de framework (`vercel.json`, Serverless Functions no Node.js/Fluid Compute, primitivas de cache ISR, Cron Jobs, Storage). Não avaliar roteamento, renderização ou data-fetching específicos do Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — isso pertence à própria verificação de conformidade da stack do framework correspondente (`/react:*`, `/vuejs:*`, `/angular:*`).

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Listar os diretórios principais (`api/`, `middleware.ts`, `.vercel/`, diretórios de teste, etc.)
- [ ] Classificar o formato do projeto: apenas-estático, apenas-Functions, com ISR, com Cron, ou híbrido
- [ ] Identificar se algum framework (Next.js, ou um build Vite/React/Vue/Angular) está sobreposto, e confirmar que o roteamento/renderização específico do framework está fora do escopo desta auditoria

**Nota**: Se $ARGUMENTS for fornecido, usar como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de vercel.json & Arquitetura (30 pontos)

Executar a verificação completa de configuração e arquitetura:

**Critérios Avaliados**:
- vercel.json com schema correto (`$schema`, `version`, chaves de nível superior válidas) (8 pts)
- Correção de rewrites/redirects/headers (redirect vs rewrite, sem duplicação de header com o middleware) (6 pts)
- Regions & bloco functions (sem sobreposição ambígua de glob, memory/maxDuration justificados) (8 pts)
- Adequação ao formato do projeto (a config corresponde ao formato estático/Functions/ISR/Cron declarado) (8 pts)

**Referência**: `.claude/agents/vercel-reviewer.md` (seção 1)

### Etapa 3: Auditoria de Functions & Escolha de Runtime (20 pontos)

Executar a verificação de runtime e qualidade dos handlers:

**Critérios Avaliados**:
- Nenhum `runtime: 'edge'` não sinalizado em código novo/modificado (padrão Node.js/Fluid Compute respeitado) (8 pts)
- Versão do Node.js fixada em 20+ para o benefício de cache de bytecode do Fluid Compute (6 pts)
- Qualidade da assinatura do handler (input validado, respostas tipadas explícitas, imports conscientes de cold-start) (6 pts)

**Referência**: `.claude/agents/vercel-reviewer.md` (seção 2)

### Etapa 4: Auditoria de Segurança & Tratamento de Env (25 pontos)

Executar a verificação de segurança e tratamento de segredos:

**Critérios Avaliados**:
- Segredos/variáveis de ambiente (sem hardcoding, sem vazamento para o bundle cliente, escopo de ambiente correto) (8 pts)
- Endpoints de cron verificam um segredo de invocação (comparação timing-safe) (8 pts)
- Correção dos headers CORS/CSP (sem wildcard + credenciais, CSP de base presente) (5 pts)
- Escopo de credenciais do Marketplace (menor privilégio, sem `@vercel/kv`/`@vercel/postgres` descontinuados) (4 pts)

**Referência**: `.claude/agents/vercel-reviewer.md` (seção 3)

### Etapa 5: Auditoria de ISR/Caching & Testes (25 pontos)

Executar a verificação de caching e testes:

**Critérios Avaliados**:
- Correção do Cache-Control (stale-while-revalidate em rotas cacheáveis) (8 pts)
- Sem conflito de revalidação vercel.json/framework (fonte única de verdade) (7 pts)
- Cobertura de testes do handler (caminhos feliz/validação/autenticação, >= 80%) (6 pts)
- `x-vercel-cache` verificado / smoke test de integração via `vercel dev` (4 pts)

**Referência**: `.claude/agents/vercel-reviewer.md` (seção 4)

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (30 + 20 + 25 + 25 = 100 pontos)
- [ ] Identificar categorias críticas (<50% do seu máximo)
- [ ] Listar todos os problemas críticos transversais (ex.: endpoint de Cron desprotegido, segredo hardcoded, pacote de Storage descontinuado)
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Avaliação**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Revisão completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 principais ações prioritárias em todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE VERCEL - RELATÓRIO COMPLETO
=============================================

PONTUAÇÃO GERAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

VERCEL.JSON & ARQUITETURA    : XX/30  [██████████░░░░░░░░░░] XX%
FUNCTIONS & ESCOLHA DE RUNTIME : XX/20  [██████████░░░░░░░░░░] XX%
SEGURANÇA & TRATAMENTO DE ENV : XX/25  [██████████░░░░░░░░░░] XX%
ISR/CACHING & TESTES          : XX/25  [██████████░░░░░░░░░░] XX%

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
│ VERCEL.JSON & ARQUITETURA (XX/30)            │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Correção do schema do vercel.json : XX/8
  • rewrites/redirects/headers        : XX/6
  • regions & bloco functions         : XX/8
  • Adequação ao formato do projeto   : XX/8

Pontos fortes:
- [Pontos fortes de arquitetura]

Problemas:
- [Problemas de arquitetura]

┌─────────────────────────────────────────────┐
│ FUNCTIONS & ESCOLHA DE RUNTIME (XX/20)       │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Node.js/Fluid Compute vs Edge      : XX/8
  • Versão do Node.js fixada           : XX/6
  • Qualidade da assinatura do handler : XX/6

Pontos fortes:
- [Pontos fortes de runtime]

Problemas:
- [Problemas de runtime]

┌─────────────────────────────────────────────┐
│ SEGURANÇA & TRATAMENTO DE ENV (XX/25)        │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Segredos/variáveis de ambiente    : XX/8
  • Guarda de autenticação do cron    : XX/8
  • Headers CORS/CSP                  : XX/5
  • Escopo de credenciais do Marketplace : XX/4

Pontos fortes:
- [Pontos fortes de segurança]

Problemas:
- [Problemas de segurança]

┌─────────────────────────────────────────────┐
│ ISR/CACHING & TESTES (XX/25)                 │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Correção do Cache-Control          : XX/8
  • Ausência de conflito de revalidação : XX/7
  • Cobertura de testes do handler     : XX/6
  • x-vercel-cache verificado           : XX/4

Pontos fortes:
- [Pontos fortes de caching/testes]

Problemas:
- [Problemas de caching/testes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação #1]
   Categoria : [Arquitetura/Runtime/Segurança/Caching]
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

3. RECOMENDADO - [Ação #3]
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

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, principais pontos fortes,
principais fraquezas, e trajetória recomendada para melhorar a
conformidade. Mencionar se o projeto está pronto para produção,
requer correções, ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Revisão completa necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 categorias cobertas por `@vercel-reviewer`
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com file:line para cada problema
- Priorizar ações com base na matriz Impacto/Esforço
- Um endpoint de Cron desprotegido e um segredo hardcoded são SEMPRE prioridade máxima quando encontrados (permitem que qualquer pessoa que descubra o caminho/repositório acione jobs ou exfiltre credenciais)
- Um achado `runtime: 'edge'` em código novo/modificado é sempre sinalizado, mas nunca bloqueia um relatório em código legado não modificado — tratar como dívida de migração, não como falha bloqueante
- Propor correções automatizáveis (scripts, hooks de pre-commit)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao formato do projeto (apenas-estático / apenas-Functions / com ISR / com Cron / híbrido)
- NÃO avaliar roteamento/renderização/data-fetching específicos do Next.js nem a integração de dev-server própria de qualquer outro framework — fora de escopo para esta auditoria
