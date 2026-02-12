---
name: workflow-implement
description: Executar a fase de Implementacao - desenvolvimento em sprints com TDD/BDD
arguments:
  - name: sprint
    description: Numero especifico do sprint a trabalhar
    required: false
---

# /workflow:implement

## Missao

Executar a fase de Implementacao do workflow de desenvolvimento. Esta fase foca no desenvolvimento sprint a sprint utilizando praticas TDD/BDD, seguindo o design tecnico estabelecido nas fases anteriores.

## Quando Utilizar

- Apos `/workflow:design` estar concluido (tracks Standard/Enterprise)
- Apos `/workflow:init` para o track Quick Flow
- Quando estiver pronto para comecar a codificar

## Pre-requisitos

Para tracks Standard/Enterprise:
- Tech Spec existente em `project-management/tech-spec.md`
- Backlog existente em `project-management/backlog/`
- Estrutura de sprint definida em `project-management/sprints/`

Para Quick Flow:
- Compreensao clara do bug/funcionalidade a implementar

## Workflow

### Etapa 1: Configuracao da Implementacao

```
+==============================================================+
|           FASE DE IMPLEMENTACAO - INICIANDO                     |
+================================================================+
| Track: Standard                                                 |
| Fase: 4 de 4 - Implementacao                                   |
|                                                                 |
| Objetivos:                                                      |
| - Executar desenvolvimento em sprint com TDD/BDD                |
| - Implementar user stories seguindo o tech spec                 |
| - Manter qualidade de codigo e cobertura de testes              |
| - Completar Definition of Done para cada story                  |
+================================================================+
```

### Etapa 2: Selecao de Sprint

```
+==============================================================+
|               VISAO GERAL DOS SPRINTS                           |
+================================================================+
|                                                                 |
| Sprints Disponiveis:                                            |
|                                                                 |
| +-----------------------------------------------------+        |
| | Sprint 1: Walking Skeleton                           |        |
| | Status: Pronto para iniciar                          |        |
| | Stories: 5 | Pontos: 21                              |        |
| | Foco: Infraestrutura + primeira feature end-to-end   |        |
| +-----------------------------------------------------+        |
|                                                                 |
| +-----------------------------------------------------+        |
| | Sprint 2: Core Features                              |        |
| | Status: Planejado                                    |        |
| | Stories: 6 | Pontos: 28                              |        |
| | Foco: Gestao de usuarios, autenticacao               |        |
| +-----------------------------------------------------+        |
|                                                                 |
| +-----------------------------------------------------+        |
| | Sprint 3: Integracao de Pagamento                    |        |
| | Status: Planejado                                    |        |
| | Stories: 4 | Pontos: 24                              |        |
| | Foco: Integracao Stripe, fluxo de checkout           |        |
| +-----------------------------------------------------+        |
|                                                                 |
| Selecione o sprint (padrao: Sprint 1)                           |
+================================================================+
```

### Etapa 3: Redirecionamento para Desenvolvimento do Sprint

Para execucao completa do sprint, este comando redireciona para o comando especializado sprint-dev:

```
+==============================================================+
|           INICIANDO DESENVOLVIMENTO DO SPRINT                   |
+================================================================+
|                                                                 |
| Invocando: /sprint:dev sprint-001-walking-skeleton      |
|                                                                 |
| Funcionalidades do Modo de Desenvolvimento do Sprint:           |
| - Plan mode obrigatorio antes de cada tarefa                    |
| - Ciclo TDD: RED -> GREEN -> REFACTOR                           |
| - Atualizacoes automaticas de status                            |
| - Conventional commits com referencias de stories               |
| - Validacao de Definition of Done                               |
|                                                                 |
+================================================================+
```

### Etapa 4: Orientacao de Implementacao

Fornecer contexto da fase de design:

```
+==============================================================+
|           CONTEXTO DE IMPLEMENTACAO                             |
+================================================================+
|                                                                 |
| Do Tech Spec:                                                   |
| +-- Arquitetura: Clean Architecture (Hexagonal)                 |
| +-- Estilo API: REST com JSON:API                               |
| +-- Autenticacao: JWT com refresh tokens                        |
| +-- Banco de dados: PostgreSQL com Doctrine ORM                 |
| +-- Testes: PHPUnit + Jest + Playwright                         |
|                                                                 |
| ADRs Relevantes:                                                |
| +-- ADR-001: Escolha do banco (PostgreSQL)                      |
| +-- ADR-002: Estilo de API (REST)                               |
| +-- ADR-003: Autenticacao (JWT)                                 |
|                                                                 |
| Padroes de Codigo:                                              |
| +-- Seguir padroes existentes no codebase                       |
| +-- Meta de cobertura de testes: 80%                            |
| +-- Utilizar regras especificas da tecnologia:                  |
|     /symfony:*, /react:*, etc.                                  |
|                                                                 |
+================================================================+
```

### Etapa 5: Modo Quick Flow

Para o track Quick Flow (bug fixes, features pequenas):

```
+==============================================================+
|           QUICK FLOW - IMPLEMENTACAO DIRETA                     |
+================================================================+
|                                                                 |
| Sem necessidade de estrutura de sprint para Quick Flow.         |
|                                                                 |
| Comandos Disponiveis:                                           |
|                                                                 |
| Para Bug Fixes:                                                 |
| - /qa:tdd        - Corrigir com abordagem TDD      |
|                                                                 |
| Para Features Pequenas:                                         |
| - /{tech}:* comandos         - Especificos por tecnologia       |
|                                                                 |
| Acompanhamento:                                                 |
| - /project:add-task          - Registrar como tarefa            |
| - /project:move-task done    - Marcar como concluida            |
|                                                                 |
+================================================================+
```

### Etapa 6: Conclusao do Sprint

Apos a conclusao do sprint:

```
+==============================================================+
|           SPRINT CONCLUIDO                                      |
+================================================================+
|                                                                 |
| Sprint 1: Walking Skeleton                                      |
| Status: Concluido                                               |
|                                                                 |
| Metricas:                                                       |
| +-- Stories concluidas: 5/5                                     |
| +-- Pontos entregues: 21                                        |
| +-- Velocidade: 21 pts/sprint                                   |
| +-- Cobertura de testes: 82%                                    |
| +-- Commits: 23                                                 |
|                                                                 |
| Artefatos:                                                      |
| +-- sprint-review.md gerado                                     |
| +-- sprint-retro.md template pronto                             |
|                                                                 |
| ------------------------------------------------------------- |
| PROXIMAS ACOES:                                                 |
| ------------------------------------------------------------- |
|                                                                 |
| 1. /workflow:review     - Conduzir revisao do sprint       |
| 2. /workflow:retro      - Executar retrospectiva           |
| 3. /workflow:implement 2     - Iniciar Sprint 2                 |
|                                                                 |
| Ou verificar progresso geral: /workflow:status                  |
+================================================================+
```

### Etapa 7: Conclusao do Workflow

Quando todos os sprints estao concluidos:

```
+==============================================================+
|           FASE DE IMPLEMENTACAO CONCLUIDA                       |
+================================================================+
|                                                                 |
| Todos os sprints planejados concluidos!                         |
|                                                                 |
| Resumo do Projeto:                                              |
| +-- Total de Sprints: 4                                         |
| +-- Total de Stories: 18                                        |
| +-- Total de Pontos: 89                                         |
| +-- Velocidade Media: 22 pts/sprint                             |
| +-- Cobertura de Testes: 84%                                    |
| +-- Total de Commits: 87                                        |
|                                                                 |
| Proximos Passos:                                                |
| - /common:release-checklist  - Preparar para lancamento         |
| - /common:generate-changelog - Gerar notas de lancamento        |
| - Deploy para staging/producao                                  |
|                                                                 |
| =============================================================  |
|           WORKFLOW DO PROJETO CONCLUIDO!                         |
| =============================================================  |
+================================================================+
```

## Agentes Envolvidos

- **tech-lead**: Decomposicao de tarefas, orientacao de arquitetura
- **tdd-coach**: Orientacao na metodologia TDD/BDD
- **{tech}-reviewer**: Code review (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD e deploy

## Comandos Relacionados

- `/workflow:design` - Fase anterior
- `/workflow:status` - Verificar progresso
- `/sprint:dev` - Modo completo de desenvolvimento do sprint
- `/qa:tdd` - Correcoes rapidas de bugs
- `/workflow:review` - Cerimonia de revisao do sprint
- `/workflow:retro` - Retrospectiva do sprint
