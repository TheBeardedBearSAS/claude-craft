---
description: Exibir o status da fila de processamento batch
argument-hint: [--history]
---

# Batch Status

Exibir o status atual da fila de processamento batch.

## Argumentos

$ARGUMENTS (formato: [--history])
- **--history** (opcional): Exibir o historico das stories concluidas/falhadas

## Processo

### Etapa 1: Carregar a fila

1. Ler `.bmad/batch-queue.yaml`
2. Analisar as entradas da fila
3. Carregar os dados de checkpoint

### Etapa 2: Categorizar as stories

Agrupar por status:
- `pending` - Aguardando processamento
- `running` - Em processamento
- `completed` - Concluido com sucesso
- `failed` - Erro encontrado
- `skipped` - Ignorado devido a falha de dependencia

### Etapa 3: Exibir o estado da fila

Exibir o status atual da fila com detalhes.

### Etapa 4: Exibir o historico (se solicitado)

Exibir as stories concluidas e falhadas com timing.

## Formato de Saida

### Fila Ativa

```
═══════════════════════════════════════════════════════
              Status da Fila Batch
═══════════════════════════════════════════════════════

Modo: Sequencial
Checkpoint: US-011 (2026-01-29 10:45:00)

Resumo da fila:
──────────────────────────────────────────────────────
⏳ Pendente:    3
🔄 Em execucao: 1
✅ Concluido:   2
❌ Falhou:      0
⏭️ Ignorado:    0

Total: 6 stories

Em execucao:
──────────────────────────────────────────────────────
🔄 US-012: Pagina de perfil
   Prioridade: 3
   Iniciado: 2026-01-29 10:45:00 (ha 15 min)
   Fase TDD: green
   Tarefa: 2/4

Pendente:
──────────────────────────────────────────────────────
[4] US-013: Redefinicao de senha
    Dependencias: US-010 ✅, US-011 ✅

[5] US-014: Verificacao de email
    Dependencias: US-010 ✅

[6] US-015: Pagina de configuracoes
    Dependencias: nenhuma

Progresso:
──────────────────────────────────────────────────────
██████████░░░░░░░░░░ 50% (3/6 stories)

Conclusao estimada: ~1h 30m
═══════════════════════════════════════════════════════
```

### Com Historico

```
═══════════════════════════════════════════════════════
              Status da Fila Batch
═══════════════════════════════════════════════════════

Modo: Sequencial
Ultimo checkpoint: US-014

Resumo da fila:
──────────────────────────────────────────────────────
⏳ Pendente:    0
🔄 Em execucao: 0
✅ Concluido:   5
❌ Falhou:      1
⏭️ Ignorado:    1

Historico de concluidos:
──────────────────────────────────────────────────────
| Story | Iniciado | Concluido | Duracao |
|-------|----------|-----------|---------|
| US-010 | 10:00 | 10:42 | 42m |
| US-011 | 10:42 | 11:18 | 36m |
| US-012 | 11:18 | 12:05 | 47m |
| US-014 | 12:05 | 12:38 | 33m |
| US-015 | 12:38 | 13:10 | 32m |

Falhou:
──────────────────────────────────────────────────────
❌ US-013: Redefinicao de senha
   Iniciado: 12:05
   Falhou: 12:22
   Duracao: 17m
   Erro: Assertion de teste falhou em PasswordResetTest
   Fase TDD: red

Ignorado:
──────────────────────────────────────────────────────
⏭️ US-016: Painel admin
   Motivo: Depende de US-013 que falhou

Estatisticas:
──────────────────────────────────────────────────────
Tempo total: 3h 10m
Media por story: 38m
Taxa de sucesso: 83% (5/6)
Pontos concluidos: 18/21

Acoes:
──────────────────────────────────────────────────────
Para retentar as stories falhadas:
  /project:queue-retry US-013

Para limpar a fila:
  /project:queue-clear
═══════════════════════════════════════════════════════
```

### Fila Vazia

```
═══════════════════════════════════════════════════════
              Status da Fila Batch
═══════════════════════════════════════════════════════

A fila esta vazia.

Nenhuma story esta atualmente na fila de processamento.

Para adicionar stories:
  /project:run-epic EPIC-001    Colocar um epic na fila
  /project:run-sprint           Colocar as stories do sprint na fila

Ou adicionar uma story individual:
  .bmad/lib/batch-executor.sh add US-001
═══════════════════════════════════════════════════════
```

## Exemplo

```
/project:batch-status
/project:batch-status --history
```

## Gerenciamento da Fila

### Adicionar uma story a fila
```bash
.bmad/lib/batch-executor.sh add US-001 1
```

### Retentar uma story falhada
```
/project:queue-retry US-013
```

### Limpar a fila
```
/project:queue-clear --force
```

### Retomar a partir do checkpoint
```
/project:run-queue --resume
```

## Configuracao

Arquivo da fila: `.bmad/batch-queue.yaml`

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```
