---
name: workflow-design
description: Executar a fase de Design (Solutioning) - especificacao tecnica e arquitetura
arguments:
  - name: continue
    description: Continuar de onde parou
    required: false
---

# /workflow:design

## Missao

Executar a fase de Design (Solutioning) do workflow de desenvolvimento. Esta fase foca na criacao da Especificacao Tecnica, no design da arquitetura e na documentacao das principais decisoes tecnicas.

## Modo Plano

> **O modo plano é recomendado.** Claude ativa o modo plano para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar artefatos.

## Quando Utilizar

- Tracks **Standard** e **Enterprise**
- Apos `/workflow:plan` estar concluido
- Quando PRD e backlog estao prontos

## Pre-requisitos

- PRD existente em `project-management/prd.md`
- Backlog existente em `project-management/backlog/`

## Workflow

### Etapa 1: Configuracao do Design

```
+==============================================================+
|              FASE DE DESIGN - INICIANDO                         |
+================================================================+
| Track: Standard                                                 |
| Fase: 3 de 4 - Design (Solutioning)                            |
|                                                                 |
| Objetivos:                                                      |
| - Criar Especificacao Tecnica a partir do PRD                   |
| - Projetar a arquitetura do sistema (diagramas C4)              |
| - Definir modelo de dados e design de API                       |
| - Documentar Architecture Decision Records (ADRs)               |
| - Planejar a estrategia de testes                               |
+================================================================+
```

### Etapa 2: Carregar Artefatos do Planejamento

```
+==============================================================+
|              CARREGANDO ARTEFATOS DO PLANEJAMENTO               |
+================================================================+
|                                                                 |
| Analise do PRD:                                                 |
| +-- prd.md carregado                                            |
| +-- Requisitos funcionais: 12                                   |
| +-- Requisitos nao-funcionais: 8                                |
| +-- Integracoes necessarias: 2                                  |
|                                                                 |
| Resumo do Backlog:                                              |
| +-- backlog/ carregado                                          |
| +-- EPICs: 4                                                    |
| +-- User Stories: 18                                            |
| +-- Total de Story Points: 89                                   |
|                                                                 |
| Restricoes (se Enterprise):                                     |
| +-- analysis/constraints.md carregado                           |
|                                                                 |
+================================================================+
```

### Etapa 3: Tarefas de Design

Executar as tarefas de design em ordem:

```
+==============================================================+
|                 TAREFAS DE DESIGN                               |
+================================================================+
|                                                                 |
| [ ] Tarefa 1: Gerar Tech Spec                                  |
|   Comando: /project:generate-tech-spec                          |
|   Saida: project-management/tech-spec.md                        |
|                                                                 |
| [ ] Tarefa 2: Design de Arquitetura                             |
|   Criar diagramas C4 (contexto, container, componente)          |
|   Saida: project-management/architecture/                       |
|                                                                 |
| [ ] Tarefa 3: Design do Modelo de Dados                        |
|   ERD e schema do banco de dados                                |
|   Saida: project-management/architecture/erd.md                 |
|                                                                 |
| [ ] Tarefa 4: Design de API                                    |
|   Endpoints, payloads, autenticacao                             |
|   Saida: project-management/architecture/api.md                 |
|                                                                 |
| [ ] Tarefa 5: Criar ADRs                                       |
|   Documentar decisoes tecnicas importantes                      |
|   Saida: docs/adr/                                              |
|                                                                 |
| [ ] Tarefa 6: Revisao de Seguranca                             |
|   Checklist OWASP, estrategia de autenticacao                   |
|   Saida: project-management/architecture/security.md            |
|                                                                 |
+================================================================+
```

### Etapa 4: Executar Geracao do Tech Spec

```
Iniciando /project:generate-tech-spec...

Analisando requisitos do PRD...
Detectando padroes do codebase existente...

[Workflow de geracao do Tech Spec executa com Q&A interativo]

Tech Spec criado: project-management/tech-spec.md
```

### Etapa 5: Diagramas de Arquitetura

Gerar diagramas de arquitetura C4:

```
+==============================================================+
|             DIAGRAMAS DE ARQUITETURA                            |
+================================================================+
|                                                                 |
| C4 Nivel 1 - Contexto do Sistema:                              |
| +-----------------------------------------------------+        |
| |                                                     |        |
| |     [User] -------> [Nosso Sistema] -------> [Stripe]|       |
| |                         |                           |        |
| |                         v                           |        |
| |                    [SendGrid]                       |        |
| |                                                     |        |
| +-----------------------------------------------------+        |
|                                                                 |
| C4 Nivel 2 - Container:                                        |
| +-----------------------------------------------------+        |
| |                                                     |        |
| |  [React SPA] --> [Symfony API] --> [PostgreSQL]     |        |
| |                       |                             |        |
| |                       v                             |        |
| |                    [Redis]                          |        |
| |                                                     |        |
| +-----------------------------------------------------+        |
|                                                                 |
| Arquivos criados:                                               |
| +-- architecture/c4-context.md                                  |
| +-- architecture/c4-container.md                                |
| +-- architecture/c4-component.md                                |
|                                                                 |
+================================================================+
```

### Etapa 6: Criacao de ADRs

Documentar decisoes de arquitetura importantes:

```
+==============================================================+
|        ARCHITECTURE DECISION RECORDS (ADRs)                     |
+================================================================+
|                                                                 |
| ADRs Criados:                                                   |
|                                                                 |
| +-----------------------------------------------------+        |
| | ADR-001: Escolha do Banco de Dados                   |        |
| | Decisao: PostgreSQL                                  |        |
| | Justificativa: Conformidade ACID, suporte JSON       |        |
| +-----------------------------------------------------+        |
|                                                                 |
| +-----------------------------------------------------+        |
| | ADR-002: Estilo de API                               |        |
| | Decisao: REST com JSON:API                           |        |
| | Justificativa: Expertise da equipe, cache, simplicid.|        |
| +-----------------------------------------------------+        |
|                                                                 |
| +-----------------------------------------------------+        |
| | ADR-003: Autenticacao                                |        |
| | Decisao: JWT com refresh tokens                      |        |
| | Justificativa: Stateless, mobile-friendly, padrao    |        |
| +-----------------------------------------------------+        |
|                                                                 |
| Arquivos: docs/adr/ADR-001.md, ADR-002.md, ADR-003.md          |
|                                                                 |
+================================================================+
```

### Etapa 7: Gate de Revisao do Design

```
+==============================================================+
|              GATE DE REVISAO DO DESIGN                          |
+================================================================+
|                                                                 |
| Checklist:                                                      |
| [x] Tech Spec cobre todos os requisitos do PRD                 |
| [x] Arquitetura suporta NFRs (performance, seguranca)          |
| [x] Modelo de dados contempla todas as entidades               |
| [x] Design de API cobre todas as user stories                  |
| [x] Consideracoes de seguranca documentadas                    |
| [x] Estrategia de testes definida                              |
| [x] Abordagem de deploy documentada                            |
|                                                                 |
| Perguntas de Revisao:                                           |
| 1. A arquitetura e adequada para a escala?                      |
| 2. Ha integracoes faltando?                                     |
| 3. A abordagem de seguranca e suficiente?                       |
| 4. Os ADRs estao completos e justificados?                      |
|                                                                 |
+================================================================+
```

### Etapa 8: Conclusao da Fase

```
+==============================================================+
|              FASE DE DESIGN CONCLUIDA                           |
+================================================================+
|                                                                 |
| Artefatos Criados:                                              |
| - tech-spec.md            Especificacao Tecnica                 |
| - architecture/                                                 |
|    +-- c4-context.md      Diagrama de contexto do sistema       |
|    +-- c4-container.md    Diagrama de container                 |
|    +-- c4-component.md    Diagrama de componente                |
|    +-- erd.md             Diagrama Entidade-Relacionamento      |
|    +-- api.md             Design de API                         |
|    +-- security.md        Consideracoes de seguranca            |
| - docs/adr/               3 Architecture Decision Records       |
|                                                                 |
| Resumo:                                                         |
| - 24 endpoints de API projetados                                |
| - 8 entidades de banco de dados definidas                       |
| - 3 integracoes externas especificadas                          |
| - Meta de 80% de cobertura de testes definida                   |
|                                                                 |
| ------------------------------------------------------------- |
| PROXIMA FASE: Implementacao                                     |
| Comando: /workflow:implement                                    |
| ------------------------------------------------------------- |
|                                                                 |
| Pronto para iniciar o desenvolvimento do Sprint 1!              |
+================================================================+
```

## Agentes Envolvidos

- **tech-lead**: Design tecnico geral e criacao de ADRs
- **api-designer**: Design de API REST/GraphQL
- **database-architect**: Modelo de dados e design de schema
- **ui-designer**: Arquitetura frontend (se aplicavel)
- **devops-engineer**: Design de deploy e infraestrutura

## Arquivos de Saida

| Arquivo | Finalidade |
|---------|------------|
| `tech-spec.md` | Especificacao Tecnica completa |
| `architecture/c4-*.md` | Diagramas de arquitetura C4 |
| `architecture/erd.md` | Diagrama Entidade-Relacionamento |
| `architecture/api.md` | Documentacao de endpoints da API |
| `architecture/security.md` | Design de seguranca |
| `docs/adr/*.md` | Architecture Decision Records |

## Comandos Relacionados

- `/workflow:plan` - Fase anterior
- `/workflow:implement` - Proxima fase
- `/workflow:status` - Verificar progresso
- `/project:generate-tech-spec` - Geracao direta do tech spec
- `/common:architecture-decision` - Criar ADRs individuais
