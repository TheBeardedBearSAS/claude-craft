---
description: Verificar Conformidade Completa Python
argument-hint: [arguments]
---

# Verificar Conformidade Completa Python

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## MISSÃO

Realizar uma auditoria completa de conformidade do projeto Python orquestrando as 4 verificações principais: Arquitetura, Qualidade do Código, Testes e Segurança. Produzir um relatório consolidado com pontuação geral de 100 pontos.

### Passo 1: Preparação da Auditoria

Preparar ambiente de auditoria:
- [ ] Identificar caminho do projeto a auditar
- [ ] Verificar presença de arquivos de configuração (pyproject.toml, requirements.txt)
- [ ] Listar diretórios principais (src/, tests/, etc.)
- [ ] Identificar estrutura do projeto

**Nota**: Se $ARGUMENTS fornecido, usar como caminho do projeto, caso contrário usar diretório atual.

### Passo 2: Auditoria de Arquitetura (25 pontos)

Executar verificação completa de arquitetura:

**Comando**: Usar comando slash `/check-architecture` ou seguir manualmente os passos em `check-architecture.md`

**Critérios Avaliados**:
- Estrutura e separação de camadas (6 pts)
- Respeito às dependências (6 pts)
- Ports and Adapters (4 pts)
- Modelagem do domínio (4 pts)
- Use Cases e Services (3 pts)
- Princípios SOLID (2 pts)

**Referência**: `claude-commands/python/check-architecture.md`

### Passo 3: Auditoria de Qualidade do Código (25 pontos)

Executar verificação de qualidade do código:

**Comando**: Usar comando slash `/check-code-quality` ou seguir manualmente os passos em `check-code-quality.md`

**Critérios Avaliados**:
- PEP8 e formatação (5 pts)
- Type hints e MyPy (5 pts)
- Ruff linting (4 pts)
- KISS/DRY/YAGNI (4 pts)
- Documentação (4 pts)
- Tratamento de erros (3 pts)

**Referência**: `claude-commands/python/check-code-quality.md`

### Passo 4: Auditoria de Testes (25 pontos)

Executar verificação de testes:

**Comando**: Usar comando slash `/check-testing` ou seguir manualmente os passos em `check-testing.md`

**Critérios Avaliados**:
- Cobertura de código (7 pts)
- Testes unitários (6 pts)
- Testes de integração (4 pts)
- Qualidade de assertions (3 pts)
- Fixtures e organização (3 pts)
- Performance (2 pts)

**Referência**: `claude-commands/python/check-testing.md`

### Passo 5: Auditoria de Segurança (25 pontos)

Executar verificação de segurança:

**Comando**: Usar comando slash `/check-security` ou seguir manualmente os passos em `check-security.md`

**Critérios Avaliados**:
- Scan Bandit (6 pts)
- Secrets e credenciais (5 pts)
- Validação de entrada (4 pts)
- Dependências seguras (4 pts)
- Tratamento de erros (3 pts)
- Auth/Authz (2 pts)
- Injections (1 pt)

**Referência**: `claude-commands/python/check-security.md`

### Passo 6: Consolidação e Pontuação Global

Calcular pontuação geral e produzir relatório consolidado:
- [ ] Somar as 4 pontuações (máx 100 pontos)
- [ ] Identificar categorias críticas (<50%)
- [ ] Listar todos os problemas críticos transversais
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir relatório final consolidado

**Escala de Avaliação**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Passo 7: Recomendações e Plano de Ação

Produzir recomendações finais:
- [ ] Identificar top 3 ações prioritárias em todas as categorias
- [ ] Estimar esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE PYTHON - RELATÓRIO COMPLETO
=============================================

PONTUAÇÃO GERAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

ARQUITETURA        : XX/25  [██████████░░░░░░░░░░] XX%
QUALIDADE CÓDIGO   : XX/25  [██████████░░░░░░░░░░] XX%
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
1. [Problema crítico #1 - categoria afetada]
2. [Problema crítico #2 - categoria afetada]
3. [Problema crítico #3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Estrutura e camadas     : XX/6
  • Dependências            : XX/6
  • Ports and Adapters      : XX/4
  • Modelagem Domínio       : XX/4
  • Use Cases               : XX/3
  • Princípios SOLID        : XX/2

Pontos Fortes:
- [Pontos fortes da arquitetura]

Problemas:
- [Problemas da arquitetura]

[Seções similares para Qualidade do Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICO - [Ação #1]
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

SEMANA 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MÊS 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REFERÊNCIAS:

Arquitetura       : rules/02-architecture.md
Padrões Código    : rules/03-coding-standards.md
SOLID             : rules/04-solid-principles.md
KISS/DRY/YAGNI    : rules/05-kiss-dry-yagni.md
Ferramentas       : rules/06-tooling.md
Testes            : rules/07-testing.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo resumindo estado geral do projeto, principais pontos fortes,
principais fraquezas e trajetória recomendada para melhorar
conformidade. Mencionar se o projeto está pronto para produção,
requer correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com arquivo:linha para cada problema
- Priorizar ações baseado na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE prioridade máxima
- Propor correções automatizáveis (scripts, hooks de pre-commit)
- Relatório deve ser acionável, não apenas descritivo
- Adaptar recomendações ao contexto de negócio do projeto
