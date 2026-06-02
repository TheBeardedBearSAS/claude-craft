---
description: Verificar Conformidade Completa do Flutter
argument-hint: [arguments]
---

# Verificar Conformidade Completa do Flutter

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

Realizar uma auditoria de conformidade completa do projeto Flutter orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação geral de 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (pubspec.yaml, analysis_options.yaml)
- [ ] Listar os diretórios principais (lib/, test/, android/, ios/, etc.)
- [ ] Identificar a estrutura do projeto e a versão do Flutter

**Nota**: Se $ARGUMENTS for fornecido, usá-lo como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Usar o slash command `/flutter:check-architecture` ou seguir manualmente as etapas em `check-architecture.md`

**Critérios Avaliados**:
- Organização das camadas de Clean Architecture (6 pts)
- Separação Domain/Data/Presentation (6 pts)
- Injeção de dependências (get_it, injectable, riverpod) (4 pts)
- Estrutura modular baseada em features (4 pts)
- Princípios SOLID na arquitetura (3 pts)
- Utilitários Core/Shared (2 pts)

**Referência**: `check-architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Usar o slash command `/flutter:check-code-quality` ou seguir manualmente as etapas em `check-code-quality.md`

**Critérios Avaliados**:
- Convenções Effective Dart (5 pts)
- Flutter analyze (zero avisos) (5 pts)
- Rigor de linting e analysis_options (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Documentação com comentários /// (4 pts)
- Tratamento de erros (3 pts)

**Referência**: `check-code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Usar o slash command `/flutter:check-testing` ou seguir manualmente as etapas em `check-testing.md`

**Critérios Avaliados**:
- Cobertura de código (7 pts)
- Testes unitários para domain e data (6 pts)
- Testes de widget para UI (4 pts)
- Testes de integração (3 pts)
- Qualidade dos testes e padrão AAA (3 pts)
- Mocks (mockito/mocktail) e fixtures (2 pts)

**Referência**: `check-testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Usar o slash command `/flutter:check-security` ou seguir manualmente as etapas em `check-security.md`

**Critérios Avaliados**:
- Segredos e credenciais hardcoded (6 pts)
- Segurança de rede (HTTPS, SSL/TLS) (5 pts)
- Armazenamento de dados sensíveis (flutter_secure_storage) (4 pts)
- Vulnerabilidades de dependências (4 pts)
- Permissões de plataforma (Android/iOS) (3 pts)
- Validação de entrada (2 pts)
- Ofuscação no release (1 pt)

**Referência**: `check-security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação geral e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máximo 100 pontos)
- [ ] Identificar categorias críticas (<50%)
- [ ] Listar todos os problemas transversais críticos
- [ ] Priorizar ações por impacto/esforço
- [ ] Produzir o relatório final consolidado

**Escala de Avaliação**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Pequenas melhorias necessárias
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração significativa necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir recomendações finais:
- [ ] Identificar as 3 ações prioritárias em todas as categorias
- [ ] Estimar esforço (Baixo/Médio/Alto) para cada ação
- [ ] Estimar impacto (Baixo/Médio/Alto) para cada ação
- [ ] Propor ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE FLUTTER - RELATÓRIO COMPLETO
=============================================

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
1. [Problema crítico #1 - categoria afetada]
2. [Problema crítico #2 - categoria afetada]
3. [Problema crítico #3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Sub-pontuações:
  • Camadas Clean Architecture   : XX/6
  • Separação de camadas         : XX/6
  • Injeção de dependências      : XX/4
  • Módulos baseados em features : XX/4
  • Princípios SOLID             : XX/3
  • Utilitários Core/Shared      : XX/2

Pontos Fortes:
- [Pontos fortes de arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções similares para Qualidade de Código, Testes e Segurança...]

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

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, pontos fortes
principais, principais fraquezas e trajetória recomendada para melhorar
a conformidade. Indicar se o projeto está pronto para produção,
requer correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração significativa / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Usar Docker para todas as ferramentas de análise
- Fornecer exemplos concretos com arquivo:linha para cada problema
- Priorizar ações com base na matriz de Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima
- Propor correções automatizáveis (scripts, pre-commit hooks)
- O relatório deve ser acionável, não apenas descritivo
- Adaptar as recomendações ao contexto de negócio do projeto
