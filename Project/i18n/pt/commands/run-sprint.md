---
description: Executar todas as stories prontas do sprint atual
argument-hint: [--auto] [--dry-run]
---

# Run Sprint

Colocar na fila e executar todas as stories do sprint atual que estao prontas para desenvolvimento.

## Argumentos

$ARGUMENTS (formato: [--auto] [--dry-run])
- **--auto** (opcional): Iniciar o processamento imediatamente
- **--dry-run** (opcional): Pre-visualizar o plano de execucao sem modificacoes

## Processo

### Etapa 1: Validar o sprint

1. Executar `/gate:validate-sprint` para garantir que o sprint esta pronto
2. Se o gate falhar, exibir os problemas e sair
3. Obter os metadados do sprint

### Etapa 2: Coletar as stories prontas

1. Obter todas as stories com status `ready-for-dev`
2. Ordenar por prioridade (se definida) ou ID
3. Calcular o total de story points

### Etapa 3: Construir o plano de execucao

Criar uma fila ordenada:
1. Analisar as dependencias entre stories
2. Construir o grafo de dependencias
3. Determinar a ordem de execucao
4. Identificar os grupos paralelizaveis

### Etapa 4: Colocar as stories na fila

Adicionar todas as stories a `.bmad/batch-queue.yaml` com:
- Prioridade baseada nas dependencias e ordem
- Dependencias mapeadas
- Status definido como `pending`

### Etapa 5: Executar (se --auto)

Iniciar o processamento da fila:
- Sequencial por padrao
- Usar `--parallel N` para execucao paralela
- Checkpoint apos cada story

## Formato de Saida

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Sprint: sprint-3 (DRY RUN)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestao de Usuarios
Periodo: 2026-01-29 → 2026-02-12

Sprint Gate: ✅ VALIDADO

Stories prontas: 5
Total de Pontos: 21

Plano de execucao:
──────────────────────────────────────────────────────

Fase 1 (sem dependencias):
  📖 US-010: Cadastro de usuario (5 pts)

Fase 2 (apos US-010):
  📖 US-011: Login de usuario (5 pts)
  📖 US-012: Pagina de perfil (5 pts)
  📖 US-014: Verificacao de email (3 pts)

Fase 3 (apos US-010, US-011):
  📖 US-013: Redefinicao de senha (3 pts)

Oportunidades de paralelizacao:
──────────────────────────────────────────────────────
• Fase 2: US-011, US-012, US-014 podem rodar em paralelo
• Paralelismo maximo: 3 stories

Duracao estimada:
──────────────────────────────────────────────────────
Sequencial: ~3.5 horas (media 42 min/story)
Paralelo (3): ~2 horas

⚠️ DRY RUN - Nenhuma modificacao realizada

Para executar:
  /project:run-sprint
  /project:run-sprint --auto
  /project:run-sprint --auto --parallel 3
═══════════════════════════════════════════════════════
```

### Colocando na Fila

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestao de Usuarios
Periodo: 2026-01-29 → 2026-02-12

Validando o sprint...
  ✅ Metadados do sprint completos
  ✅ Sprint goal definido
  ✅ 5 stories prontas
  ✅ Todas as stories estimadas

Colocando stories na fila...
──────────────────────────────────────────────────────
✅ US-010: Cadastro de usuario (prioridade 1)
✅ US-011: Login de usuario (prioridade 2)
✅ US-012: Pagina de perfil (prioridade 3)
✅ US-013: Redefinicao de senha (prioridade 4)
✅ US-014: Verificacao de email (prioridade 5)

Resumo da fila:
──────────────────────────────────────────────────────
Stories na fila: 5
Total de pontos: 21
Dependencias mapeadas: 4

Fila batch atualizada: .bmad/batch-queue.yaml

Para iniciar o processamento:
  /project:run-queue

Ou para execucao automatica:
  /project:run-sprint --auto
═══════════════════════════════════════════════════════
```

### Execucao Auto

```
═══════════════════════════════════════════════════════
              Run Sprint: sprint-3 (AUTO)
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestao de Usuarios

Validando... ✅
Colocando na fila... ✅
Iniciando a execucao...

──────────────────────────────────────────────────────

[1/5] US-010: Cadastro de usuario
      ⏳ Transicao para in-progress
      🔴 TDD Red: Escrevendo testes falhando
      🟢 TDD Green: Implementando o codigo
      🔵 TDD Refactor: Limpeza
      ✅ Testes passando
      👀 Pronto para review
      ✅ Concluido

      Progresso: ████░░░░░░░░░░░░░░░░ 20%

[2/5] US-011: Login de usuario
      ⏳ Transicao para in-progress
      🔴 TDD Red: Escrevendo testes falhando
      ...

Progresso do Sprint:
──────────────────────────────────────────────────────
█████████░░░░░░░░░░░ 45%

Concluido: 2/5 stories (9/21 pts)
Em andamento: US-012 - Pagina de perfil
Tempo decorrido: 1h 23m
Restante estimado: 1h 45m
═══════════════════════════════════════════════════════
```

### Conclusao

```
═══════════════════════════════════════════════════════
              Sprint Concluido!
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestao de Usuarios

Resultados:
──────────────────────────────────────────────────────
✅ Concluido: 5/5 stories
📊 Pontos: 21/21 entregues
⏱️ Duracao: 3h 18min

Resumo das stories:
| Story | Pontos | Duracao | Status |
|-------|--------|---------|--------|
| US-010 | 5 | 45m | ✅ done |
| US-011 | 5 | 38m | ✅ done |
| US-012 | 5 | 52m | ✅ done |
| US-013 | 3 | 28m | ✅ done |
| US-014 | 3 | 35m | ✅ done |

Quality Gates:
──────────────────────────────────────────────────────
✅ Todas as stories passaram na DoD
✅ Todos os testes passando
✅ Codigo revisado

Status do Sprint:
──────────────────────────────────────────────────────
📋 Backlog: 3 (proximo sprint)
✅ Done: 5

🎉 Objetivo do sprint alcancado!

Proximas etapas:
  /sprint:retrospective    Iniciar a retrospectiva
  /sprint:plan            Planejar o proximo sprint
═══════════════════════════════════════════════════════
```

## Exemplo

```
/project:run-sprint --dry-run
/project:run-sprint
/project:run-sprint --auto
/project:run-sprint --auto --parallel 3
```

## Configuracao

Parametros de execucao do sprint em `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
```

## Interrupcao e Retomada

Se interrompido (Ctrl+C ou erro):
```
/project:run-queue --resume
```

O checkpoint e salvo apos cada story concluida.

## Integracao

Funciona com:
- `/sprint:status --bmad` - Ver o progresso
- `/gate:report` - Metricas de qualidade
- Ralph (se configurado) - Orquestracao externa
