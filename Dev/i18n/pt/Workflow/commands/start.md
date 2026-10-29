---
description: "Preparação do início de sprint: pasta do sprint, entradas do sprint-status.yaml e decomposição em tarefas"
argument-hint: "<N> [--tasks-only]"
---

# Preparação do Início de Sprint

Você é um Scrum Master e Tech Lead experiente. Você deve preparar e facilitar o início de um novo sprint: verificar as condições, criar a pasta do sprint, registrar o sprint em `.bmad/sprint-status.yaml` e decompor as histórias em tarefas (Sprint Planning Parte 2, "O Como").

## Uso

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/workflow:start <N>` | Início completo: pré-requisitos, capacidade, planning, `project-management/sprints/sprint-{N}-{slug}/` (sprint-goal.md, sprint-dependencies.md, board.md, `tasks/TASK-*.md`), sprint e histórias escritos em `.bmad/sprint-status.yaml`, tarefas registradas | antigas etapas de início de sprint (removidas na 9.0) |
| `/workflow:start <N> --tasks-only` | Decompõe em tarefas as histórias de um sprint **existente** (apenas Etapas 7 a 9, pular as Etapas 1 a 6) | `/workflow:start <N>` |

## Argumentos
$ARGUMENTS

Argumentos:
- Número do sprint (ex.: `5`, `005`); se ausente, perguntar qual sprint iniciar
- (Opcional) Duração em dias (padrão: 10 dias = 2 semanas)
- `--tasks-only`: apenas decompõe em tarefas as histórias de um sprint existente

Exemplos: `/workflow:start 5`, `/workflow:start 5 --tasks-only`

> **O Plan Mode é obrigatório para a decomposição** (Etapa 7): analisar o código impactado, propor a divisão em tarefas e aguardar a validação antes de escrever arquivos.

> **O status vive em `.bmad/sprint-status.yaml`** (esquema: `.claude/templates/project/sprint-status.md`), nunca no markdown. Os arquivos de sprint, de tarefas e de board contêm apenas conteúdo.

## MISSÃO

### Etapa 1: Verificar Pré-requisitos

#### 1.1 Sprint Anterior Encerrado
```bash
# Verificar status do sprint anterior
# - Sprint Review concluída
# - Retrospectiva concluída
# - Todas as US finalizadas ou transferidas
```

#### 1.2 Backlog Priorizado
- Product Owner priorizou o backlog
- US candidatas estão estimadas
- Critérios de aceitação definidos

#### 1.3 Equipe Disponível
- Disponibilidade confirmada
- Férias identificadas
- Capacidade calculada

### Etapa 2: Calcular Capacidade

```
══════════════════════════════════════════════════════════════
📊 CÁLCULO DE CAPACIDADE - Sprint {N}
══════════════════════════════════════════════════════════════

Duração do sprint: {X} dias úteis
Data de início: {YYYY-MM-DD}
Data de término: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 DISPONIBILIDADE DA EQUIPE
──────────────────────────────────────────────────────────────

| Membro | Dias disponíveis | Foco (%) | Capacidade |
|--------|-------------|-----------|----------|
| Dev 1  | 10/10       | 80%       | 8 dias  |
| Dev 2  | 8/10        | 80%       | 6.4 dias|
| Dev 3  | 10/10       | 50%       | 5 dias  |
| Total  | -           | -         | 19.4 dias|

──────────────────────────────────────────────────────────────
📈 VELOCIDADE
──────────────────────────────────────────────────────────────

| Sprint | Pontos planejados | Pontos entregues |
|--------|------------------|---------------|
| S-3    | 25               | 23            |
| S-2    | 28               | 26            |
| S-1    | 30               | 28            |
| Média  | 27.7             | 25.7          |

Velocidade média: 26 pontos
Capacidade ajustada: ~24 pontos (fator de segurança 10%)
```

### Etapa 3: Preparar Sprint Planning

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 META DO SPRINT (a definir com PO)
──────────────────────────────────────────────────────────────

> "{Objetivo de negócio claro em uma frase}"

Exemplo: "Usuários podem criar uma conta e fazer login
via OAuth2 (Google, GitHub)"

──────────────────────────────────────────────────────────────
📝 USER STORIES CANDIDATAS
──────────────────────────────────────────────────────────────

| Prioridade | US | Título | Pontos | Status |
|----------|-----|-------|--------|--------|
| 🔴 Must  | US-045 | Registro de usuário | 5 | Pronta |
| 🔴 Must  | US-046 | Login OAuth Google | 8 | Pronta |
| 🔴 Must  | US-047 | Login OAuth GitHub | 5 | Pronta |
| 🟡 Should| US-048 | Redefinição de senha | 3 | Pronta |
| 🟡 Should| US-049 | Página de perfil | 5 | Pronta |
| 🟢 Could | US-050 | Avatar personalizado | 2 | Pronta |

Total candidato: 28 pontos
Capacidade: 24 pontos

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (verificar para cada US)
──────────────────────────────────────────────────────────────

Para cada US selecionada:
- [ ] Descrição clara e completa
- [ ] Critérios de aceitação definidos (Given/When/Then)
- [ ] Estimativa de pontos
- [ ] Dependências identificadas
- [ ] Mockups/designs disponíveis (se UI)
- [ ] Dados de teste preparados
- [ ] Nenhum bloqueio técnico

──────────────────────────────────────────────────────────────
📅 CERIMÔNIAS PLANEJADAS
──────────────────────────────────────────────────────────────

| Cerimônia | Data | Hora | Duração | Local |
|-----------|------|-------|-------|------|
| Sprint Planning P1 | {data} | 09:00 | 2h | Sala A |
| Sprint Planning P2 | {data} | 14:00 | 2h | Sala A |
| Daily Scrum | Diário | 09:30 | 15min | Stand-up |
| Backlog Refinement | {data} | 14:00 | 1h | Sala B |
| Sprint Review | {data final} | 14:00 | 2h | Sala A |
| Retrospectiva | {data final} | 16:30 | 1h30 | Sala A |
```

### Etapa 4: Criar a Estrutura do Sprint

Criar a pasta do sprint (templates em `.claude/templates/project/`):

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── sprint-dependencies.md
        ├── board.md                  # visão Kanban única, apenas conteúdo
        ├── tasks/
        │   ├── README.md             # visão geral: tarefas agrupadas por US
        │   ├── TASK-001.md           # um arquivo por tarefa (.claude/templates/project/task.md)
        │   └── ...
        ├── daily-notes/
        │   └── {YYYY-MM-DD}.md
        ├── sprint-review.md
        └── sprint-retro.md
```

### Etapa 5: Template sprint-goal.md

```markdown
# Sprint {N}: {Objetivo}

## Informações

| Atributo | Valor |
|----------|--------|
| Número | {N} |
| Início | {YYYY-MM-DD} |
| Término | {YYYY-MM-DD} |
| Duração | {X} dias |
| Capacidade | {Y} pontos |

## Meta do Sprint

> "{Objetivo de negócio claro}"

## Definition of Done (Lembrete)

- [ ] Code review aprovado (2 revisores)
- [ ] Testes unitários (cobertura ≥ 80%)
- [ ] Testes de integração passam
- [ ] Documentação atualizada
- [ ] Nenhuma dívida técnica adicionada
- [ ] Deployável em produção

## Backlog do Sprint

| ID | Título | Pontos | Atribuído | Status |
|----|-------|--------|---------|--------|
| US-045 | Registro de usuário | 5 | @dev1 | 🔵 A fazer |
| US-046 | Login OAuth Google | 8 | @dev2 | 🔵 A fazer |
| US-047 | Login OAuth GitHub | 5 | @dev1 | 🔵 A fazer |
| US-048 | Redefinição de senha | 3 | @dev3 | 🔵 A fazer |

**Total comprometido: 21 pontos**

## Dependências

| US | Depende de | Status |
|----|-----------|--------|
| US-046 | Configuração Google OAuth Console | ✅ Concluída |
| US-047 | Configuração GitHub OAuth App | ⚠️ Em andamento |

## Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|--------|-------------|--------|------------|
| Mudanças na API Google | Baixa | Média | Usar biblioteca oficial |
| Dev2 ficar doente | Média | Média | @dev1 pode assumir |

## Gráfico Burndown

```
Pontos |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notas

{Notas do sprint planning, decisões tomadas...}
```

### Etapa 6: Sincronizar `.bmad/sprint-status.yaml`

`/gate:check sprint` e `/workflow:implement` leem o sprint em `.bmad/sprint-status.yaml`. Escreva-o agora a partir do `sprint-goal.md` acima e das fichas US selecionadas (`project-management/backlog/user-stories/US-*.md`):

1. Criar `.bmad/` se não existir.
2. `metadata`: `sprint_id` (`sprint-{N}`), `name`, `start_date`, `end_date`, `goal`, `capacity_points`, retirados de `sprint-goal.md`.
3. `stories`: uma entrada por US selecionada: `title`, `status: ready-for-dev`, `story_points`, `epic_id`, `priority` (MoSCoW), `dependencies`, `tasks`, `history: []`.
4. Arquivo já presente para o **mesmo** `sprint_id`: manter os status existentes (nunca fazer uma story retroceder) e adicionar apenas as novas US.
5. Arquivo presente para **outro** sprint: mover primeiro as suas stories para `archived_sprints.<sprint_id anterior>` (`status`, `points`) e depois escrever o novo sprint.

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "Gestão de usuários"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Os usuários podem se cadastrar, entrar e editar o seu perfil"
  capacity_points: 21
stories:
  US-010:
    title: "Cadastro de usuário"
    status: "ready-for-dev"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks: { total: 0, completed: 0, list: [] }
    history: []
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
```

### Etapa 7: Decompor as Histórias em Tarefas

Ler `sprint-goal.md`, `sprint-dependencies.md` e cada US referenciada em `project-management/backlog/user-stories/` (com `--tasks-only`, começar aqui). Adaptar os tipos de tarefa à stack real do projeto (ler `CLAUDE.md` / `.claude/rules/`); a tabela abaixo é um exemplo típico.

| Camada | Prefixo | Tarefas típicas |
|--------|---------|-----------------|
| Banco de dados | `[DB]` | Entidade, migração, repositório, fixtures |
| Backend | `[BE]` | Serviço, recurso API, DTO, processor, voter |
| Frontend Web | `[FE-WEB]` | Controlador, template, componente |
| Frontend Mobile | `[FE-MOB]` | Modelo, repositório, estado, tela |
| Testes | `[TEST]` | Unitários, integração, API, E2E |
| Documentação | `[DOC]` | Documentação do código, README, OpenAPI |
| DevOps | `[OPS]` | Docker, CI/CD |
| Revisão | `[REV]` | Code review |

**Boa tarefa (SMART)**: Específica (ação clara), Mensurável (sabe-se quando termina), Atribuível (um único responsável), Realista, Com prazo (estimada em horas, não em pontos).

**Regras de tamanho**: mínimo 30 min, máximo 8 h (1 dia), ideal 2 a 4 h. Acima de 8 h: dividir em subtarefas.

**Fatiamento vertical**: cada US recebe as tarefas DB + API + front + testes + doc + revisão conforme necessário. Tamanho típico: CRUD simples ~15 tarefas, funcionalidade de negócio ~18, apenas UI ~11.

Para cada US, criar um `tasks/TASK-{NNN}.md` por tarefa a partir de `.claude/templates/project/task.md` (os IDs continuam após o último `TASK-*` existente, como faz `/project:backlog add task`) com: tipo, estimativa, `Depends on`, descrição, arquivos a criar ou modificar, critérios de validação. Depois adicionar uma seção em `tasks/README.md`:

```markdown
## US-XXX: [Título] (Epic EPIC-XXX, [X] pontos)

| ID | Tipo | Tarefa | Estimativa | Depende de |
|----|------|--------|------------|-----------|
| TASK-001 | [DB] | Criar a entidade [Nome] | 2h | - |
| TASK-002 | [DB] | Migração | 1h | TASK-001 |
| TASK-003 | [BE] | Recurso API | 3h | TASK-001 |
| TASK-004 | [TEST] | Testes de API | 2h | TASK-003 |

**Total estimado**: XXh
```

Adicionar as dependências como grafo Mermaid (`TASK-001 --> TASK-002`) e um resumo por camada (tarefas e horas). Adicionar também uma seção "Tarefas técnicas transversais" (ambiente, atualização de dependências, pipeline CI, refatoração identificada) com um `tasks/TASK-{NNN}.md` cada (sem US).

Regras:
1. Estimativa em horas (não em pontos)
2. Uma tarefa = um responsável
3. Máx. 2 tarefas em andamento por pessoa
4. Dependências explícitas (grafo Mermaid)

### Etapa 8: Board e Visão Geral das Tarefas

Criar `board.md` (template `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint {N}

> Visão gerada: regenerada a partir de `.bmad/sprint-status.yaml` por `/workflow:status --board`. Não editar à mão.

## to-do
| ID | US | Tarefa | Estimativa | Atribuído |
|----|-----|--------|------------|----------|

## in-progress | review | done | blocked
(mesmo formato, uma tabela por coluna)

## Métricas
- **Tarefas**: X no total | X concluídas (X%)
- **Horas**: Xh estimadas | Xh gastas | Xh restantes
```

`tasks/README.md` contém também a tabela de resumo (US, título, pontos, tarefas, horas), a divisão por tipo e as convenções: ID `TASK-[NNN]`, tamanho 0,5 h a 8 h, status acompanhados em `.bmad/sprint-status.yaml` (`to-do | in-progress | done | blocked`).

### Etapa 9: Registrar as Tarefas em `.bmad/sprint-status.yaml`

Para cada tarefa criada (tarefas de US e tarefas transversais), conforme `.claude/templates/project/sprint-status.md`:

1. Criar `.bmad/sprint-status.yaml` a partir do esqueleto de `/workflow:init` se não existir (com `--tasks-only`, o sprint e as histórias já existem; senão, executar o `/workflow:start <N>` completo)
2. Adicionar os ids TASK a `stories.<US>.tasks.list`
3. Definir `stories.<US>.tasks.status.<TASK>: to-do`
4. Atualizar `stories.<US>.tasks.total` (`completed` continua sendo o número de tarefas `done`)

### Etapa 10: Checklist Final

```
══════════════════════════════════════════════════════════════
✅ CHECKLIST DE INÍCIO DO SPRINT {N}
══════════════════════════════════════════════════════════════

## Antes do Sprint Planning

- [ ] Sprint anterior oficialmente concluído
- [ ] Ações da retrospectiva em andamento
- [ ] Backlog priorizado pelo PO
- [ ] US candidatas estimadas e "Prontas"
- [ ] Capacidade da equipe calculada
- [ ] Salas reservadas para cerimônias

## Durante o Sprint Planning

### Parte 1 - O QUÊ (com PO)
- [ ] Meta do Sprint definida e aceita
- [ ] US selecionadas pela equipe
- [ ] Comprometimento no escopo
- [ ] Dependências identificadas

### Parte 2 - COMO (dev team)
- [ ] Decomposição em tarefas
- [ ] Estimativa de tarefas
- [ ] Atribuição inicial
- [ ] Riscos discutidos

## Após o Sprint Planning

- [ ] Backlog do sprint visível (quadro atualizado)
- [ ] Daily Scrum agendado
- [ ] Ferramentas configuradas (quadro, branches, etc.)
- [ ] Comunicação da equipe (canal, notificações)

══════════════════════════════════════════════════════════════
🚀 SPRINT {N} PRONTO PARA COMEÇAR!
══════════════════════════════════════════════════════════════
```

## Dicas do Scrum

### Meta do Sprint
- Uma frase
- Orientada ao valor de negócio
- Mensurável
- Compartilhada por toda a equipe

### Comprometimento vs Previsão
- Equipe se compromete com a Meta do Sprint
- Número de pontos é uma previsão
- Confiança aumenta com a experiência

### Fator de Foco
- Equipe iniciante: 50-60%
- Equipe estabelecida: 70-80%
- Equipe madura: 80-90%

## Próximo Passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /gate:check sprint {N}                                ║
║    Verificar se o sprint está pronto (gate)              ║
║                                                          ║
║  → /workflow:implement {N}                               ║
║    Iniciar o desenvolvimento TDD/BDD                     ║
║                                                          ║
║  Veja também:                                            ║
║  • /project:backlog next story — Pegar a 1ª história     ║
║  • /workflow:status  — Acompanhar o progresso do sprint  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
