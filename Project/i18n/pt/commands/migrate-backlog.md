---
description: Migrar o backlog existente para o formato BMAD v6
argument-hint: [--dry-run] [--force]
---

# Migrar o Backlog

Converter o backlog existente para o formato BMAD v6 com rastreamento sprint-status.yaml.

## Argumentos

$ARGUMENTS (formato: [--dry-run] [--force])
- **--dry-run** (opcional): Pre-visualizar as mudancas sem aplica-las
- **--force** (opcional): Sobrescrever os arquivos BMAD existentes

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Pre-requisitos

Executar `/project:analyze-backlog` primeiro para entender a estrutura atual.

## Processo

### Etapa 1: Validar os pre-requisitos

1. Verificar se o diretorio `.bmad/` existe (criar se necessario)
2. Verificar a existencia de `sprint-status.yaml` (alertar se existe e sem --force)
3. Verificar se a analise do backlog foi realizada

### Etapa 2: Criar a estrutura BMAD

```
.bmad/
├── sprint-status.yaml       # Arquivo principal de rastreamento
├── batch-queue.yaml         # Fila de processamento batch
├── gates/                   # Configuracoes dos quality gates
├── hooks/                   # Hooks Claude Code
└── lib/                     # Scripts utilitarios
```

### Etapa 3: Analisar o backlog existente

Para cada User Story encontrada:
1. Extrair todos os metadados
2. Analisar os criterios de aceitacao (formato Gherkin)
3. Identificar as tarefas associadas
4. Determinar o status atual
5. Calcular a porcentagem de conclusao

### Etapa 4: Gerar sprint-status.yaml

Transformar cada story para o formato BMAD v6:

```yaml
stories:
  US-001:
    title: "Login de usuario"
    status: "in-progress"
    previous_status: "ready-for-dev"
    assigned_to: ""
    tdd_phase: "red"
    current_task: "TASK-001"
    story_points: 5
    epic_id: "EPIC-001"
    tasks:
      total: 4
      completed: 2
      list:
        - id: "TASK-001"
          title: "Endpoint backend auth"
          status: "in-progress"
    history:
      - timestamp: "2026-01-29T10:00:00Z"
        from: "backlog"
        to: "in-progress"
        by: "migration"
```

### Etapa 5: Mapeamento de status

| Original | Status BMAD v6 |
|----------|----------------|
| 🔴 A fazer | backlog |
| 🟡 Em andamento | in-progress |
| 🟢 Concluido | done |
| ⏸️ Bloqueado | blocked |
| Atribuido Sprint-X | ready-for-dev |

### Etapa 6: Inicializar a fase TDD

Definir a fase TDD inicial de acordo com a conclusao das tarefas:
- 0% tarefas concluidas → `red`
- 1-99% tarefas concluidas → `green`
- 100% tarefas concluidas → `refactor` ou `done`

### Etapa 7: Criar um backup (exceto --dry-run)

1. Copiar o backlog existente para `.bmad/backup/`
2. Adicionar timestamp ao backup
3. Registrar a localizacao do backup

### Etapa 8: Aplicar a migracao (exceto --dry-run)

1. Escrever `sprint-status.yaml`
2. Atualizar os arquivos de story com os metadados BMAD
3. Criar `.bmad/migration-log.md`

## Formato de Saida

```
🔄 Migracao BMAD v6
====================

## Verificacao Previa
✅ Localizacao do backlog: project-management/backlog/
✅ Diretorio BMAD: .bmad/ (criado)
✅ Nenhum sprint-status.yaml existente

## Resumo da Migracao

### Stories Migradas: {NUMERO}
| ID | Titulo | Status | Fase TDD |
|----|--------|--------|----------|
| US-001 | Login | in-progress | green |

### Tarefas Migradas: {NUMERO}
### Criterios de Aceitacao: {NUMERO}

## Arquivos Criados
- .bmad/sprint-status.yaml
- .bmad/batch-queue.yaml
- .bmad/backup/backlog-2026-01-29.tar.gz

## Proximas Etapas
1. Verificar sprint-status.yaml
2. Executar `/sprint:status` para verificar
3. Configurar os metadados do sprint
```

## Exemplo

```
/project:migrate-backlog --dry-run
/project:migrate-backlog
/project:migrate-backlog --force
```
