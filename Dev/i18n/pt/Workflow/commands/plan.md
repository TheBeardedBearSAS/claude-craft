---
name: workflow-plan
description: "Executar a fase de Planejamento - pesquisa (--research), PRD (--only=prd) e backlog SCRUM (--only=backlog)"
argument-hint: "[--research] [--only=prd|backlog] [--continue]"
arguments:
  - name: research
    description: "Executar primeiro a etapa de pesquisa (antigo /workflow:plan --research): domínio, mercado, pesquisa técnica, restrições, riscos"
    required: false
  - name: only
    description: "Executar uma única etapa: prd (PRD + personas) ou backlog (personas, DoD, epics, user stories, sprints)"
    required: false
  - name: continue
    description: Continuar de onde parou
    required: false
---

# /workflow:plan

## Missão

Executar a fase de Planejamento do workflow de desenvolvimento: pesquisa opcional, Product Requirements Document (PRD), personas e backlog SCRUM (epics, user stories, pastas de sprint). Este comando contém toda a lógica de geração; não há mais um gerador de PRD ou de backlog separado para chamar.

## Usage

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/workflow:plan` | Fase completa: PRD e depois backlog (adicione `--research` para começar pela pesquisa) | - |
| `/workflow:plan --research` | Pesquisa, exploração, restrições e riscos, antes do PRD. Escreve `project-management/analysis/` | `/workflow:plan --research` |
| `/workflow:plan --only=prd` | Apenas PRD + personas. Escreve `project-management/prd.md` | `/workflow:plan --only=prd` |
| `/workflow:plan --only=backlog` | Apenas backlog: lê `project-management/prd.md` (+ `project-management/tech-spec.md` se existir), escreve personas, DoD, epics, user stories com `**Implements**`, pastas de sprint `sprint-{N}-{slug}`, e registra as stories em `.bmad/sprint-status.yaml` com status `backlog` | `/workflow:plan --only=backlog` |
| `/workflow:plan --continue` | Retomar uma execução interrompida | - |

`--research` pode ser combinado com `--only=prd` (pesquisa e depois PRD).

## Ordem canônica

Os documentos são produzidos nesta ordem: **PRD, depois tech spec, depois backlog, depois sprint**.

- **Track Quick**: `/workflow:plan` (sem opções) gera PRD + backlog de uma só vez.
- **Standard / Enterprise (recomendado)**: `/workflow:plan --only=prd`, depois `/workflow:design`, depois `/workflow:plan --only=backlog`. O backlog lê então `project-management/prd.md` e `project-management/tech-spec.md`: as stories carregam a arquitetura real e `**Implements**` aponta para os `FR-xxx` do PRD.
- **Enterprise**: começar com `/workflow:plan --research --only=prd`.

Sem PRD, `--only=backlog` recorre às especificações de `./docs/` (ARCHITECTURE_TECHNIQUE*.md, CAHIER_DES_CHARGES*.md ou qualquer outro arquivo de especificação) e avisa que a rastreabilidade fica degradada.

## Quando usar

- Tracks **Standard** e **Enterprise**, após `/workflow:init`
- Ao iniciar o planejamento de funcionalidades, ou quando o PRD ou o backlog precisa ser regenerado

## Plan Mode

> **O Plan Mode é obrigatório.** O Claude ativa o plan mode para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar os artefatos.

## Workflow

### Passo 1: Preparação e artefatos existentes

Mostrar o track e a fase (Planejamento = fase 2 de 4) e depois verificar `project-management/`: `prd.md`, `personas.md`, `backlog/`, `analysis/` (constraints.md, research-summary.md). Arquivos existentes nunca são sobrescritos silenciosamente: perguntar se deve atualizar, mesclar ou ignorar.

### Passo 2 (`--research`): Fase de pesquisa

Antigo `/workflow:plan --research`. Pesquisa, exploração e restrições antes do PRD.

**Perguntas guiadas**

| Área | Perguntas |
|------|-----------|
| Domínio | Qual problema? Quais partes interessadas? Motores de negócio? Como é o sucesso? |
| Mercado | Soluções existentes? Concorrentes? Boas práticas do setor? Tendências emergentes? |
| Técnica | Tecnologias candidatas? Integrações? Escalabilidade? Segurança / conformidade? |

Se o MCP Context7 estiver configurado, usá-lo para documentação técnica atualizada (`/deep-research` para pesquisa web aprofundada; fora do claude.ai, o agente `@research-assistant`).

**Restrições**: documentar as restrições técnicas (backend existente, banco de dados), de negócio (orçamento, prazos, retrocompatibilidade), regulatórias (LGPD/GDPR, PCI DSS) e de recursos (tamanho da equipe, sem DevOps).

**Riscos e oportunidades**: tabela de riscos (risco, impacto, probabilidade, mitigação) e oportunidades.

**Artefatos**

```
project-management/analysis/
├── research-summary.md      # Principais conclusões
├── constraints.md           # Todas as restrições identificadas
├── risks-opportunities.md   # Registro de riscos e oportunidades
└── technical-options.md     # Avaliação de tecnologias
```

Agentes: **research-assistant** (pesquisa técnica), **product-owner** (contexto de negócio). Próximo: PRD (a análise o alimenta).

### Passo 3 (`--only=prd` ou execução completa): Geração do PRD

Escreve `project-management/prd.md` e `project-management/personas.md`.

**Fase 1 - Descoberta do contexto**: ler `README.md`, varrer `./docs/` em busca de especificações, ler `project-management/personas.md` e `project-management/analysis/` se existirem, analisar o código para identificar a stack técnica, revisar a conversa. Listar as fontes encontradas.

**Fase 2 - Esclarecimento interativo** (perguntar apenas o que falta):

| Tema | Perguntas |
|------|-----------|
| Problema e oportunidade | Qual problema? Quem sofre mais? Custo de não resolver? Oportunidade de negócio? |
| Usuários-alvo | Usuários principais (papel, perfil)? Objetivos? Frustrações com as soluções atuais? Usuários secundários? |
| Objetivos e métricas | Objetivos de negócio? KPIs com valores-alvo e prazos? Como é o sucesso do MVP? |
| Escopo e restrições | Funcionalidades indispensáveis (P0)? O que está explicitamente fora do escopo? Restrições técnicas, de orçamento, prazo, conformidade? |

**Fase 3 - Geração**: carregar o template de PRD (`.claude/templates/project/prd.md` se existir), preencher todas as seções, criar personas detalhadas, organizar os requisitos em P0/P1/P2 com IDs estáveis `FR-001`, `FR-002`... (funcionais) e `NFR-001`... (não funcionais) para que as stories possam ser rastreadas até eles, identificar riscos a partir de restrições e dependências.

**Fase 4 - Revisão e iteração**: mostrar uma checklist de seções (Executive Summary, Problem Statement, Goals & Metrics, Target Users, Functional Requirements, Non-Functional Requirements, Scope & Constraints, Timeline, Risks & Mitigations), sinalizar as incompletas e depois oferecer expandir uma seção, detalhar as personas ou ajustar a priorização.

```
project-management/
├── prd.md                    # PRD gerado (FR-xxx / NFR-xxx)
├── personas.md               # Personas extraídas/criadas
└── analysis/discovery-notes.md
```

### Passo 4 (`--only=backlog` ou execução completa): Geração do backlog

Você atua como um Product Owner e Scrum Master experiente. O backlog deve respeitar os 3 pilares do Scrum (transparência, inspeção, adaptação) e os valores Agile.

**Entradas, por ordem de prioridade**

1. `project-management/prd.md`: fonte principal. Seus IDs `FR-xxx` alimentam o campo `**Implements**` de cada user story.
2. `project-management/tech-spec.md` se existir (ver `/workflow:design`): arquitetura, entidades, endpoints usados nas notas técnicas.
3. Alternativa sem PRD: especificações em `./docs/`.

**Vertical slicing (obrigatório)**: cada user story atravessa todas as camadas da stack do projeto (UI, API, persistência). Nenhuma story «somente backend» ou «somente frontend». Detectar a stack a partir da tech spec ou do código e adaptar a DoD e os critérios técnicos de acordo.

**Estrutura criada**

```
project-management/
├── README.md                 # Visão geral, personas, epics, métricas, roadmap
├── personas.md
├── definition-of-done.md
├── dependencies-matrix.md
├── backlog/
│   ├── epics/EPIC-XXX-name.md
│   └── user-stories/US-XXX-name.md
└── sprints/sprint-{N}-{slug}/   # ex.: sprint-1-walking_skeleton
    ├── sprint-goal.md
    └── sprint-dependencies.md
```

**personas.md**: mínimo de 3 personas (IDs P-001, P-002...; 1 principal, 2+ secundárias). Cada uma: identidade, citação representativa, contexto, 3 objetivos, pelo menos 3 frustrações, motivações, comportamentos, cenários de uso (Contexto, Necessidade, Ação, Resultado), critérios de decisão. Adicionar uma matriz personas/funcionalidades (3 estrelas crítico, 2 importante, 1 útil) e anti-personas.

**definition-of-done.md**: código (revisão aprovada, convenções, SOLID), testes (80 % unitários, integração, E2E, CI verde), critérios por camada (UI, API, paridade entre clientes), documentação, qualidade (análise estática nível máximo, API abaixo de 200 ms), implantação (migrações, staging, validação do PO).

**Epics** (`EPIC-XXX-name.md`): descrição (valor de negócio), tabela de stories associadas (ID, título, pontos, prioridade, depende de), dependências (pré-requisitos e dependentes), Minimum Marketable Feature (MMF) com as stories incluídas, estimativa (tamanho S/M/L/XL, sprints estimados).

**User stories** (`US-XXX-name.md`), a partir de `.claude/templates/project/user-story.md`:

- **INVEST** (obrigatório): Independent, Negotiable, Valuable, Estimable, Sized (máx. 8 pontos), Testable.
- **3 Cs** (obrigatório): Card («Como [P-XXX]... eu quero... para que...»), Conversation (perguntas em aberto), Confirmation (critérios de aceitação).
- **Critérios de aceitação** em Gherkin SMART: 1 cenário nominal, pelo menos 2 alternativos, pelo menos 2 cenários de erro.
- Epic pai, persona associada, critérios por camada, notas técnicas, estimativa (pontos Fibonacci, MoSCoW), dependências (bloqueantes e bloqueadas), sprint atribuído.
- **Rastreabilidade**: preencher a seção `## Traceability` com `**Implements**: {FR-001, FR-003}` (IDs dos requisitos do PRD entregues pela story). Uma story sem `FR-xxx` é sinalizada.

**dependencies-matrix.md**: grafo Mermaid entre epics, tabela de dependências, caminho crítico, dependências entre stories.

**Sprints** (`sprint-{N}-{slug}/`): `sprint-goal.md` (objetivo em uma frase, cerimônias, stories selecionadas e total de pontos, ordem de execução, grafo de dependências Mermaid, incremento entregável, diretriz de retrospectiva e formato Starfish) e `sprint-dependencies.md`.

**Registro em `.bmad/sprint-status.yaml`**: para cada story, adicionar uma entrada com `status: backlog` (esquema: `Project/templates/sprint-status.yaml.template`): `title`, `story_points`, `epic_id`, `tasks` (total 0), `acceptance_criteria.total` e uma entrada `history` «Story created». `.bmad/sprint-status.yaml` é a fonte única de verdade para o status; os arquivos markdown contêm apenas conteúdo, nunca um status. Criar o arquivo a partir do template se faltar, nunca sobrescrever entradas existentes.

**Regras Scrum**: sprints de 2 semanas, velocidade 20-40 pontos, máx. 8 pontos por story (senão dividir), escala de Fibonacci (1, 2, 3, 5, 8, 13, 21), Sprint 1 = Walking Skeleton (infraestrutura + um fluxo completo).

### Passo 5: Validação

Executar `/gate:check backlog` (ou verificar em linha):

| Verificação | Critérios |
|-------------|-----------|
| INVEST | Os 6 critérios por story; máx. 8 pontos (13+ deve ser dividida) |
| 3 Cs | Card, Conversation, Confirmation presentes |
| Gherkin | Formato válido; 1 nominal + 2 alternativos + 2 erros |
| Personas | Pelo menos 3, matriz presente |
| Epics | MMF identificado, dependências Mermaid |
| Sprints | Sprint 1 = Walking Skeleton, objetivo em uma frase, grafo de dependências |
| Rastreabilidade | Cada story tem `**Implements**`; cada `FR-xxx` P0 é coberto por pelo menos uma story |
| Status | Cada story está registrada em `.bmad/sprint-status.yaml` como `backlog` |

Reportar os avisos (por exemplo «US-012: 21 pontos - deve ser dividida») e corrigi-los antes de concluir.

### Passo 6: Fim da fase

Resumir os artefatos (PRD, personas, epics, número de stories, total de pontos, escopo do Sprint 1, sprints estimados) e recomendar o próximo passo: após `--only=prd`, `/workflow:design` e depois `/workflow:plan --only=backlog`; após o backlog, `/workflow:design` (se ainda não houver tech spec) ou `/workflow:start 1`.

## Agentes envolvidos

- **product-owner**: criação do PRD, personas, priorização, backlog
- **tech-lead**: revisão de viabilidade técnica, apoio à estimativa
- **research-assistant**: pesquisa (`--research`)

## Arquivos gerados

| Arquivo | Finalidade | Modo |
|---------|------------|------|
| `analysis/*.md` | Pesquisa, restrições, riscos | `--research` |
| `prd.md`, `personas.md` | PRD com `FR-xxx` / `NFR-xxx`, personas | `--only=prd` |
| `definition-of-done.md`, `dependencies-matrix.md`, `README.md` | Estrutura do backlog | `--only=backlog` |
| `backlog/epics/`, `backlog/user-stories/` | Epics e stories (`**Implements**`) | `--only=backlog` |
| `sprints/sprint-{N}-{slug}/` | Pastas de sprint | `--only=backlog` |
| `.bmad/sprint-status.yaml` | Stories registradas como `backlog` | `--only=backlog` |

## Opção de retomada

Em caso de interrupção, `/workflow:plan --continue` detecta o que existe (PRD concluído, backlog em 12/18 stories) e retoma no próximo item que falta.

## Comandos relacionados

- `/workflow:init` - Inicializar o workflow
- `/workflow:design` - Tech spec (entre o PRD e o backlog)
- `/workflow:start` - Iniciar um sprint a partir do backlog
- `/workflow:status` - Verificar o progresso
- `/project:backlog` - Adicionar, listar, editar e mover stories depois
- `/gate:check` - Validar o backlog
