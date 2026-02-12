---
name: workflow-status
description: Exibir o progresso atual do workflow e as proximas acoes recomendadas
arguments:
  - name: verbose
    description: Mostrar status detalhado com todos os artefatos
    required: false
---

# /workflow:status

## Missao

Exibir o estado atual do workflow de desenvolvimento, incluindo fases concluidas, progresso atual e proximas acoes recomendadas.

## Uso

```bash
/workflow:status           # Visao padrao
/workflow:status --verbose # Visao detalhada com todos os artefatos
```

## Formato de Saida

### Visao Padrao

```
+==================================================================+
|                       STATUS DO WORKFLOW                             |
+====================================================================+
| Projeto: my-awesome-app                                              |
| Track: STANDARD                                                      |
| Inicio: 2026-01-07                                                   |
| Fase Atual: Design ████████████░░░░ 75%                              |
+====================================================================+
|                                                                      |
|  Fase 1: Analise                                                     |
|  +-- Pulada (track Standard)                                         |
|                                                                      |
|  Fase 2: Planejamento                                                |
|  +-- Concluida                                                       |
|      +-- PRD: Concluido                                              |
|      +-- Personas: 3 definidas                                       |
|      +-- Backlog: 18 stories (89 pts)                                |
|                                                                      |
|  Fase 3: Design                                                      |
|  +-- Em Progresso                                                    |
|      +-- Tech Spec: Concluido                                        |
|      +-- Arquitetura: Diagramas C4 criados                           |
|      +-- Design API: Em Progresso (18/24 endpoints)                  |
|      +-- ADRs: 3 criados                                             |
|                                                                      |
|  Fase 4: Implementacao                                               |
|  +-- Pendente                                                        |
|      +-- Sprint 1: Pronto para iniciar (21 pts)                      |
|                                                                      |
+====================================================================+
| PROXIMA ACAO: Completar design da API                                |
| COMANDO: /workflow:design --continue                                 |
+====================================================================+
```

### Visao Detalhada (--verbose)

```
+==================================================================+
|                   STATUS DO WORKFLOW (DETALHADO)                     |
+====================================================================+
| Projeto: my-awesome-app                                              |
| Track: STANDARD                                                      |
| Inicio: 2026-01-07T10:00:00Z                                        |
| Ultima Atualizacao: 2026-01-07T15:30:00Z                            |
| Arquivo de Status: project-management/workflow-status.yaml           |
+====================================================================+
|                                                                      |
| ================================================================== |
| FASE 2: PLANEJAMENTO (Concluida)                                     |
| ================================================================== |
|                                                                      |
| PRD: project-management/prd.md                                       |
| +-- Versao: 1.0                                                      |
| +-- Requisitos Funcionais: 12                                        |
| +-- Requisitos Nao-Funcionais: 8                                     |
| +-- Metricas de Sucesso: 5 KPIs definidos                            |
| +-- Ultima Modificacao: 2026-01-07T11:00:00Z                         |
|                                                                      |
| Personas: project-management/personas.md                             |
| +-- Primarias: Business Owner, Freelancer                            |
| +-- Secundaria: Accountant                                           |
|                                                                      |
| Backlog: project-management/backlog/                                 |
| +-- EPICs: 4                                                         |
| |   +-- EPIC-001: User Management (21 pts)                           |
| |   +-- EPIC-002: Payment Integration (24 pts)                       |
| |   +-- EPIC-003: Reporting (23 pts)                                 |
| |   +-- EPIC-004: Notifications (21 pts)                             |
| +-- User Stories: 18                                                 |
| |   +-- P0 (Must Have): 8 stories                                    |
| |   +-- P1 (Should Have): 6 stories                                  |
| |   +-- P2 (Nice to Have): 4 stories                                 |
| +-- Total Story Points: 89                                           |
|                                                                      |
| Sprints Planejados:                                                  |
| +-- Sprint 1: Walking Skeleton (21 pts) - 5 stories                  |
| +-- Sprint 2: Core Features (28 pts) - 6 stories                     |
| +-- Sprint 3: Payments (24 pts) - 4 stories                          |
| +-- Sprint 4: Polish (16 pts) - 3 stories                            |
|                                                                      |
| ================================================================== |
| FASE 3: DESIGN (Em Progresso - 75%)                                  |
| ================================================================== |
|                                                                      |
| Tech Spec: project-management/tech-spec.md                           |
| +-- Versao: 1.0                                                      |
| +-- Arquitetura: Clean Architecture (Hexagonal)                      |
| +-- Stack: Symfony 7.x + React 18 + PostgreSQL 16                    |
| +-- Integracoes: Stripe, SendGrid, AWS S3                            |
|                                                                      |
| Arquitetura: project-management/architecture/                        |
| +-- c4-context.md - Diagrama de contexto do sistema                  |
| +-- c4-container.md - Diagrama de container                          |
| +-- c4-component.md - Diagrama de componente                         |
| +-- erd.md - Diagrama Entidade-Relacionamento (8 entidades)          |
|                                                                      |
| Design API: project-management/architecture/api.md                   |
| +-- Projetados: 18 endpoints                                         |
| +-- Restantes: 6 endpoints                                           |
| +-- Autenticacao: JWT com refresh tokens                              |
|                                                                      |
| ADRs: docs/adr/                                                      |
| +-- ADR-001: Database (PostgreSQL)                                    |
| +-- ADR-002: API Style (REST)                                        |
| +-- ADR-003: Authentication (JWT)                                     |
|                                                                      |
| Seguranca: project-management/architecture/security.md               |
| +-- Status: Pendente                                                  |
|                                                                      |
| ================================================================== |
| FASE 4: IMPLEMENTACAO (Pendente)                                     |
| ================================================================== |
|                                                                      |
| Sprint 1: sprint-001-walking-skeleton                                |
| +-- Status: Pronto para iniciar                                      |
| +-- Stories: 5                                                       |
| +-- Pontos: 21                                                       |
| +-- Tarefas: 0 (ainda nao decompostas)                               |
|                                                                      |
+====================================================================+
| SAUDE DO WORKFLOW                                                    |
+====================================================================+
| [OK] PRD alinhado com backlog                                        |
| [OK] Tech spec cobre todos os requisitos                             |
| [OK] Arquitetura documentada                                         |
| [!!] Design da API incompleto (6 endpoints restantes)                |
| [!!] Revisao de seguranca pendente                                   |
+====================================================================+
| PROXIMAS ACOES                                                       |
+====================================================================+
| 1. Completar design da API (6 endpoints restantes)                   |
|    Comando: /workflow:design --continue                              |
|                                                                      |
| 2. Completar revisao de seguranca                                    |
|    Comando: (incluido na fase de design)                             |
|                                                                      |
| 3. Em seguida, iniciar implementacao                                 |
|    Comando: /workflow:implement                                      |
+====================================================================+
```

### Sem Workflow Inicializado

```
+==================================================================+
|                       STATUS DO WORKFLOW                             |
+====================================================================+
|                                                                      |
|  Nenhum workflow inicializado para este projeto                      |
|                                                                      |
|  Para comecar, execute:                                              |
|                                                                      |
|    /workflow:init                                                    |
|                                                                      |
|  Isso ira:                                                           |
|  - Analisar o contexto do seu projeto                                |
|  - Recomendar o track adequado (Quick/Standard/Enterprise)           |
|  - Inicializar o acompanhamento do workflow                          |
|  - Guia-lo pelas fases de desenvolvimento                           |
|                                                                      |
+====================================================================+
```

### Status Quick Flow

```
+==================================================================+
|                       STATUS DO WORKFLOW                             |
+====================================================================+
| Projeto: my-awesome-app                                              |
| Track: QUICK FLOW                                                    |
| Inicio: 2026-01-07                                                   |
+====================================================================+
|                                                                      |
|  Quick Flow - Implementacao Direta                                   |
|  +-- Em Progresso                                                    |
|                                                                      |
|  Sem fases necessarias para Quick Flow.                              |
|  Trabalhando diretamente na implementacao.                           |
|                                                                      |
|  Tarefa Atual (se rastreada):                                        |
|  +-- TASK-042: Corrigir bug de validacao do login                    |
|      Status: Em Progresso                                            |
|                                                                      |
+====================================================================+
| COMANDOS DISPONIVEIS                                                 |
+====================================================================+
| - /qa:tdd     - Continuar com abordagem TDD             |
| - /project:move-task done - Marcar tarefa como concluida             |
| - /workflow:init          - Iniciar novo workflow                    |
+====================================================================+
```

## Estrutura do Arquivo de Status

O status e lido de `project-management/workflow-status.yaml`:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Track Standard - analise nao necessaria"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      personas:
        status: complete
        path: project-management/personas.md
        count: 3
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    started_at: 2026-01-07T12:00:00Z
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      architecture:
        status: complete
        path: project-management/architecture/
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
      adrs:
        status: complete
        count: 3
        path: docs/adr/
      security:
        status: pending
  implementation:
    status: pending
    sprints:
      - name: sprint-001-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Completar design da API"
next_command: "/workflow:design --continue"
```

## Comandos Relacionados

- `/workflow:init` - Inicializar novo workflow
- `/workflow:analyze` - Fase de analise
- `/workflow:plan` - Fase de planejamento
- `/workflow:design` - Fase de design
- `/workflow:implement` - Fase de implementacao
