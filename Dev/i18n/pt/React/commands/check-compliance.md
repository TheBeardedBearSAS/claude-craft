---
description: Verificar Conformidade Completa React
argument-hint: [arguments]
---

# Verificar Conformidade Completa React

## Argumentos

$ARGUMENTS (opcional: caminho do projeto a analisar)

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

Realizar uma auditoria de conformidade completa do projeto React orquestrando as 4 grandes verificações: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação global de 100 pontos.

### Passo 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (package.json, tsconfig.json)
- [ ] Listar os diretórios principais (src/, tests/, public/, etc.)
- [ ] Identificar a estrutura do projeto e a versão do React

**Nota**: Se $ARGUMENTS fornecido, usar como caminho do projeto; caso contrário, usar o diretório atual.

### Passo 2: Auditoria de Arquitetura (25 pontos)

Executar verificação completa de arquitetura:

**Comando**: Usar o slash command `/react:check-architecture` ou seguir manualmente os passos em `check-architecture.md`

**Critérios Avaliados**:
- Estrutura baseada em features (6 pts)
- Organização de componentes e colocation (6 pts)
- Padrões de gerenciamento de estado (4 pts)
- Roteamento e navegação (4 pts)
- Separação do módulo compartilhado/comum (3 pts)
- Regras de dependência e exportações barrel (2 pts)

**Referência**: `check-architecture.md`

### Passo 3: Auditoria de Qualidade de Código (25 pontos)

Executar verificação de qualidade de código:

**Comando**: Usar o slash command `/react:check-code-quality` ou seguir manualmente os passos em `check-code-quality.md`

**Critérios Avaliados**:
- Modo estrito TypeScript e segurança de tipos (5 pts)
- Conformidade com ESLint e Prettier (5 pts)
- Padrões React e regras de hooks (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Convenções de nomenclatura (4 pts)
- Tratamento de erros e error boundaries (3 pts)

**Referência**: `check-code-quality.md`

### Passo 4: Auditoria de Testes (25 pontos)

Executar verificação de testes:

**Comando**: Usar o slash command `/react:check-testing` ou seguir manualmente os passos em `check-testing.md`

**Critérios Avaliados**:
- Cobertura de código (7 pts)
- Testes unitários para hooks e utilitários (6 pts)
- Testes de componentes com Testing Library (4 pts)
- Testes de integração (3 pts)
- Qualidade dos testes e padrão AAA (3 pts)
- Organização de mocks e fixtures (2 pts)

**Referência**: `check-testing.md`

### Passo 5: Auditoria de Segurança (25 pontos)

Executar verificação de segurança:

**Comando**: Usar o slash command `/react:check-security` ou seguir manualmente os passos em `check-security.md`

**Critérios Avaliados**:
- Prevenção de XSS (dangerouslySetInnerHTML) (6 pts)
- Gerenciamento de segredos e credenciais (5 pts)
- Validação e sanitização de entradas (4 pts)
- Vulnerabilidades em dependências (4 pts)
- Autenticação e autorização (3 pts)
- Comunicação segura com a API (2 pts)
- Proteção contra CSRF (1 pt)

**Referência**: `check-security.md`

### Passo 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máximo 100 pontos)
- [ ] Identificar categorias críticas (<50%)
- [ ] Listar todos os problemas críticos transversais
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Avaliação**:
- 90-100: Excelente — Projeto de referência
- 75-89: Muito Bom — Algumas melhorias pontuais
- 60-74: Aceitável — Requer melhorias
- 40-59: Insuficiente — Refatoração importante necessária
- 0-39: Crítico — Reformulação completa necessária

### Passo 7: Recomendações e Plano de Ação

Produzir recomendações finais:
- [ ] Identificar as 3 ações prioritárias em todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE REACT - RELATÓRIO COMPLETO
=====================================================

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
2. [Outro ponto forte importante]
3. [Terceiro ponto forte]

MELHORIAS GERAIS:
1. [Melhoria transversal menor]
2. [Outra melhoria recomendada]
3. [Terceira melhoria]

PROBLEMAS CRÍTICOS:
1. [Problema crítico nº 1 — categoria afetada]
2. [Problema crítico nº 2 — categoria afetada]
3. [Problema crítico nº 3 — categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Estrutura baseada em features    : XX/6
  • Organização de componentes       : XX/6
  • Gerenciamento de estado          : XX/4
  • Roteamento e navegação           : XX/4
  • Separação do módulo compartilhado: XX/3
  • Regras de dependência            : XX/2

Pontos Fortes:
- [Pontos fortes de arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções similares para Qualidade de Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação nº 1]
   Categoria  : [Arquitetura/Qualidade/Testes/Segurança]
   Impacto    : [Alto/Médio/Baixo]
   Esforço    : [Alto/Médio/Baixo]
   Prioridade : IMEDIATA

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

QUICK WINS (Alto Impacto / Baixo Esforço):

- [Quick win nº 1] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win nº 2] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win nº 3] - Categoria: [X] - Impacto: [X] - Esforço: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica nº 1]
- [ ] [Quick win prioritário]

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante nº 2]
- [ ] [Outros quick wins]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada nº 3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de síntese sobre o estado geral do projeto, principais pontos
fortes, principais pontos fracos e a trajetória recomendada para melhorar
a conformidade. Mencionar se o projeto está pronto para produção,
requer correções ou necessita de refatoração.]

Recomendação Geral: [Pronto para produção / Correções pontuais /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com arquivo:linha para cada problema
- Priorizar ações com base na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima
- Propor correções automatizáveis (scripts, pre-commit hooks)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao contexto de negócio do projeto
