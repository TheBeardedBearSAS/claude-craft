---
name: workflow-init
description: Analisar o contexto do projeto e recomendar o track de desenvolvimento ideal
arguments:
  - name: scope
    description: Dica de escopo opcional (bug, feature, platform, migration)
    required: false
  - name: track
    description: Forcar um track especifico (--quick, --standard, --enterprise)
    required: false
---

# /workflow:init

## Missao

Analisar o contexto atual do projeto e recomendar o track de desenvolvimento ideal. Inicializar o acompanhamento do workflow e guiar o usuario pelas fases adequadas.

## Workflow

### Etapa 1: Descoberta de Contexto

```
+==============================================================+
|             INICIALIZACAO DO WORKFLOW                            |
+================================================================+
| Analisando contexto do projeto...                               |
+================================================================+
```

**Analisar:**

1. **Estrutura do Projeto**
   - Verificar existencia do diretorio `.claude/`
   - Detectar stack tecnologico a partir dos arquivos
   - Identificar framework (Symfony, Flutter, React, etc.)

2. **Documentacao Existente**
   - `project-management/prd.md` - PRD existe?
   - `project-management/tech-spec.md` - Tech Spec existe?
   - `project-management/backlog/` - Backlog existe?
   - `README.md` - Descricao do projeto

3. **Tamanho do Codebase**
   - Contar arquivos fonte
   - Estimar complexidade
   - Identificar componentes/modulos

4. **Contexto Git**
   - Branch atual
   - Commits recentes
   - Mudancas em aberto

### Etapa 2: Avaliacao de Complexidade

**Matriz de Pontuacao:**

| Fator | Quick (1) | Standard (2) | Enterprise (3) |
|-------|-----------|--------------|----------------|
| Arquivos a modificar | 1-5 | 5-50 | 50+ |
| Novas entidades/tabelas | 0 | 1-3 | 4+ |
| Integracoes externas | 0 | 1 | 2+ |
| User stories estimadas | 1-3 | 3-15 | 15+ |
| Equipes envolvidas | 1 | 1 | 2+ |
| Implicacoes de seguranca | Baixa | Media | Alta |

**Calcular Pontuacao:**
- Pontuacao 6-8: Quick Flow
- Pontuacao 9-14: Standard
- Pontuacao 15+: Enterprise

### Etapa 3: Recomendacao de Track

```
+==============================================================+
|               ANALISE DO PROJETO CONCLUIDA                      |
+================================================================+
| Projeto: my-awesome-app                                         |
| Stack: Symfony 7.x + React 18                                   |
| Status: Projeto existente com backlog                           |
+================================================================+
|                                                                 |
| AVALIACAO DE COMPLEXIDADE:                                      |
| +-- Arquivos impactados:    ~25        [Standard]               |
| +-- Novas entidades:        2          [Standard]               |
| +-- Integracoes:            1 (Stripe) [Standard]               |
| +-- Stories estimadas:      8          [Standard]               |
| +-- Equipes:                1          [Quick]                  |
| +-- Seguranca:              Alta       [Enterprise]             |
|                                                                 |
| =============================================================  |
| TRACK RECOMENDADO: STANDARD                                     |
| =============================================================  |
|                                                                 |
| Justificativa:                                                  |
| - Escopo da feature requer planejamento (8 stories)             |
| - Integracao externa precisa de design tecnico                  |
| - Implicacoes de seguranca requerem arquitetura cuidadosa       |
| - Equipe unica pode lidar sem processo enterprise completo      |
|                                                                 |
+================================================================+
```

### Etapa 4: Planejamento de Fases

Com base no track, mostrar o workflow:

**Quick Flow:**
```
+==============================================================+
|              WORKFLOW QUICK FLOW                                |
+================================================================+
|                                                                 |
|  +------------------+                                           |
|  |  IMPLEMENTACAO   | <- Comece aqui                            |
|  +------------------+                                           |
|                                                                 |
| Sem documentacao necessaria. Direto para a codificacao.         |
|                                                                 |
| Comandos:                                                       |
| - /common:fix-bug-tdd    - Corrigir com TDD                    |
| - /project:add-task      - Registrar o trabalho                |
|                                                                 |
+================================================================+
```

**Standard:**
```
+==============================================================+
|              WORKFLOW STANDARD                                  |
+================================================================+
|                                                                 |
|  +------------+    +----------+    +--------------+             |
|  | PLANEJAM.  | -> |  DESIGN  | -> |IMPLEMENTACAO |             |
|  +------------+    +----------+    +--------------+             |
|       ^                                                         |
|   Comece aqui                                                   |
|                                                                 |
| Fase 1 - Planejamento:                                          |
| - /project:generate-prd    - Criar/atualizar PRD                |
| - /project:generate-backlog - Criar user stories                |
|                                                                 |
| Fase 2 - Design:                                                |
| - /project:generate-tech-spec - Design tecnico                  |
|                                                                 |
| Fase 3 - Implementacao:                                         |
| - /project:sprint-dev      - Desenvolvimento TDD/BDD            |
|                                                                 |
+================================================================+
```

**Enterprise:**
```
+==============================================================+
|              WORKFLOW ENTERPRISE                                |
+================================================================+
|                                                                 |
|  +----------+  +----------+  +--------+  +--------------+      |
|  | ANALISE  |->| PLANEJ.  |->| DESIGN |->|IMPLEMENTACAO |      |
|  +----------+  +----------+  +--------+  +--------------+      |
|       ^                                                         |
|   Comece aqui                                                   |
|                                                                 |
| Fase 1 - Analise:                                               |
| - /workflow:analyze        - Pesquisa e exploracao              |
|                                                                 |
| Fase 2 - Planejamento:                                          |
| - /project:generate-prd    - PRD completo                       |
| - /project:generate-backlog - Backlog completo                  |
|                                                                 |
| Fase 3 - Design:                                                |
| - /project:generate-tech-spec - Tech spec completo              |
| - /common:architecture-decision - ADRs                          |
|                                                                 |
| Fase 4 - Implementacao:                                         |
| - /project:sprint-dev      - Desenvolvimento sprint a sprint    |
|                                                                 |
+================================================================+
```

### Etapa 5: Inicializar Acompanhamento

Criar arquivo de status do workflow:

```yaml
# project-management/workflow-status.yaml
project: my-awesome-app
track: standard
initialized_at: 2026-01-07T10:00:00Z
current_phase: planning

phases:
  analysis:
    status: skipped
    reason: "Track Standard - analise nao necessaria"
  planning:
    status: pending
    artifacts:
      prd: pending
      personas: pending
      backlog: pending
  design:
    status: pending
    artifacts:
      tech_spec: pending
      architecture: pending
  implementation:
    status: pending

next_action: "Gerar ou atualizar PRD"
next_command: "/project:generate-prd"
```

### Etapa 6: Indicar Proxima Acao

```
+==============================================================+
|                    PRONTO PARA COMECAR                          |
+================================================================+
| Workflow inicializado: track STANDARD                           |
| Arquivo de status: project-management/workflow-status.yaml      |
|                                                                 |
| ------------------------------------------------------------- |
| PROXIMO PASSO: Fase de Planejamento                             |
| ------------------------------------------------------------- |
|                                                                 |
| Comece com: /workflow:plan                                      |
|                                                                 |
| Ou va direto para tarefas especificas:                          |
| - /project:generate-prd     - Criar documento de requisitos     |
| - /project:generate-backlog - Criar user stories                |
|                                                                 |
| Verifique o progresso a qualquer momento: /workflow:status      |
+================================================================+
```

## Opcoes de Override

```bash
# Forcar track especifico
/workflow:init --quick          # Forcar Quick Flow
/workflow:init --standard       # Forcar Standard
/workflow:init --enterprise     # Forcar Enterprise

# Fornecer dica de escopo
/workflow:init bug              # Dica: correcao de bug
/workflow:init feature          # Dica: nova funcionalidade
/workflow:init platform         # Dica: trabalho de plataforma
```

## Comandos Relacionados

- `/workflow:status` - Verificar progresso atual do workflow
- `/workflow:plan` - Iniciar fase de planejamento
- `/workflow:design` - Iniciar fase de design
- `/workflow:implement` - Iniciar fase de implementacao
- `/workflow:analyze` - Iniciar fase de analise (somente Enterprise)
