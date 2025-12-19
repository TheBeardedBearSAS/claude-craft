---
description: Listar User Stories
argument-hint: [arguments]
---

# Listar User Stories

Exibir lista de User Stories com filtragem por EPIC, Sprint ou Status.

## Argumentos

$ARGUMENTS (opcional, formato: [filtro] [valor])
- **epic EPIC-XXX**: Filtrar por EPIC
- **sprint N**: Filtrar por sprint
- **status STATUS**: Filtrar por status (todo, in-progress, blocked, done)
- **backlog**: Exibir apenas USs não atribuídas a um sprint

## Processo

### Etapa 1: Ler User Stories

1. Escanear diretório `project-management/backlog/user-stories/`
2. Ler cada arquivo US-XXX-*.md
3. Extrair metadados de cada US

### Etapa 2: Filtrar

Aplicar filtros de acordo com $ARGUMENTS:
- Por EPIC pai
- Por sprint atribuído
- Por status
- Não atribuídas (backlog)

### Etapa 3: Calcular estatísticas

Para cada US:
- Contar tarefas totais
- Contar tarefas por status
- Calcular porcentagem de progresso

### Etapa 4: Exibir

Gerar tabela formatada agrupada por EPIC ou Sprint dependendo do contexto.

## Formato de Saída - Por EPIC

```
📖 User Stories - EPIC-001: Autenticação

| ID | Nome | Sprint | Status | Pontos | Tarefas | Progresso |
|----|-----|--------|--------|--------|---------|-------------|
| US-001 | Login de usuário | Sprint 1 | 🟡 Em Andamento | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Cadastro | Sprint 1 | 🔴 A Fazer | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Esqueci senha | Backlog | 🔴 A Fazer | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 pontos | 🔴 2 | 🟡 1 | 🟢 0
```

## Formato de Saída - Por Sprint

```
📖 User Stories - Sprint 1

| ID | EPIC | Nome | Status | Pontos | Tarefas | Progresso |
|----|------|-----|--------|--------|---------|-------------|
| US-001 | EPIC-001 | Login de usuário | 🟡 Em Andamento | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | EPIC-001 | Cadastro | 🔴 A Fazer | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-005 | EPIC-002 | Lista de produtos | 🟢 Concluído | 5 | 6/6 | ██████████ 100% |

───────────────────────────────────────────────────
Sprint 1: 3 US | 13 pontos | Concluídos: 5 pts (38%)
```

## Formato de Saída - Backlog

```
📖 Backlog (USs Não Atribuídas)

| ID | EPIC | Nome | Prioridade | Pontos | Status |
|----|------|-----|------------|--------|--------|
| US-003 | EPIC-001 | Esqueci senha | High | 3 | 🔴 A Fazer |
| US-006 | EPIC-002 | Detalhe do produto | Medium | 5 | 🔴 A Fazer |
| US-007 | EPIC-002 | Busca | Low | 8 | 🔴 A Fazer |

───────────────────────────────────────────────────
Backlog: 3 US | 16 pontos a planejar
```

## Exemplos

```
# Listar todas as USs
/project:list-stories

# Listar USs de um EPIC
/project:list-stories epic EPIC-001

# Listar USs do sprint atual
/project:list-stories sprint 1

# Listar USs em andamento
/project:list-stories status in-progress

# Listar USs bloqueadas
/project:list-stories status blocked

# Listar backlog (não atribuídas)
/project:list-stories backlog
```

## Ações Sugeridas

Dependendo do contexto, sugerir:
```
Ações:
  /project:move-story US-XXX sprint-2     # Atribuir ao sprint
  /project:move-story US-XXX in-progress  # Mudar status
  /project:add-task US-XXX "[BE] ..." 4h  # Adicionar tarefa
```
