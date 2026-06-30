---
description: "Validar as stories do backlog contra os critérios INVEST"
argument-hint: "[story-id] [--no-gate]"
---

# Validar Gate Backlog

Validar as User Stories contra os critérios INVEST.
Todas as stories devem passar nos 6 critérios INVEST.

## Argumentos

$ARGUMENTS (formato: [story-id] [--no-gate])
- **story-id** (opcional): Story específica a validar (ex: US-001). Se omitido, valida todas as stories.
- **--no-gate** (opcional): Executar apenas a validação INVEST simples (ignorar a aplicação do gate de qualidade, os limiares de pontuação e o veredicto passa/falha). Útil para verificações rápidas durante o refinement sem bloquear nos critérios do gate.

## Critérios INVEST

| Letra | Critério | Descrição | Verificações |
|-------|----------|-----------|--------------|
| **I** | Independente | Pode ser desenvolvida isoladamente | Sem dependências bloqueadoras |
| **N** | Negociável | Os detalhes podem ser discutidos | Possui descrição, não super-especificada |
| **V** | Valiosa | Agrega valor ao usuário | Possui critérios de aceitação, declaração de benefício |
| **E** | Estimável | Pode ser estimada | Possui story points |
| **S** | Suficientemente pequena | Cabe em um sprint | ≤ 8 story points |
| **T** | Testável | Pode ser testada | Possui critérios de aceitação |

**Limite: 6/6 para cada story**

## Processo

### Passo 1: Carregar as stories

1. Ler `.bmad/sprint-status.yaml`
2. Obter a story especificada ou todas as stories
3. Carregar os detalhes de cada story

### Passo 2: Validar INVEST para cada story

Para cada critério:
- **Independente**: Verificar que `blocked_by` está vazio
- **Negociável**: Verificar o comprimento da descrição e o número de tarefas
- **Valiosa**: Verificar que os critérios de aceitação existem
- **Estimável**: Verificar que os story points > 0
- **Suficientemente pequena**: Verificar que os story points ≤ 8
- **Testável**: Verificar que o número de critérios de aceitação > 0

### Passo 3: Calcular as pontuações

Pontuação INVEST por story (0-6)

### Passo 4: Gerar o relatório

Mostrar resultados individuais e agregados.

## Formato de Saída

### Todas as Stories Aprovadas

```
═══════════════════════════════════════════════════════
          Validação Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Login de usuário
   [I] ✓ Independente - Sem dependências
   [N] ✓ Negociável - Descrição clara
   [V] ✓ Valiosa - 3 critérios de aceitação
   [E] ✓ Estimável - 5 story points
   [S] ✓ Suficientemente pequena - 5 ≤ 8 pontos
   [T] ✓ Testável - CA Gherkin definidos
   Pontuação: 6/6 ✅

✅ US-002: Cadastro de usuário
   Pontuação: 6/6 ✅

Resumo:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprovadas (6/6): 8
Alertas (4-5/6): 0
Reprovadas (<4/6): 0

✅ GATE BACKLOG APROVADO

Todas as stories atendem os critérios INVEST.
Pronto para o planejamento do sprint.
═══════════════════════════════════════════════════════
```

### Stories Reprovadas

```
═══════════════════════════════════════════════════════
          Validação Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Login de usuário
   Pontuação: 6/6 ✅

⚠️ US-002: Cadastro de usuário
   [I] ✓ Independente
   [N] ✓ Negociável
   [V] ✓ Valiosa
   [E] ✗ Estimável - Sem story points
   [S] ? Suficientemente pequena - Não é possível verificar sem pontos
   [T] ✓ Testável
   Pontuação: 4/6 ⚠️

❌ US-003: Refatoração completa do sistema auth
   [I] ✗ Independente - Bloqueada por US-001, US-002
   [N] ✗ Negociável - 15 tarefas (muito especificada)
   [V] ✓ Valiosa
   [E] ✓ Estimável - 13 pontos
   [S] ✗ Suficientemente pequena - 13 > 8 pontos
   [T] ✓ Testável
   Pontuação: 3/6 ❌

Resumo:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprovadas (6/6): 6
Alertas (4-5/6): 1
Reprovadas (<4/6): 1

❌ GATE BACKLOG REPROVADO

Ações Necessárias:
──────────────────────────────────────────────────────
US-002:
  → Adicionar a estimativa em story points
  → Executar: /project:update-story US-002 --points 3

US-003:
  → Dividir em stories menores (≤8 pontos cada)
  → Remover detalhes de tarefas desnecessários
  → Resolver dependências ou reordenar
  → Considerar: /project:split-story US-003

Reexecutar após correções: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

### Validação de Story Única

```
═══════════════════════════════════════════════════════
          Validação INVEST: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificação de email

Análise INVEST:
──────────────────────────────────────────────────────
[I] ✓ Independente
    Sem dependências bloqueadoras

[N] ✓ Negociável
    Descrição: 45 palavras
    Tarefas: 4 (razoável)

[V] ✓ Valiosa
    "Como usuário, quero verificar meu email
     para poder proteger minha conta"
    Critérios de aceitação: 3

[E] ✓ Estimável
    Story Points: 3

[S] ✓ Suficientemente pequena
    3 pontos ≤ 8 pontos

[T] ✓ Testável
    3 cenários Gherkin definidos

Pontuação: 6/6 ✅
──────────────────────────────────────────────────────

✅ Story atende os critérios INVEST

Status: ready-for-dev
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Correção de Problemas Comuns

### Story muito grande (S)
```
/project:split-story US-003
```

### Story points faltando (E)
```
/project:update-story US-002 --points 3
```

### Critérios de aceitação faltando (V, T)
```
/project:add-ac US-002 "Given... When... Then..."
```

Configuração do gate: `.bmad/gates/backlog-gate.yaml`

## Próximo Passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Se PASS (≥ limiar):                                     ║
║  → /gate:validate-sprint                                 ║
║    Validar a prontidão do sprint                         ║
║                                                          ║
║  Se FAIL (< limiar):                                     ║
║  → Corrigir os problemas identificados                   ║
║  → /gate:validate-backlog (re-run após correções)        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
