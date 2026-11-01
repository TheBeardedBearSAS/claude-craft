# Verificação Completa de Conformidade Ruby / Rails

## Argumentos

$ARGUMENTS (opcional: caminho do projeto a analisar)

## Modo Plan

> O modo Plan é ativado automaticamente quando o escopo abrange vários módulos ou exige uma investigação transversal.

## MISSÃO

Realizar uma auditoria completa de conformidade do projeto Ruby on Rails orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação global sobre 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (Gemfile, Gemfile.lock, .rubocop.yml, config/ci.rb, spec/ ou test/)
- [ ] Listar os diretórios principais (app/, config/, db/, spec/ ou test/, lib/)
- [ ] Identificar a versão do Ruby (`.ruby-version`) e a versão do Rails (`Gemfile.lock`)

**Nota**: Se $ARGUMENTS for informado, use-o como caminho do projeto; caso contrário, use o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Use o slash command `/ruby:check architecture` ou siga manualmente as etapas de `.claude/references/ruby/checks/architecture.md`

**Critérios Avaliados**:
- Convenções Rails e layout de `app/` (6 pts)
- Controllers enxutos e disciplina de fat model (6 pts)
- Service, form e query objects onde justificados (4 pts)
- Uso do Active Record: associações, scopes, prevenção de N+1 (4 pts)
- Jobs em segundo plano, cache e uso do Hotwire (3 pts)
- Autoloading Zeitwerk e direção das dependências (2 pts)

**Referência**: `.claude/references/ruby/checks/architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Use o slash command `/ruby:check code-quality` ou siga manualmente as etapas de `.claude/references/ruby/checks/code-quality.md`

**Critérios Avaliados**:
- Conformidade com o RuboCop (rubocop-rails-omakase ou configuração do projeto) (5 pts)
- Style guide Ruby, nomenclatura e `# frozen_string_literal: true` (5 pts)
- Tipagem opcional (RBS/Steep ou Sorbet) e documentação (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Tamanho e complexidade dos métodos (4 pts)
- Tratamento de erros (3 pts)

**Referência**: `.claude/references/ruby/checks/code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Use o slash command `/ruby:check testing` ou siga manualmente as etapas de `.claude/references/ruby/checks/testing.md`

**Critérios Avaliados**:
- Cobertura de código (SimpleCov, meta >= 80%) (7 pts)
- Testes unitários de models e services (6 pts)
- Testes de request, job e system (Capybara) (4 pts)
- Qualidade do RSpec / Minitest (3 pts)
- Dados de fixtures / FactoryBot (3 pts)
- Isolamento dos testes e mocking (2 pts)

**Referência**: `.claude/references/ruby/checks/testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Use o slash command `/ruby:check security` ou siga manualmente as etapas de `.claude/references/ruby/checks/security.md`

**Critérios Avaliados**:
- Proteções OWASP Top 10:2025 (6 pts)
- Gerenciamento de segredos e credentials (5 pts)
- Strong parameters, validação de entrada e escape de saída (4 pts)
- Vulnerabilidades de dependências (bundler-audit, Brakeman) (4 pts)
- Autenticação, autorização e rate limiting (3 pts)
- Configuração segura (CSP, SSL, cookies) (2 pts)
- Prevenção de SQL injection (1 pt)

**Referência**: `.claude/references/ruby/checks/security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação global e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máx. 100 pontos)
- [ ] Identificar as categorias críticas (<50%)
- [ ] Listar todos os problemas críticos transversais
- [ ] Priorizar as ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Notas**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 ações prioritárias entre todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) de cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) de cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE RUBY / RAILS - RELATÓRIO COMPLETO
===========================================================

PONTUAÇÃO GLOBAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

ARQUITETURA        : XX/25  [██████████░░░░░░░░░░] XX%
QUALIDADE DE CÓDIGO: XX/25  [██████████░░░░░░░░░░] XX%
TESTES             : XX/25  [██████████░░░░░░░░░░] XX%
SEGURANÇA          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTOS FORTES GERAIS:
1. [Ponto forte identificado em várias categorias]
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
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Convenções Rails / layout de app : XX/6
  • Controllers / models enxutos     : XX/6
  • Service, form, query objects     : XX/4
  • Uso do Active Record             : XX/4
  • Jobs, cache, Hotwire             : XX/3
  • Zeitwerk e dependências          : XX/2

Pontos fortes:
- [Pontos fortes da arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções semelhantes para Qualidade de Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICA - [Ação #1]
   Categoria : [Arquitetura/Qualidade/Testes/Segurança]
   Impacto   : [Alto/Médio/Baixo]
   Esforço   : [Alto/Médio/Baixo]
   Prioridade: IMEDIATA

   Descrição detalhada:
   [Explicação do problema e da solução proposta]

   Arquivos afetados:
   - [arquivo:linha]

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

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, principais
pontos fortes, principais fraquezas e a trajetória recomendada para
melhorar a conformidade. Mencione se o projeto está pronto para
produção, requer correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Use Docker para todas as ferramentas de análise (`docker compose exec app ...`)
- Forneça exemplos concretos com arquivo:linha para cada problema
- Priorize as ações com base na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima
- Proponha correções automatizáveis (scripts, hooks de pre-commit, etapas do `bin/ci`)
- O relatório deve ser acionável, não apenas descritivo
- Adapte as recomendações ao contexto de negócio do projeto
- Rails Way primeiro: não penalize um projeto por não ter camadas hexagonais quando as convenções são seguidas
