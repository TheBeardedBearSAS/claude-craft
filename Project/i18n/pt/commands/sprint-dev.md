---
name: sprint-dev
description: Inicia o desenvolvimento TDD/BDD de um sprint com atualizacao automatica de status
arguments:
  - name: sprint
    description: Numero do sprint, "next" para o proximo incompleto, ou "current"
    required: true
---

# /project:sprint-dev

## Objetivo

Orquestrar o desenvolvimento completo de um sprint em modo TDD/BDD com:
- **Plan mode obrigatorio** antes de cada implementacao
- **Ciclo TDD** (RED → GREEN → REFACTOR)
- **Atualizacao automatica** de status (Tarefa → User Story → Sprint)
- **Acompanhamento de progresso** e metricas

## Pre-requisitos

- Sprint existente com tarefas decompostas
- Arquivos presentes: `sprint-backlog.md`, `tasks/*.md`
- Executar `/project:decompose-tasks N` primeiro se necessario

## Argumentos

```bash
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Proximo sprint incompleto
/project:sprint-dev current  # Sprint atualmente ativo
```

---

## Workflow

### Fase 1: Inicializacao

1. Carregar sprint de `project-management/sprints/sprint-N-*/`
2. Ler `sprint-backlog.md` para obter User Stories
3. Listar tarefas por US (ordenadas por dependencias)
4. Exibir board inicial

### Fase 2: Loop User Story

Para cada US em status To Do ou In Progress:
1. Marcar US → In Progress
2. Exibir criterios de aceitacao (Gherkin)
3. Processar cada tarefa da US

### Fase 3: Loop Tarefa (Workflow TDD)

Para cada tarefa em To Do:

#### 3.1 Plan Mode (OBRIGATORIO)

⚠️ **SEMPRE ativar plan mode antes de implementar**

- Explorar codigo impactado
- Documentar analise
- Propor plano de implementacao
- Aguardar validacao do usuario

#### 3.2 Ciclo TDD

```
🔴 RED    : Escrever testes que falham
🟢 GREEN  : Implementar codigo minimo
🔧 REFACTOR : Melhorar sem quebrar testes
```

#### 3.3 Definition of Done

- [ ] Codigo escrito e funcional
- [ ] Testes passam
- [ ] Codigo revisado (se existe tarefa [REV])

#### 3.4 Marcar Tarefa → Done

- Atualizar metadados
- Commit convencional
- Atualizar board

### Fase 4: Validacao US

Quando todas as tarefas de uma US estao Done:
- Verificar criterios de aceitacao
- Executar testes E2E
- Marcar US → Done

### Fase 5: Encerramento Sprint

Quando todas as US estao Done:
- Exibir resumo
- Gerar sprint-review.md
- Gerar sprint-retro.md

---

## Ordem de Processamento

| Ordem | Tipo | Descricao |
|-------|------|-----------|
| 1 | `[DB]` | Banco de dados |
| 2 | `[BE]` | Backend |
| 3 | `[FE-WEB]` | Frontend Web |
| 4 | `[FE-MOB]` | Frontend Mobile |
| 5 | `[TEST]` | Testes adicionais |
| 6 | `[DOC]` | Documentacao |
| 7 | `[REV]` | Code Review |

---

## Comandos de Controle

| Comando | Acao |
|---------|------|
| `continue` | Validar plano e prosseguir |
| `skip` | Pular esta tarefa |
| `block [razao]` | Marcar como bloqueada |
| `stop` | Parar sprint-dev |
| `status` | Exibir progresso |
| `board` | Exibir Kanban |

---

## Gestao de Bloqueios

```
⚠️ Tarefa Bloqueada

TASK-003 nao pode continuar.
Razao: Aguardando especificacoes da API

Opcoes:
[1] Pular e continuar com proxima tarefa
[2] Tentar resolver o bloqueio
[3] Parar sprint-dev
```

---

## Atualizacoes Automaticas

A cada mudanca de status:
1. Arquivo tarefa: status, time_spent
2. Arquivo US: progresso tarefas
3. Arquivo EPIC: progresso US
4. board.md: colunas Kanban
5. index.md: metricas globais

---

## Exemplo

```bash
> /project:sprint-dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 tarefas

🎯 Iniciando US-001: Autenticacao (5 pts)

▶️ TASK-001 [DB] Criar entidade User

⚠️ PLAN MODE ATIVADO
   Analisando...

> continue

🧪 CICLO TDD
🔴 RED: Escrevendo testes...
🟢 GREEN: Implementando...
🔧 REFACTOR: Melhorias?

✅ Definition of Done: PASSOU

📝 Commit criado

▶️ TASK-002 [BE] Servico autenticacao...
```

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `/project:decompose-tasks N` | Criar tarefas antes |
| `/project:board N` | Ver Kanban |
| `/project:sprint-status N` | Ver metricas |
| `/project:move-task` | Alterar status tarefa |
| `/project:move-story` | Alterar status US |
