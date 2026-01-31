# {BUG_ID}: [BUG] {TITULO}

## Metadata

- **ID**: {BUG_ID}
- **Tipo**: bug
- **Fonte**: Recette {SESSION_ID}
- **Erro fonte**: {ERROR_ID}
- **Severidade**: {critical|high|medium|low}
- **Sprint**: {SPRINT}
- **Status**: backlog
- **Data**: {DATE}

## Descricao do Bug

**Comportamento atual**: {descricao refinada do comportamento observado}

**Comportamento esperado**: {descricao do comportamento correto esperado}

## Passos de Reproducao

1. {passo 1}
2. {passo 2}
3. {passo 3}

## Causa Raiz

{analise da causa raiz identificada durante o refinamento}

## Criterios de Aceitacao

### AC-1: O bug nao se reproduz mais

```gherkin
GIVEN {contexto}
WHEN {acao que desencadeava o bug}
THEN {comportamento correto}
```

### AC-2: Teste de regressao passa

```gherkin
GIVEN a correcao esta em vigor
WHEN a suite de regressao e executada
THEN todos os testes passam
```

## Arquivos Afetados

- {arquivo 1}
- {arquivo 2}

## Capturas de Tela

<!-- Capturas de tela da sessao recette se disponiveis -->
<!-- Caminho: .recette/sessions/{SESSION_ID}/screenshots/ -->

## Definition of Done

- [ ] Teste RED escrito (reproduz o bug)
- [ ] Correcao GREEN aplicada
- [ ] Refactoring realizado
- [ ] Testes de regressao gerados
- [ ] Registro de regressao atualizado
- [ ] Todos os testes passam
