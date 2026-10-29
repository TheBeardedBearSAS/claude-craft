# Verificar Conformidade Completa do C#/.NET

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

Realizar uma auditoria de conformidade completa do projeto C#/.NET orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação geral de 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença de arquivos de configuração (.sln, .csproj, Directory.Build.props)
- [ ] Listar os diretórios principais (src/, tests/, etc.)
- [ ] Identificar a estrutura do projeto e a versão do .NET

**Nota**: Se $ARGUMENTS for fornecido, utilizá-lo como caminho do projeto; caso contrário, usar o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Usar o slash command `/csharp:check architecture` ou seguir manualmente os passos em `.claude/references/csharp/checks/architecture.md`

**Critérios Avaliados**:
- Separação de camadas da Clean Architecture (6 pts)
- Fluxo de dependências (o Domain não possui referências externas) (6 pts)
- Padrões CQRS e MediatR (4 pts)
- Modelagem DDD (Entidades, Value Objects, Agregados) (4 pts)
- Padrões Repository e Unit of Work (3 pts)
- Referências de projetos e regras de dependência (2 pts)

**Referência**: `.claude/references/csharp/checks/architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Usar o slash command `/csharp:check code-quality` ou seguir manualmente os passos em `.claude/references/csharp/checks/code-quality.md`

**Critérios Avaliados**:
- Convenções de nomenclatura (PascalCase, _camelCase) (5 pts)
- Recursos modernos do C# (records, pattern matching) (5 pts)
- Tipos de referência anuláveis habilitados (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Padrões async/await (sem .Result/.Wait()) (4 pts)
- Documentação e comentários XML (3 pts)

**Referência**: `.claude/references/csharp/checks/code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Usar o slash command `/csharp:check testing` ou seguir manualmente os passos em `.claude/references/csharp/checks/testing.md`

**Critérios Avaliados**:
- Cobertura de código (7 pts)
- Testes unitários do Domain e da Application (6 pts)
- Testes de integração da Infrastructure (4 pts)
- Qualidade do FluentAssertions (3 pts)
- Organização de testes e fixtures (3 pts)
- Padrões de mocking (Moq/NSubstitute) (2 pts)

**Referência**: `.claude/references/csharp/checks/testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Usar o slash command `/csharp:check security` ou seguir manualmente os passos em `.claude/references/csharp/checks/security.md`

**Critérios Avaliados**:
- Proteções OWASP Top 10 (6 pts)
- Gerenciamento de segredos e credenciais (5 pts)
- Validação de entradas (FluentValidation) (4 pts)
- Vulnerabilidades de dependências (4 pts)
- Autenticação e autorização (3 pts)
- Configuração segura (2 pts)
- Prevenção de injeção SQL (1 pt)

**Referência**: `.claude/references/csharp/checks/security.md`

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
- [ ] Propor uma ordem de implementação
- [ ] Sugerir ganhos rápidos (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE C#/.NET - RELATÓRIO COMPLETO
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
  • Camadas da Clean Architecture  : XX/6
  • Fluxo de dependências          : XX/6
  • CQRS e MediatR                 : XX/4
  • Modelagem DDD                  : XX/4
  • Padrões Repository             : XX/3
  • Referências de projetos        : XX/2

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
