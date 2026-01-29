---
description: Atualizar as stories para o formato BMAD v6 com os campos ausentes
argument-hint: [--dry-run] [story-id]
---

# Update Stories

Adicionar os campos BMAD v6 ausentes nas user stories existentes.

## Argumentos

$ARGUMENTS (formato: [--dry-run] [story-id])
- **--dry-run** (opcional): Pre-visualizar as mudancas sem aplica-las
- **story-id** (opcional): Story especifica a atualizar (ex: US-001). Se omitido, atualiza todas.

## Processo

### Etapa 1: Carregar o estado atual

1. Ler `.bmad/sprint-status.yaml`
2. Carregar os arquivos de story do backlog
3. Comparar os campos entre o arquivo e sprint-status

### Etapa 2: Identificar os campos ausentes

Para cada story, verificar:

| Campo | Obrigatorio | Padrao se ausente |
|-------|-------------|-------------------|
| tdd_phase | Sim | "red" se in-progress, "" caso contrario |
| tasks.list | Sim | Extrair da secao ## Tasks |
| tasks.total | Sim | Contar a partir da lista |
| tasks.completed | Sim | Contar as tarefas concluidas |
| current_task | Nao | Primeira tarefa em andamento |
| history | Sim | Inicializar com o status atual |
| acceptance_criteria.total | Sim | Contar a partir da secao AC |
| acceptance_criteria.validated | Sim | 0 (padrao) |
| story_points | Sim | Solicitar se ausente |
| epic_id | Nao | Extrair do arquivo |

### Etapa 3: Extrair a lista de tarefas do markdown

Extrair as tarefas do formato do arquivo de story:
```markdown
## Tasks

| ID | Descricao | Status |
|----|-----------|--------|
| TASK-001 | Endpoint backend | 🟢 Done |
| TASK-002 | Formulario frontend | 🟡 Em andamento |
```

Converter para o formato BMAD:
```yaml
tasks:
  list:
    - id: "TASK-001"
      title: "Endpoint backend"
      status: "done"
    - id: "TASK-002"
      title: "Formulario frontend"
      status: "in-progress"
```

### Etapa 4: Extrair os criterios de aceitacao

Extrair do formato Gherkin:
```markdown
## Criterios de Aceitacao

### AC1: Login valido
Dado um usuario cadastrado
Quando ele insere credenciais validas
Entao ele esta logado
Status: ✅ Validado

### AC2: Login invalido
Dado um usuario
Quando ele insere credenciais invalidas
Entao ele ve uma mensagem de erro
Status: ⏳ Pendente
```

Converter para o formato BMAD:
```yaml
acceptance_criteria:
  total: 2
  validated: 1
  list:
    - id: "AC1"
      title: "Login valido"
      status: "validated"
    - id: "AC2"
      title: "Login invalido"
      status: "pending"
```

### Etapa 5: Inicializar o historico

Se nao houver historico, criar a entrada inicial:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: ""
    to: "{status_atual}"
    by: "update-stories"
    reason: "Historico inicializado"
```

### Etapa 6: Validar a conformidade INVEST

Executar as verificacoes INVEST e adicionar a pontuacao:
```yaml
invest_score:
  independent: true
  negotiable: true
  valuable: true
  estimable: true   # false se nao houver story_points
  small: true       # false se > 8 pontos
  testable: true    # false se nao houver AC
  total: 6
```

### Etapa 7: Atualizar sprint-status.yaml

Mesclar os campos atualizados em sprint-status.yaml.

### Etapa 8: Atualizar os arquivos de story (opcional)

Adicionar o comentario de metadados BMAD aos arquivos de story:
```markdown
<!-- BMAD v6 Metadata
tdd_phase: green
invest_score: 6/6
last_sync: 2026-01-29T10:00:00Z
-->
```

## Formato de Saida

```
📝 Atualizacao de Stories para BMAD v6
====================================

## Stories atualizadas: {CONTAGEM}

| Story | Campos adicionados | Pontuacao INVEST |
|-------|--------------------|------------------|
| US-001 | tdd_phase, history | 6/6 ✅ |
| US-002 | tasks.list, history | 5/6 ⚠️ |
| US-003 | story_points necessario | 4/6 ❌ |

## Resumo dos campos

| Campo | Adicionado a | Ignorado |
|-------|--------------|----------|
| tdd_phase | 10 | 2 (ja definido) |
| tasks.list | 8 | 4 (ja definido) |
| history | 12 | 0 |
| invest_score | 12 | 0 |

## Alertas

⚠️ US-003: Story points ausentes - favor estimar
⚠️ US-007: Sem criterios de aceitacao - adicionar antes do desenvolvimento

## Arquivos modificados
- .bmad/sprint-status.yaml
- project-management/backlog/user-stories/US-001-*.md (comentario de metadados)

## Proximas Etapas
1. Corrigir os alertas: adicionar os story_points e AC ausentes
2. Executar `/project:sync-backlog` para verificar a consistencia
3. Executar `/gate:validate-backlog` para validacao completa
```

## Exemplo

```
/project:update-stories --dry-run
/project:update-stories
/project:update-stories US-001
```

## Validacao

Apos a atualizacao, todas as stories devem passar:
```
/gate:validate-backlog
```
