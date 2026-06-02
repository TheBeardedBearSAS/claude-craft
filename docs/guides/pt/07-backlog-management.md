# Guia de Gestão do Backlog

Fluxo de trabalho completo para criar e gerenciar um backlog SCRUM com o Claude-Craft.

---

## Visão Geral

O Claude-Craft fornece um conjunto completo de comandos para gerenciar seu product backlog seguindo a metodologia SCRUM:

- **15 comandos slash** para operações de backlog
- **5 templates** para estrutura consistente
- **Vertical slicing** obrigatório em todas as camadas tecnológicas
- **Validação do modelo INVEST** para User Stories

### Filosofia

Baseada em:
- Princípios do Manifesto Ágil
- 12 Princípios Ágeis
- Fundamentos do SCRUM
- Vertical slicing (cada US atravessa todas as camadas)

---

## Geração Inicial do Backlog

### A Partir de Especificações

Coloque as especificações do seu projeto em `./docs/` e execute:

```bash
/project:generate-backlog symfony+flutter
```

### Estrutura Gerada

```
project-management/
├── README.md                    # Visão geral do projeto
├── personas.md                  # Personas (mín. 3)
├── definition-of-done.md        # Níveis de DoD progressivos
├── dependencies-matrix.md       # Dependências entre Epics e US
├── backlog/
│   ├── epics/                   # Arquivos EPIC-XXX-nome.md
│   └── user-stories/            # Arquivos US-XXX-nome.md
└── sprints/
    └── sprint-XXX-objetivo/     # Planos de sprint
```

---

## Estrutura SCRUM

### Personas

Mínimo de 3 personas exigidas, cada uma contendo:
- **Identidade**: Nome, função, dados demográficos
- **Objetivos**: O que desejam alcançar
- **Frustrações**: Problemas que precisam ser resolvidos

Formato: `P-001`, `P-002`, `P-003`...

### EPICs

Grandes funcionalidades que contêm múltiplas User Stories:

| Campo | Descrição |
|-------|-----------|
| ID | Identificador único (EPIC-001, EPIC-002...) |
| MMF | Minimum Marketable Feature |
| Status | Draft, Ready, In Progress, Done |
| Objetivos de Negócio | Por que este EPIC é relevante |
| Critérios de Sucesso | Como medir o êxito |

### User Stories

Seguem o modelo **INVEST**:

| Letra | Significado | Validação |
|-------|-------------|-----------|
| **I** | Independent (Independente) | Sem dependências de outras US |
| **N** | Negotiable (Negociável) | Detalhes podem ser discutidos |
| **V** | Valuable (Valiosa) | Entrega valor ao usuário |
| **E** | Estimable (Estimável) | Pode ser dimensionada em pontos |
| **S** | Sized (Dimensionada) | Máx. 8 story points |
| **T** | Testable (Testável) | Possui critérios de aceitação claros |

#### Os 3 Cs

1. **Card (Cartão)**: Descrição resumida
2. **Conversation (Conversa)**: Detalhes da discussão
3. **Confirmation (Confirmação)**: Critérios de aceitação

#### Critérios de Aceitação (Gherkin)

Cada US exige:
- 1 cenário nominal (caminho feliz)
- 2 cenários alternativos
- 2 cenários de erro

```gherkin
Scenario: Usuário faz login com sucesso
  Given um usuário cadastrado com credenciais válidas
  When ele submete o formulário de login
  Then ele deve visualizar seu painel
  And uma sessão deve ser criada
```

### Tarefas (Tasks)

Itens de trabalho técnico dentro de uma User Story:

| Tipo | Descrição | Duração Típica |
|------|-----------|----------------|
| `[DB]` | Banco de dados (entidades, migrações) | 1–3h |
| `[BE]` | Backend (serviços, APIs) | 2–4h |
| `[FE-WEB]` | Frontend Web (controllers, templates) | 2–4h |
| `[FE-MOB]` | Frontend Mobile (telas, blocs) | 3–5h |
| `[TEST]` | Testes (unitário, integração, E2E) | 2–4h |
| `[DOC]` | Documentação | 0,5–1h |
| `[OPS]` | DevOps (CI/CD, deploy) | 1–2h |
| `[REV]` | Revisão de código | 1–2h |

**Regras de estimativa:**
- Duração da tarefa: 0,5h – 8h máximo
- Story points (Fibonacci): 1, 2, 3, 5, 8, 13, 21
- Tamanho máximo de uma US: 8 pontos (dividir se maior)

---

## Fluxo de Trabalho

### Fluxo de Status

```
┌─────────┐     ┌─────────────┐     ┌──────┐
│  To Do  │ ──→ │ In Progress │ ──→ │ Done │
└─────────┘     └─────────────┘     └──────┘
     │                │
     │                ↓
     └────────→ ┌─────────┐
                │ Blocked │
                └─────────┘
                     │
                     ↓
              ┌─────────────┐
              │ In Progress │
              └─────────────┘
```

**Transições proibidas:**
- To Do → Done (deve passar por In Progress)
- Qualquer estado → To Do (exceto reabertura manual)

---

## Referência de Comandos

### Comandos de Criação

| Comando | Descrição |
|---------|-----------|
| `/project:generate-backlog [stack]` | Gerar backlog completo a partir das specs |
| `/project:add-epic` | Criar um novo EPIC |
| `/project:add-story` | Adicionar uma User Story a um EPIC |
| `/project:add-task` | Criar uma tarefa técnica para uma US |

### Comandos de Visualização

| Comando | Descrição |
|---------|-----------|
| `/project:list-epics` | Exibir todos os EPICs com status |
| `/project:list-stories [filtro]` | Listar User Stories (por EPIC, Sprint, Status) |
| `/project:list-tasks [filtro]` | Listar tarefas (por US, Sprint, Tipo, Status) |
| `/project:board [sprint]` | Exibir quadro Kanban |
| `/sprint:status [sprint]` | Relatório detalhado de progresso do sprint |

### Comandos de Atualização

| Comando | Descrição |
|---------|-----------|
| `/sprint:transition [id] [status/sprint]` | Alterar status da US ou atribuir ao sprint |
| `/project:move-task [id] [status]` | Alterar status de uma tarefa |
| `/project:update-epic [id]` | Modificar um EPIC existente |
| `/project:update-story [id]` | Modificar uma User Story existente |

### Comandos Avançados

| Comando | Descrição |
|---------|-----------|
| `/project:decompose-tasks [sprint]` | Decompor as US do sprint em tarefas |
| `/gate:validate-backlog` | Auditar a qualidade do backlog (conformidade SCRUM) |

---

## Exemplo Completo: Novo Projeto

### Passo 1: Gerar o Backlog Inicial

```bash
# Certifique-se de que as specs estão em ./docs/
/project:generate-backlog symfony+flutter
```

### Passo 2: Validar a Qualidade

```bash
/gate:validate-backlog
```

Isso gera `scrum-validation-report.md` com:
- Pontuação de conformidade INVEST
- Verificação dos 3 Cs
- Análise dos critérios SMART
- Consistência das estimativas

### Passo 3: Revisar o Sprint 1

```bash
/project:board 1
```

Exibe o quadro Kanban com as colunas:
- To Do | In Progress | In Review | Done | Blocked

### Passo 4: Decompor em Tarefas

```bash
/project:decompose-tasks 1
```

Cria o detalhamento das tarefas:
- Tarefas agrupadas por US
- Grafo de dependências (Mermaid)
- Estimativas de tempo por camada

### Passo 5: Iniciar o Trabalho

```bash
# Mover primeira tarefa para em andamento
/project:move-task TASK-001 in-progress

# Depois, marcar como concluída
/project:move-task TASK-001 done

# Se bloqueada
/project:move-task TASK-002 blocked "Aguardando specs da API"
```

### Passo 6: Acompanhar o Progresso

```bash
/sprint:status 1
```

### Passo 7: Configurar Monitoramento Recorrente (Opcional)

Use `/loop` (v2.1.71+) para monitorar automaticamente o progresso do sprint:

```bash
# Verificar status do sprint a cada 30 minutos
/loop 30m /sprint:status 1

# Executar verificações pré-commit a cada 5 minutos durante o desenvolvimento
/loop 5m /common:pre-commit-check
```

Alias: `/proactive` (v2.1.105+).

Exibe:
- Progresso geral e burndown
- Métricas por User Story
- Bloqueios e riscos
- Ações recomendadas

---

## Templates

O Claude-Craft fornece 5 templates para estrutura consistente do backlog:

| Template | Finalidade |
|----------|-----------|
| `epic.md` | Estrutura do arquivo EPIC com metadados, objetivos e lista de US |
| `user-story.md` | Estrutura de US com critérios Gherkin e tabela de tarefas |
| `task.md` | Estrutura de tarefa com checklist de DoD |
| `board.md` | Quadro Kanban com cálculo de métricas |
| `index.md` | Índice do backlog com resumo global |

---

## Regras SCRUM Aplicadas

| Regra | Valor |
|-------|-------|
| Duração do sprint | 2 semanas (fixo) |
| Velocidade | 20–40 pontos/sprint |
| Tamanho máximo de US | 8 pontos (dividir se maior) |
| Escala de estimativa | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Duração da tarefa | 0,5h – 8h máximo |

### Sprint 1: Walking Skeleton

O primeiro sprint deve incluir:
- Configuração completa da infraestrutura
- 1 funcionalidade end-to-end (não apenas configuração)
- Testável tanto em Web quanto em Mobile

### Vertical Slicing

**Cada User Story DEVE atravessar todas as camadas:**

```
UI (Web/Mobile) → API → Lógica de Negócio → Banco de Dados
```

Não são permitidas User Stories "somente Backend", "somente Frontend" ou "somente Mobile".

---

## Checklist: Backlog Pronto

- [ ] Mínimo de 3 personas definidas
- [ ] EPICs com MMF e critérios de sucesso
- [ ] User Stories seguem o modelo INVEST
- [ ] Critérios de aceitação no formato Gherkin
- [ ] Stories estimadas em pontos Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done documentada
- [ ] Backlog validado (`/gate:validate-backlog`)

---

[&larr; Resolução de Problemas](06-troubleshooting.md) | [Próximo: Configurar Novo Projeto &rarr;](08-setup-new-project.md)
