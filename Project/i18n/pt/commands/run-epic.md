---
description: Executar todas as stories de um epic em batch
argument-hint: <epic-id> [--dry-run]
---

# Run Epic

Colocar na fila e processar todas as stories de um epic em modo batch.

## Argumentos

$ARGUMENTS (formato: <epic-id> [--dry-run])
- **epic-id** (obrigatorio): Identificador do epic (ex: EPIC-001)
- **--dry-run** (opcional): Pre-visualizar sem executar

## Processo

### Etapa 1: Identificar as stories do epic

1. Ler `.bmad/sprint-status.yaml`
2. Encontrar todas as stories com `epic_id` correspondente ao argumento
3. Ordenar por prioridade ou ID

### Etapa 2: Verificar a preparacao das stories

Para cada story, verificar:
- A story existe e possui os campos obrigatorios
- Nao esta concluida
- Nao esta bloqueada (ou sinalizar para revisao)

### Etapa 3: Construir a fila de execucao

Criar uma fila priorizada:
1. Stories sem dependencias primeiro
2. ID menor = prioridade maior
3. Respeitar a prioridade explicita se definida

### Etapa 4: Adicionar a fila batch

Atualizar `.bmad/batch-queue.yaml`:
```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-002"
    priority: 2
    dependencies: ["US-001"]
```

### Etapa 5: Executar (exceto --dry-run)

Para cada story na ordem:
1. Transicionar para in-progress
2. Executar o workflow de desenvolvimento
3. Executar os quality gates
4. Transicionar atraves dos estados
5. Checkpoint apos cada uma

## Formato de Saida

### Dry Run

```
═══════════════════════════════════════════════════════
           Run Epic: EPIC-002 (DRY RUN)
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Gestao de Usuarios
Stories: 5

Plano de execucao:
──────────────────────────────────────────────────────
[1] US-010: Cadastro de usuario (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencias: nenhuma

[2] US-011: Login de usuario (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencias: US-010

[3] US-012: Pagina de perfil (5 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencias: US-010

[4] US-013: Redefinicao de senha (3 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencias: US-010, US-011

[5] US-014: Verificacao de email (3 pts)
    Status: ready-for-dev → in-progress → review → done
    Dependencias: US-010

Total de Pontos: 21

Ordem de execucao (respeitando dependencias):
  1. US-010 (sem deps)
  2. US-011, US-012, US-014 (paralelo apos US-010)
  3. US-013 (apos US-010, US-011)

Workflow estimado por story:
  • Transicao para in-progress
  • Ciclos TDD (red → green → refactor)
  • Code review
  • Validacao do quality gate
  • Transicao para done

⚠️ DRY RUN - Nenhuma modificacao realizada

Executar sem --dry-run para iniciar.
═══════════════════════════════════════════════════════
```

### Execucao

```
═══════════════════════════════════════════════════════
              Run Epic: EPIC-002
═══════════════════════════════════════════════════════

Epic: EPIC-002 - Gestao de Usuarios
Modo: Sequencial
Stories: 5

Colocando stories na fila...
──────────────────────────────────────────────────────
✅ Adicionada US-010 (prioridade 1)
✅ Adicionada US-011 (prioridade 2, depende de US-010)
✅ Adicionada US-012 (prioridade 3, depende de US-010)
✅ Adicionada US-013 (prioridade 4, depende de US-010, US-011)
✅ Adicionada US-014 (prioridade 5, depende de US-010)

Status da fila:
──────────────────────────────────────────────────────
⏳ Pendente:    5
🔄 Em execucao: 0
✅ Concluido:   0
❌ Falhou:      0

Proximas etapas:
──────────────────────────────────────────────────────
Executar a fila:
  /project:run-queue

Ou processar automaticamente:
  /project:run-queue --auto

Monitorar o progresso:
  /project:batch-status
═══════════════════════════════════════════════════════
```

## Exemplo

```
/project:run-epic EPIC-002 --dry-run
/project:run-epic EPIC-002
```

## Execucao Paralela

Para stories independentes, ativar o modo paralelo:
```
/project:run-queue --parallel 3
```

Isso processa ate 3 stories simultaneamente quando nao possuem dependencias.

## Retomada

Se a execucao for interrompida:
```
/project:run-queue --resume
```

Continua a partir do ultimo checkpoint.

## Integracao com Ralph

Se Ralph estiver configurado, a execucao batch se integra:
```yaml
# ralph.yml
bmad_integration:
  enabled: true
  batch_queue_file: ".bmad/batch-queue.yaml"
```
