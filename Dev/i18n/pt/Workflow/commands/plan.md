---
name: workflow-plan
description: Executar a fase de Planejamento - criacao de PRD, personas e geracao de backlog
arguments:
  - name: continue
    description: Continuar de onde parou
    required: false
---

# /workflow:plan

## Missao

Executar a fase de Planejamento do workflow de desenvolvimento. Esta fase foca na criacao do Documento de Requisitos do Produto, definicao de personas e geracao do backlog inicial do produto.

## Quando Utilizar

- Tracks **Standard** e **Enterprise**
- Apos `/workflow:init` (ou `/workflow:analyze` para Enterprise)
- Ao iniciar o planejamento de uma feature

## Workflow

### Etapa 1: Configuracao do Planejamento

```
+==============================================================+
|             FASE DE PLANEJAMENTO - INICIANDO                    |
+================================================================+
| Track: Standard                                                 |
| Fase: 2 de 4 - Planejamento                                    |
|                                                                 |
| Objetivos:                                                      |
| - Criar ou atualizar o Documento de Requisitos do Produto       |
| - Definir personas de usuario                                   |
| - Gerar backlog do produto com user stories priorizadas         |
| - Definir metricas de sucesso e KPIs                            |
+================================================================+
```

### Etapa 2: Verificar Artefatos Existentes

```
+==============================================================+
|              VERIFICACAO DE ARTEFATOS EXISTENTES                |
+================================================================+
|                                                                 |
| Verificando project-management/ ...                             |
|                                                                 |
| PRD:                                                            |
| +-- prd.md                          Nao encontrado              |
|                                                                 |
| Personas:                                                       |
| +-- personas.md                     Nao encontrado              |
|                                                                 |
| Backlog:                                                        |
| +-- backlog/                        Nao encontrado              |
|                                                                 |
| Analise (Enterprise):                                           |
| +-- analysis/constraints.md        Disponivel                   |
| +-- analysis/research.md           Disponivel                   |
|                                                                 |
+================================================================+
```

### Etapa 3: Tarefas de Planejamento

Executar tarefas de planejamento em ordem:

```
+==============================================================+
|               TAREFAS DE PLANEJAMENTO                           |
+================================================================+
|                                                                 |
| [ ] Tarefa 1: Gerar PRD                                        |
|   Comando: /project:generate-prd                                |
|   Saida: project-management/prd.md                              |
|                                                                 |
| [ ] Tarefa 2: Definir Personas                                  |
|   (Incluido na geracao do PRD)                                  |
|   Saida: project-management/personas.md                         |
|                                                                 |
| [ ] Tarefa 3: Gerar Backlog                                     |
|   Comando: /project:generate-backlog                            |
|   Saida: project-management/backlog/                            |
|                                                                 |
| [ ] Tarefa 4: Validar Backlog                                   |
|   Comando: /gate:validate-backlog                            |
|   Garante conformidade SCRUM                                    |
|                                                                 |
+================================================================+
```

### Etapa 4: Executar Geracao do PRD

Invocar o comando de geracao do PRD:

```
Iniciando /project:generate-prd...

[Workflow de geracao do PRD executa]

PRD criado: project-management/prd.md
Personas extraidas: project-management/personas.md
```

### Etapa 5: Executar Geracao do Backlog

Apos o PRD estar completo:

```
Iniciando /project:generate-backlog...

Usando PRD como entrada:
- 3 personas identificadas
- 12 requisitos funcionais extraidos
- 8 requisitos nao-funcionais anotados

Gerando estrutura do backlog...

[Workflow de geracao do backlog executa]

Backlog criado com:
   - 4 EPICs
   - 18 User Stories
   - Sprint 1 planejado (Walking Skeleton)
```

### Etapa 6: Validacao

Executar validacao do backlog:

```
+==============================================================+
|              VALIDACAO DO BACKLOG                                |
+================================================================+
|                                                                 |
| Verificacao de Criterios INVEST:                                |
| +-- Independent:    18/18                                       |
| +-- Negotiable:     18/18                                       |
| +-- Valuable:       18/18                                       |
| +-- Estimable:      18/18                                       |
| +-- Sized (<=8pts): 16/18 (2 stories precisam dividir)          |
| +-- Testable:       18/18                                       |
|                                                                 |
| Verificacao de Criterios 3C:                                    |
| +-- Card:           18/18                                       |
| +-- Conversation:   18/18                                       |
| +-- Confirmation:   18/18                                       |
|                                                                 |
| Criterios de Aceitacao (Gherkin):                               |
| +-- Formato valido: 18/18                                       |
|                                                                 |
| AVISOS:                                                         |
| - US-007: 13 pontos - considerar dividir                        |
| - US-012: 21 pontos - deve ser dividida                         |
|                                                                 |
+================================================================+
```

### Etapa 7: Conclusao da Fase

```
+==============================================================+
|             FASE DE PLANEJAMENTO CONCLUIDA                      |
+================================================================+
|                                                                 |
| Artefatos Criados:                                              |
| - prd.md              Documento de Requisitos do Produto        |
| - personas.md         3 personas de usuario                     |
| - backlog/            Backlog SCRUM completo                    |
|    +-- epics/         4 EPICs                                   |
|    +-- user-stories/  18 User Stories                           |
|                                                                 |
| Resumo:                                                         |
| - Total de Story Points: 89                                     |
| - Escopo do Sprint 1: 21 pontos (Walking Skeleton)              |
| - Sprints estimados: 4-5                                        |
|                                                                 |
| ------------------------------------------------------------- |
| PROXIMA FASE: Design (Solutioning)                              |
| Comando: /workflow:design                                       |
| ------------------------------------------------------------- |
|                                                                 |
| O tech spec sera baseado nos requisitos do PRD.                 |
+================================================================+
```

## Agentes Envolvidos

- **product-owner**: Criacao do PRD, definicao de personas, priorizacao
- **tech-lead**: Revisao de viabilidade tecnica, orientacao de estimativas

## Arquivos de Saida

| Arquivo | Finalidade |
|---------|------------|
| `prd.md` | Documento de Requisitos do Produto |
| `personas.md` | Definicoes de personas de usuario |
| `backlog/epics/` | Definicoes de EPICs |
| `backlog/user-stories/` | Arquivos de User Stories |
| `sprints/sprint-001/` | Estrutura do primeiro sprint |

## Opcao de Continuacao

Se interrompido, use `--continue` para retomar:

```bash
/workflow:plan --continue

# Detecta:
# PRD completo
# Backlog em progresso (12/18 stories)
# -> Continua a partir da story 13
```

## Comandos Relacionados

- `/workflow:init` - Inicializar workflow
- `/workflow:analyze` - Fase anterior (Enterprise)
- `/workflow:design` - Proxima fase
- `/workflow:status` - Verificar progresso
- `/project:generate-prd` - Geracao direta do PRD
- `/project:generate-backlog` - Geracao direta do backlog
