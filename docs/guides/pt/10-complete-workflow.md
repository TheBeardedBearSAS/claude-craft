# Tutorial de Fluxo Completo: Da Ideia à Produção

> **Para quem é este tutorial?** Para quem **nunca** usou o Claude Code ou o Claude Craft. Começamos do zero, construímos uma funcionalidade real do início ao fim e explicamos cada termo na primeira vez que aparece.
>
> **O que vamos construir:** *TaskFlow* — um pequeno SaaS de acompanhamento de tarefas para equipes, com uma API REST (Python / FastAPI) e um cliente web em React. É simples o suficiente para seguir em uma única sessão e real o suficiente para exercitar todo o fluxo de trabalho.
>
> **Claude Craft v8.18.0** · Tempo estimado de leitura + execução: 60–90 minutos.

---

## 0. Antes de começar

### O que você vai fazer

Você vai levar o TaskFlow de uma ideia em uma frase até um primeiro sprint revisado e testado — usando o fluxo BMAD do Claude Craft. O caminho sempre segue uma única direção, e **cada seta é protegida por um gate de qualidade** (uma verificação bloqueante):

```
 IDEIA
   │  /workflow:init        ← escolher o fluxo
   ▼
 BACKLOG ──/gate:validate-backlog──┐  (PRD ≥ 80%, INVEST 6/6)
   │  /workflow:plan                │
   ▼                                │
 DESIGN TÉCNICO ──/gate:validate-techspec──┐  (Tech Spec ≥ 90%)
   │  /workflow:design                   │
   ▼                                      │
 PLANO DE SPRINT ──/gate:validate-sprint──┐  (Sprint Ready 100%)
   │  /workflow:start                  │
   │  /project:decompose-tasks         │
   ▼                                    │
 IMPLEMENTAÇÃO (TDD) ──/gate:validate-story──┐  (Story DoD 100%)
   │  /sprint:dev                              │
   ▼                                            │
 REVISÃO + RETRO ──/workflow:review, /workflow:retro
   │
   ▼
 PRÓXIMO SPRINT ↺
```

> **Regra de ouro do método:** você não avança para o próximo passo enquanto o gate não estiver verde. É isso que impede você de construir sobre bases instáveis.

---

## 1. O básico em 5 minutos

Leia uma vez. Você voltará aqui.

- **Claude Code** — a CLI onde você conversa com o Claude no terminal (ou na IDE). Você digita mensagens e *slash-commands*; o Claude lê/escreve arquivos, executa comandos e responde.
- **Slash-command** — uma instrução empacotada que começa com `/`. Exemplo: `/workflow:init`. O Claude Craft vem com 125 deles distribuídos em 15 namespaces.
- **Agente** — uma persona especializada do Claude que você invoca com `@`. Exemplo: `@tdd-coach`, `@symfony-reviewer`. Cada um tem expertise focada.
- **Claude Craft** — o framework que você instalou: regras, comandos, agentes, skills e a camada de gerenciamento de projetos **BMAD**.
- **BMAD** — o método estilo SCRUM leve do Claude Craft (Backlog → sprint → revisão). Ele grava seu estado em **arquivos**, não na conversa — é por isso que limpar o chat mais tarde é seguro.

### Mini-glossário

| Termo | Significado simples |
|-------|---------------------|
| **Épico** | Um grande bloco de valor, dividido em histórias. |
| **História de Usuário (US)** | Um incremento pequeno e visível para o usuário ("Como usuário, posso…"). |
| **Backlog** | A lista ordenada de épicos e histórias. |
| **Sprint** | Um lote curto de histórias que você se compromete a finalizar. |
| **Tarefa** | Uma história dividida em etapas de ≤ 30 min que um dev (ou agente) executa. |
| **Gate** | Uma verificação de qualidade bloqueante entre as fases. |
| **DoD** | Definição de Pronto — o checklist que uma história deve passar. |
| **INVEST** | As 6 qualidades de uma boa história (Independent, Negotiable, Valuable, Estimable, Small, Testable). |
| **TDD** | Desenvolvimento Orientado por Testes: escrever um teste que falha → fazê-lo passar → refatorar. |

---

## 1.5 Entendendo os modos de execução (leia isto — todo mundo se confunde aqui)

Existem **duas coisas diferentes chamadas "modo"**. Não as confunda.

**(a) Os três modos de interação** (alternar com `Shift+Tab` no Claude Code):

| Modo | Indicador | O que faz |
|------|-----------|-----------|
| **Plano necessário** | 📋 | O Claude propõe um plano e **não edita nada** até você aprovar. |
| **Normal** | ⚡ | O Claude age, mas pede permissão antes de ações arriscadas. **Padrão para este tutorial.** |
| **Auto-aceitar** | 🤖 | O Claude executa sem perguntar. Poderoso, mas apenas quando você confiar no fluxo. |

**(b) O "modo plano" que alguns comandos ativam sozinhos.** Vários comandos do Claude Craft (`/workflow:design`, `/workflow:plan`…) entram deliberadamente em uma etapa de planejamento e aguardam seu "go" antes de escrever arquivos — independentemente do modo Shift-Tab que você estiver usando.

> **Regra simples para iniciantes:** fique no modo **Normal (⚡)**, deixe os comandos acionar sua própria etapa de planejamento e aprove os planos. Use o modo auto-aceitar e as flags `--auto` apenas quando o fluxo parecer familiar.

Ao longo deste tutorial, cada comando mostra o modo que espera:
- **Modo: Normal (⚡)** — interativo
- **Modo: Plano necessário** — o Claude planejará primeiro
- **Modo: Somente leitura** — seguro em qualquer modo

---

## 2. Verifique a instalação

**Modo: Somente leitura.** Abra o Claude Code na pasta do seu projeto e confirme que o Claude Craft está presente.

```bash
# No terminal, dentro do projeto
claude
```

Em seguida, dentro do Claude Code:

```
/workflow:status
```

Se você vir um relatório de status do fluxo (mesmo que diga "nenhum fluxo ainda"), o Claude Craft está instalado. Se o comando for desconhecido, (re)instale:

```bash
npx @the-bearded-bear/claude-craft install . --tech=python --lang=en
```

> **Sobre a camada de Gerenciamento de Projetos.** Os comandos `/gate:*`, `/sprint:*` e `/project:*` usados abaixo vêm da opção **Project Management commands**, incluída por padrão durante a instalação (o instalador pergunta *"Include Project Management commands? (Y/n)"* → Yes). Se esses comandos estiverem ausentes, execute o instalador novamente e aceite essa opção.

### 2.x Economizando tokens: contexto e `/clear`

A **janela de contexto** é a memória de trabalho do Claude — e seu recurso mais precioso. Dois hábitos a mantêm saudável:

- **`/clear`** entre etapas não relacionadas. Como o BMAD grava seu estado em arquivos, **nada se perde**: após `/clear`, execute `/workflow:status` e o Claude relê onde você estava.
- **RTK + hooks** para otimização de tokens. Execute `/common:setup-rtk` uma vez para configurar o proxy Rust Token Killer e os hooks de otimização (economia de 60–90% na saída de comandos dev).

Você verá marcadores **"Bom momento para `/clear`"** entre as etapas com letras abaixo.

---

## Etapa A — Construir o backlog

### A.1 Inicializar o fluxo de trabalho

**Modo: Plano necessário.**

```
/workflow:init
```

O Claude analisa seu projeto e recomenda um **fluxo**:

| Fluxo | Configuração | Fases | Ideal para |
|-------|--------------|-------|------------|
| **Quick Flow** | < 5 min | Apenas implementar | Correções de bugs, hotfixes |
| **Standard** | < 15 min | Planejar → Projetar → Implementar | Novas funcionalidades (← TaskFlow usa este) |
| **Enterprise** | < 30 min | Analisar → Planejar → Projetar → Implementar | Plataformas |

Escolha **Standard** para o TaskFlow.

### A.2 Gerar o PRD e o backlog

**Modo: Plano necessário.**

```
/workflow:plan
```

O Claude entrevista você sobre o TaskFlow, depois elabora um **PRD** (Documento de Requisitos do Produto), personas e um **backlog** inicial de épicos e histórias em `project-management/`. Responda concretamente, por exemplo:

> *"O TaskFlow permite que uma pequena equipe crie projetos, adicione tarefas, as atribua e as marque como concluídas. MVP = API REST + visão de lista/board web. Sem mobile por enquanto."*

> **O que esperar:** arquivos como `project-management/prd.md` e `project-management/backlog/` com épicos como `EPIC-001 Projects`, `EPIC-002 Tasks` e histórias como `US-001 Create a project`.

### A.3 Validar o backlog

**Modo: Somente leitura.**

```
/gate:validate-backlog
```

Este gate verifica o backlog contra **INVEST (6/6)** e a cobertura do PRD (**≥ 80%**). Se falhar, indica exatamente quais histórias são grandes demais, não testáveis ou não estimáveis. Corrija-as (execute novamente `/workflow:plan` ou edite as histórias) até o gate ficar verde.

> **Bom momento para `/clear`.** Depois execute `/workflow:status` para retomar.

---

## Etapa B — Projetar e criar o sprint

### B.1 Projetar a solução técnica

**Modo: Plano necessário.**

```
/workflow:design
```

O Claude (atuando como arquiteto) produz um **Tech Spec**: escolhas de arquitetura, modelo de dados, contrato de API e as bibliotecas a usar — fundamentado nas referências do Claude Craft para o seu stack (Clean Architecture, padrões FastAPI, etc.).

### B.2 Validar o tech spec

**Modo: Somente leitura.**

```
/gate:validate-techspec
```

Limite do gate: **Tech Spec ≥ 90%**. Ele sinaliza tratamento de erros ausente, contratos indefinidos ou designs não testáveis.

### B.3 Planejar o primeiro sprint

**Modo: Plano necessário.**

```
/workflow:start
```

O Claude propõe um **objetivo de sprint** e seleciona as principais histórias do backlog que cabem. Para o TaskFlow, um primeiro sprint sensato é um **walking skeleton**: criação de projeto + tarefa via API, exibida na lista web.

### B.4 Decompor histórias em tarefas

**Modo: Plano necessário.**

```
/project:decompose-tasks
```

Cada história é dividida em **tarefas** de ≤ 30 minutos, testáveis de forma independente (escrever o modelo, escrever o endpoint, escrever o teste, conectar a UI…). Isso é o que faz o TDD e o `/sprint:dev` fluírem sem problemas.

### B.5 Validar o sprint

**Modo: Somente leitura.**

```
/gate:validate-sprint
```

Limite do gate: **Sprint Ready 100%** — cada história estimada, cada tarefa definida, dependências ordenadas. Verde significa que você pode começar a codificar.

> **Bom momento para `/clear`.**

---

## Etapa C — Implementar o sprint com TDD

### C.1 O caminho recomendado para iniciantes

**Modo: Normal (⚡).**

```
/sprint:dev
```

`/sprint:dev` percorre o sprint **tarefa por tarefa**, guiando você pelo ciclo TDD **Red → Green → Refactor**:

1. **Red** — escrever um teste que falha e que define o comportamento esperado.
2. **Green** — escrever o código mínimo para fazê-lo passar.
3. **Refactor** — limpar o código; os testes continuam verdes.

Para cada história, ele também executa uma revisão de código e verifica o **Story DoD (100%)** antes de avançar.

> **TDD não é negociável.** Um teste escrito *antes* do código é o que permite ao agente escrever código em que você pode confiar. Correções de bugs recebem primeiro um teste de regressão (ele deve falhar antes da correção e passar depois).

### C.2 Alternativas (opcional)

- `/project:run-sprint` — executa o sprint inteiro de forma mais autônoma.
- `/team:sprint` — implementa múltiplas histórias **em paralelo** usando Agent Teams (avançado).
- `@tdd-coach` — invoque o coach no meio de uma tarefa para orientação.

Fique com `/sprint:dev` na sua primeira execução.

### C.3 Conduzir dia a dia

- `/sprint:next-story --claim` — pegar a próxima história.
- `/sprint:transition US-001 in-progress` — mover uma história pelo board.
- `/qa:tdd` — corrigir um bug no modo TDD/BDD estrito.

> **Lembrete sobre Docker.** Execute testes e comandos via Docker para que os resultados não dependam da sua máquina local, por exemplo: `docker compose exec app pytest`.

---

## Etapa D — Acompanhar o progresso com o board Kanban

### D.1 Abrir o board

**Modo: Somente leitura.**

```
/project:board
```

Isso abre um **board Kanban** local (sem SaaS, sem lock-in) que lê os arquivos de estado do BMAD. As colunas seguem o roteamento de status:

```
backlog → ready-for-dev → in-progress → review → done   (any → blocked)
```

Visões complementares: `/project:burndown` (burndown do sprint), `/project:dependencies`, `/project:critical-path`, `/project:metrics`.

### D.2 Por que um cartão pode se recusar a avançar

O board aplica os mesmos gates. Uma história não entrará em **done** enquanto o DoD não passar — isso é o método te protegendo, não um bug.

> **Bom momento para `/clear`.**

---

## Etapa E — Fechar o sprint e repetir o ciclo

### E.1 Revisão do sprint

**Modo: Normal (⚡).**

```
/workflow:review
```

Resume o que foi entregue em relação ao objetivo do sprint, com um checklist de demonstração.

### E.2 Retrospectiva

```
/workflow:retro
```

Registra o que foi bem / o que melhorar. Persista aprendizados duráveis com `/memory` para que sobrevivam a futuros `/clear`s.

### E.3 Repetir o ciclo

Execute `/workflow:start` novamente para planejar o sprint 2 a partir do backlog restante. O ciclo se repete: planejar → projetar → implementar → revisar.

---

## Folha de consulta

### Comandos, em ordem

```bash
# Etapa A — Backlog
/workflow:init                 # escolher o fluxo
/workflow:plan                 # PRD + backlog
/gate:validate-backlog         # INVEST 6/6, PRD ≥ 80%

# Etapa B — Design + sprint
/workflow:design               # tech spec
/gate:validate-techspec        # Tech Spec ≥ 90%
/workflow:start                # planejar o sprint
/project:decompose-tasks       # histórias → tarefas
/gate:validate-sprint          # Sprint Ready 100%

# Etapa C — Implementar (TDD)
/sprint:dev                    # tarefa a tarefa Red/Green/Refactor
/gate:validate-story US-001    # Story DoD 100%

# Etapa D — Acompanhar
/project:board                 # Kanban
/project:burndown              # burndown

# Etapa E — Fechar + repetir
/workflow:review
/workflow:retro
```

### Quando usar `/clear`

Após cada etapa com letra (A→B→C→D→E). O estado vive em arquivos; `/workflow:status` o relê.

### Onde os arquivos ficam

| O quê | Onde |
|-------|------|
| PRD, personas | `project-management/prd.md` |
| Backlog (épicos/histórias) | `project-management/backlog/` |
| Sprints, tarefas | `project-management/sprints/` |
| Status BMAD | `project-management/.bmad/` / `sprint-status.yaml` |

### Limites dos gates

| Gate | Limite |
|------|--------|
| PRD | ≥ 80% |
| Tech Spec | ≥ 90% |
| INVEST | 6/6 |
| Sprint Ready | 100% |
| Story DoD | 100% |
| Spec Alignment | ≥ 85% |

### Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `/gate:*` / `/sprint:*` desconhecidos | Reinstale e aceite *Project Management commands*. |
| `/bmad:init` não encontrado | Não existe — use `/workflow:init`. |
| Gate continua falhando | Leia o relatório; ele nomeia exatamente o item que falhou. |
| Cartão não chega em **done** | O DoD ainda não foi cumprido — é intencional. |
| Perdido após `/clear` | Execute `/workflow:status`. |
| Contexto > 60% | `/clear`, depois `/workflow:status`. |

---

## Automatizando com o Ralph (opcional)

Quando estiver confortável, automatize uma história de ponta a ponta com o loop contínuo:

```
/common:ralph-run "Implement US-001 with full DoD validation"
```

O Ralph mantém o Claude trabalhando até os validadores da Definição de Pronto passarem. Veja [RALPH-GUIDE.md](../../RALPH-GUIDE.md).

---

## Apêndice — Um cenário real com múltiplos stacks

O TaskFlow é de stack único de propósito. Produtos reais são mais complexos — e o **mesmo** fluxo de trabalho escala para eles. Como exemplo mais rico, considere um app no estilo Wrandly (versão anonimizada fornecida como fixture de teste em `tests/fixtures/wrandly-anon/`):

- **Dois clientes:** um PWA web (Symfony + React) **e** um app mobile Flutter, além de uma API REST personalizada.
- **Um handoff de design já existe** antes do início do desenvolvimento (um pacote "Claude Design"): documentos-fonte, 5 decisões de arquitetura bloqueadas e um plano em fases (Épicos 0 → 7).

Como se mapeia a este tutorial:

| Artefato de design | Alimenta |
|--------------------|----------|
| Documentos-fonte | `/workflow:plan` (entrada para o PRD + backlog) |
| Decisões de arquitetura bloqueadas | `/workflow:design` (formalizadas no Tech Spec) |
| Fases 0 → 7 | A divisão de épicos → sprints |

Dois ajustes para múltiplos stacks:

1. **Comece com o épico de fundação** (Épico 0): monorepo, design tokens compartilhados, o contrato OpenAPI e um estilo de mapa **antes** de qualquer componente de UI — um verdadeiro *walking skeleton*.
2. **Execute os sprints web e mobile em paralelo** com `/team:sprint` (Agent Teams), cada um respeitando os gates do seu próprio stack.

Todo o resto — gates, TDD, o board Kanban, a disciplina do `/clear` — é idêntico. O método não muda com a escala; apenas o número de trilhas paralelas muda.

---

## Próximos passos

- [Desenvolvimento de Funcionalidades](03-feature-development.md) — aprofunde-se no ciclo TDD e nos agentes.
- [Gerenciamento de Backlog](07-backlog-management.md) — domine épicos, histórias e os 15+ comandos de projeto.
- [Guia Prático do BMAD](../../BMAD-PRACTICAL-GUIDE.md) — a referência completa de comandos do método.
- [Sprint Autônomo](../AUTONOMOUS-SPRINT.md) — deixe um pipeline de agentes executar o sprint inteiro.
- [Trilhas de Aprendizado](../../LEARNING-PATHS.md) — progressão de Iniciante → Intermediário → Avançado.
