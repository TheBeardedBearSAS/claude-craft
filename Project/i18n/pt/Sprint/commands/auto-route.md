---
description: Executar as regras de roteamento automatico para transicoes de stories
argument-hint: [--dry-run]
---

# Sprint Auto Route

Executar as regras de roteamento automatico para transicionar as stories com base em seu estado atual e metricas de conclusao.

## Argumentos

$ARGUMENTS (formato: [--dry-run])
- **--dry-run** (opcional): Pre-visualizar as transicoes sem aplica-las

## Processo

### Etapa 1: Carregar o status do sprint

1. Ler `.bmad/sprint-status.yaml`
2. Carregar as regras de roteamento de `routing.auto_transitions.rules`
3. Obter todas as stories

### Etapa 2: Avaliar as regras

Para cada story, avaliar todas as regras de roteamento:

**Regra: all_tasks_complete**
```yaml
when: "tasks.completed == tasks.total && tasks.total > 0"
from: "in-progress"
to: "review"
```

**Regra: review_approved**
```yaml
when: "review.approved == true"
from: "review"
to: "done"
```

**Regra: blocked_detection**
```yaml
when: "blocked_reason != null"
from: "*"
to: "blocked"
```

**Regra: unblocked**
```yaml
when: "blocked_reason == null && previous_status != null"
from: "blocked"
to: "previous_status"
```

### Etapa 3: Verificar os pre-requisitos

Antes da auto-transicao, verificar:
- Requisitos do gate para o status de destino
- Nenhuma regra conflitante
- Story nao bloqueada manualmente

### Etapa 4: Executar as transicoes (exceto --dry-run)

Para cada regra acionada:
1. Registrar a transicao
2. Atualizar o status
3. Registrar no historico com `by: "auto-route"`
4. Aplicar os efeitos colaterais (fase TDD, etc.)

### Etapa 5: Relatar os resultados

Exibir:
- Numero de regras avaliadas
- Transicoes realizadas
- Stories sem alteracao
- Erros ou alertas eventuais

## Formato de Saida

### Dry Run

```
═══════════════════════════════════════════════════════
           Pre-visualizacao Auto-Route (DRY RUN)
═══════════════════════════════════════════════════════

Avaliando 4 regras de roteamento contra 8 stories...

Transicionaria:
──────────────────────────────────────────────────────
📖 US-005: Autenticacao de usuario
   Regra: all_tasks_complete
   in-progress → review
   Motivo: 5/5 tarefas concluidas

📖 US-008: Verificacao de email
   Regra: all_tasks_complete
   in-progress → review
   Motivo: 3/3 tarefas concluidas

📖 US-003: Integracao OAuth
   Regra: unblocked
   blocked → in-progress
   Motivo: blocked_reason removido

Resumo:
──────────────────────────────────────────────────────
Regras avaliadas: 4
Stories verificadas: 8
Transicionaria: 3
Sem alteracao necessaria: 5

Executar sem --dry-run para aplicar as transicoes.
═══════════════════════════════════════════════════════
```

### Transicoes Aplicadas

```
═══════════════════════════════════════════════════════
              Resultados Auto-Route
═══════════════════════════════════════════════════════

Avaliando 4 regras de roteamento contra 8 stories...

Transicoes aplicadas:
──────────────────────────────────────────────────────
✅ US-005: in-progress → review
   Regra: all_tasks_complete
   Tarefas: 5/5 concluidas

✅ US-008: in-progress → review
   Regra: all_tasks_complete
   Tarefas: 3/3 concluidas

✅ US-003: blocked → in-progress
   Regra: unblocked
   Status anterior restaurado

Resumo:
──────────────────────────────────────────────────────
Regras avaliadas: 4
Stories verificadas: 8
Transicionadas: 3
Sem alteracao necessaria: 5

Status do sprint atualizado. Executar /sprint:status --bmad para ver.
═══════════════════════════════════════════════════════
```

### Nenhuma Transicao Necessaria

```
═══════════════════════════════════════════════════════
              Resultados Auto-Route
═══════════════════════════════════════════════════════

Avaliando 4 regras de roteamento contra 8 stories...

Nenhuma transicao automatica necessaria.
──────────────────────────────────────────────────────
Todas as stories estao em estados apropriados de acordo
com suas metricas de conclusao atuais.

Stories por status:
  📋 Backlog:      2
  🎯 Ready:        3
  🔄 Em andamento: 2 (tarefas pendentes)
  ✅ Done:         1
═══════════════════════════════════════════════════════
```

## Exemplo

```
/sprint:auto-route --dry-run
/sprint:auto-route
```

## Regras Personalizadas

Adicionar regras personalizadas em `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    rules:
      # Regra personalizada: story muito tempo em review
      - name: "review_timeout"
        description: "Sinalizar stories em review > 2 dias"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify

      # Regra personalizada: prioridade alta primeiro
      - name: "priority_bump"
        description: "Auto-atribuir stories de alta prioridade"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

## Integracao

O auto-route pode ser acionado:
1. Manualmente via este comando
2. Automaticamente no hook Stop
3. Apos conclusao de uma tarefa
4. No inicio da sessao (configuravel)

Configurar em `.bmad/sprint-status.yaml`:
```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
```

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Pegar a próxima story roteada                         ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Iniciar o desenvolvimento                             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
