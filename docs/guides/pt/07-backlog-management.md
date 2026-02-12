# Guia de Gestao do Backlog

Fluxo de trabalho completo para criar e gerenciar um backlog SCRUM com Claude-Craft.

---

## Visao Geral

Claude-Craft fornece um conjunto completo de comandos para gerenciar seu product backlog seguindo a metodologia SCRUM:

- **15 comandos slash** para operacoes de backlog
- **5 templates** para estrutura consistente
- **Vertical slicing** obrigatorio em todas as camadas
- **Validacao INVEST** para User Stories

---

## Geracao Inicial do Backlog

```bash
# A partir das especificacoes em ./docs/
/project:generate-backlog symfony+flutter
```

### Estrutura Gerada

```
project-management/
├── README.md                    # Visao geral do projeto
├── personas.md                  # Personas (min. 3)
├── definition-of-done.md        # Niveis DoD progressivos
├── backlog/
│   ├── epics/                   # EPIC-XXX-nome.md
│   └── user-stories/            # US-XXX-nome.md
└── sprints/
    └── sprint-XXX-objetivo/
```

---

## Estrutura SCRUM

### Personas (minimo 3)
- Identidade, objetivos, frustracoes
- Formato: P-001, P-002...

### EPICs
- ID unico (EPIC-XXX)
- MMF (Minimum Marketable Feature)
- Objetivos de negocio e criterios de sucesso

### User Stories (modelo INVEST)

| Letra | Significado |
|-------|-------------|
| **I** | Independent - Sem dependencias |
| **N** | Negotiable - Detalhes negociaveis |
| **V** | Valuable - Valor para o usuario |
| **E** | Estimable - Pode ser estimada |
| **S** | Sized - Max 8 pontos |
| **T** | Testable - Criterios claros |

#### Criterios de Aceitacao (Gherkin)
- 1 cenario nominal
- 2 cenarios alternativos
- 2 cenarios de erro

### Tasks (Tarefas)

| Tipo | Descricao |
|------|-----------|
| `[DB]` | Banco de dados |
| `[BE]` | Backend |
| `[FE-WEB]` | Frontend Web |
| `[FE-MOB]` | Frontend Mobile |
| `[TEST]` | Testes |
| `[DOC]` | Documentacao |
| `[OPS]` | DevOps |
| `[REV]` | Code review |

---

## Fluxo de Trabalho

```
To Do ──→ In Progress ──→ Done
   │            │
   └────→ Blocked ←────┘
```

---

## Referencia de Comandos

### Comandos de Criacao

| Comando | Descricao |
|---------|-----------|
| `/project:generate-backlog [stack]` | Gerar backlog das specs |
| `/project:add-epic` | Criar novo EPIC |
| `/project:add-story` | Adicionar User Story |
| `/project:add-task` | Criar tarefa tecnica |

### Comandos de Visualizacao

| Comando | Descricao |
|---------|-----------|
| `/project:list-epics` | Listar EPICs |
| `/project:list-stories` | Listar User Stories |
| `/project:list-tasks` | Listar tarefas |
| `/project:board` | Quadro Kanban |
| `/project:sprint-status` | Status do sprint |

### Comandos de Atualizacao

| Comando | Descricao |
|---------|-----------|
| `/sprint:transition` | Alterar status/sprint da US |
| `/project:move-task` | Alterar status da tarefa |
| `/project:update-epic` | Modificar EPIC |
| `/project:update-story` | Modificar User Story |

### Comandos Avancados

| Comando | Descricao |
|---------|-----------|
| `/project:decompose-tasks` | Decompor US em tarefas |
| `/gate:validate-backlog` | Auditar qualidade SCRUM |

---

## Exemplo Completo

```markdown
## Passo 1: Gerar backlog inicial
/project:generate-backlog symfony+flutter

## Passo 2: Validar qualidade
/gate:validate-backlog

## Passo 3: Visualizar Sprint 1
/project:board 1

## Passo 4: Decompor em tarefas
/project:decompose-tasks 1

## Passo 5: Comecar trabalho
/project:move-task TASK-001 in-progress
```

---

## Templates Disponiveis

| Template | Proposito |
|----------|-----------|
| `epic.md` | Estrutura de EPIC |
| `user-story.md` | Estrutura de User Story |
| `task.md` | Estrutura de tarefa |
| `board.md` | Quadro Kanban |
| `index.md` | Indice do backlog |

---

## Regras SCRUM

| Regra | Valor |
|-------|-------|
| Duracao sprint | 2 semanas |
| Velocidade | 20-40 pontos/sprint |
| Max US | 8 pontos |
| Estimativa | Fibonacci (1,2,3,5,8,13,21) |
| Duracao tarefa | 0.5h - 8h max |

### Sprint 1 = Walking Skeleton
- Infraestrutura completa
- 1 feature end-to-end
- Testavel em Web e Mobile

### Vertical Slicing
Cada US deve atravessar todas as camadas:
```
UI → API → Logica de Negocio → Banco de Dados
```

---

## Checklist

- [ ] Minimo 3 personas definidas
- [ ] EPICs com MMF e criterios de sucesso
- [ ] User Stories seguem INVEST
- [ ] Criterios no formato Gherkin
- [ ] Estimativa em Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Backlog validado

---

[&larr; Resolucao de Problemas](06-troubleshooting.md) | [Proximo: Configurar Novo Projeto &rarr;](08-setup-new-project.md)
