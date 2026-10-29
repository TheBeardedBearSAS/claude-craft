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

Realizar uma auditoria de conformidade completa da configuração de deployment Vercel e do código de superfície da plataforma, orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação geral em 100 pontos. **Lembrete de escopo**: esta auditoria cobre apenas o uso da plataforma Vercel agnóstico de framework (`vercel.json`, Serverless Functions no Node.js/Fluid Compute, primitivas de cache ISR, Cron Jobs, Storage). Não avaliar roteamento, renderização ou data-fetching específicos do Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — isso pertence à própria verificação de conformidade da stack do framework correspondente (`/react:*`, `/vuejs:*`, `/angular:*`).

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Listar os diretórios principais (`api/`, `middleware.ts`, `.vercel/`, diretórios de teste, etc.)
- [ ] Classificar o formato do projeto: apenas-estático, apenas-Functions, com ISR, com Cron, ou híbrido
- [ ] Identificar se algum framework (Next.js, ou um build Vite/React/Vue/Angular) está sobreposto, e confirmar que o roteamento/renderização específico do framework está fora do escopo desta auditoria

**Nota**: Se $ARGUMENTS for fornecido, usar como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Usar o slash command `/vercel:check-architecture` ou seguir manualmente os passos em `check-architecture.md`

**Critérios Avaliados**:
- Validade do schema do vercel.json (`$schema`, `version`, chaves de nível superior válidas) (6 pts)
- Correção de rewrites / redirects / headers (6 pts)
- Bloco regions e functions (sem sobreposição ambígua de globs, memory/maxDuration justificados) (5 pts)
- Configuração dos Cron Jobs (caminhos e agendamentos válidos em `crons[]`) (4 pts)
- Adequação ao formato do projeto e conflitos com o adaptador de framework (4 pts)

**Referência**: `check-architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Usar o slash command `/vercel:check-code-quality` ou seguir manualmente os passos em `check-code-quality.md`

**Critérios Avaliados**:
- Análise ESLint das Functions e do middleware (6 pts)
- Modo estrito do TypeScript e segurança de tipos (6 pts)
- Convenções de assinatura dos handlers (request/response tipados, entrada validada, runtime Node.js/Fluid Compute por padrão) (6 pts)
- Controle do tamanho do bundle (imports adequados ao cold start) (4 pts)
- Qualidade do middleware (3 pts)

**Referência**: `check-code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Usar o slash command `/vercel:check-testing` ou seguir manualmente os passos em `check-testing.md`

**Critérios Avaliados**:
- Cobertura dos handlers de Functions e do middleware (>= 80%) (7 pts)
- Testes dos handlers de Functions (caminho feliz, validação e erros) (6 pts)
- Testes das guardas de segredo dos Cron (todos os ramos de guarda) (5 pts)
- Testes do middleware (3 pts)
- Organização e isolamento dos testes (2 pts)
- Testes de fumaça com `vercel dev` e verificação de `x-vercel-cache` (2 pts)

**Referência**: `check-testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Usar o slash command `/vercel:check-security` ou seguir manualmente os passos em `check-security.md`

**Critérios Avaliados**:
- Tratamento de variáveis de ambiente (sem valores fixos no código, sem vazamento para o bundle do cliente, escopo de ambiente correto) (7 pts)
- Autenticação dos endpoints Cron (segredo de invocação, comparação em tempo constante) (7 pts)
- Cabeçalhos CORS / CSP no vercel.json (4 pts)
- Escopo das credenciais do Marketplace (menor privilégio) (3 pts)
- Pacotes Storage obsoletos (`@vercel/kv`, `@vercel/postgres`) e sinalização de migração do runtime Edge legado (2 pts)
- Vulnerabilidades de dependências (2 pts)

**Referência**: `check-security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máximo de 100 pontos)
- [ ] Identificar categorias críticas (<50%)
- [ ] Listar todos os problemas transversais críticos
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

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE VERCEL - RELATÓRIO COMPLETO
=======================================================

PONTUAÇÃO GERAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

ARQUITETURA        : XX/25  [██████████░░░░░░░░░░] XX%
QUALIDADE DE CÓDIGO: XX/25  [██████████░░░░░░░░░░] XX%
TESTES             : XX/25  [██████████░░░░░░░░░░] XX%
SEGURANÇA          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTOS FORTES GERAIS:
1. [Ponto forte identificado em múltiplas categorias]
2. [Outro ponto forte principal]
3. [Terceiro ponto forte]

MELHORIAS GERAIS:
1. [Melhoria transversal menor]
2. [Outra melhoria recomendada]
3. [Terceira melhoria]

PROBLEMAS CRÍTICOS:
1. [Problema crítico nº 1 - categoria afetada]
2. [Problema crítico nº 2 - categoria afetada]
3. [Problema crítico nº 3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Schema vercel.json            : XX/6
  • rewrites/redirects/headers    : XX/6
  • regions & functions           : XX/5
  • Configuração crons[]          : XX/4
  • Formato do projeto            : XX/4

Pontos Fortes:
- [Pontos fortes de arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções semelhantes para Qualidade de Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação nº 1]
   Categoria : [Arquitetura/Qualidade/Testes/Segurança]
   Impacto   : [Alto/Médio/Baixo]
   Esforço   : [Alto/Médio/Baixo]
   Prioridade: IMEDIATA

   Descrição detalhada:
   [Explicação do problema e solução proposta]

   Arquivos afetados:
   - [arquivo:linha]

   Exemplo de correção:
   [Código ou comando de correção]

2. IMPORTANTE - [Ação nº 2]
   [Mesmo formato...]

3. RECOMENDADO - [Ação nº 3]
   [Mesmo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GANHOS RÁPIDOS (Alto Impacto / Baixo Esforço):

- [Ganho rápido nº 1] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Ganho rápido nº 2] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Ganho rápido nº 3] - Categoria: [X] - Impacto: [X] - Esforço: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica nº 1]
- [ ] [Ganho rápido prioritário]

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante nº 2]
- [ ] [Outros ganhos rápidos]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada nº 3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de síntese sobre o estado geral do projeto, principais pontos
fortes, principais pontos fracos e a trajetória recomendada para melhorar
a conformidade. Indicar se o projeto está pronto para produção,
requer correções ou necessita de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração significativa / Revisão completa necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com arquivo:linha para cada problema
- Priorizar ações com base na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima
- Propor correções automatizáveis (scripts, hooks de pré-commit)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao contexto de negócio do projeto
- Um endpoint Cron sem proteção e um segredo fixo no código são SEMPRE a prioridade máxima quando encontrados
- Um `runtime: 'edge'` em código novo ou modificado é sempre sinalizado, mas é dívida de migração (não uma falha bloqueante) em código legado não modificado
- NÃO avaliar roteamento/renderização/data-fetching específicos do Next.js — fora do escopo (ver `/react:*`, `/vuejs:*`, `/angular:*`)
