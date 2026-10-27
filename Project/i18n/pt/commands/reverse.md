---
description: "Pipeline de engenharia reversa brownfield: escanear o código e derivar um PRD rascunho, user stories e uma análise de lacunas spec vs código"
argument-hint: "[scan|prd|stories|gaps|all] [--scope=<scope>] [--module=<name>] [--output=<path>]"
---

# /project:reverse

## Missão

Reconstruir especificações a partir de um código existente (projetos brownfield). Um único comando cobre todo o pipeline: inventariar o código (`scan`), inferir um PRD rascunho (`prd`), inferir user stories (`stories`) e comparar as especificações com o código (`gaps`). `all` executa os quatro em ordem.

## Uso

| Comando | O que faz | Substitui |
|---------|-----------|-----------|
| `/project:reverse scan` | Inventário de módulos, endpoints, modelos, serviços, testes, infraestrutura | `/project:reverse scan` |
| `/project:reverse prd` | PRD RASCUNHO inferido do código | `/project:reverse prd` |
| `/project:reverse stories` | User stories RASCUNHO inferidas do código e dos testes | `/project:reverse stories` |
| `/project:reverse gaps` | Análise de lacunas spec vs código, classificada por severidade | `/project:reverse gaps` |
| `/project:reverse all` | `scan` -> `prd` -> `stories` -> `gaps`, nesta ordem | os quatro |

## Argumentos

Analisar `$ARGUMENTS`: primeiro token = subcomando (`scan`, `prd`, `stories`, `gaps`, `all`). Sem subcomando, perguntar qual (recomendar `all` na primeira execução). Flags:

| Flag | Aplica-se a | Descrição |
|------|------------|-----------|
| `--scope=<scope>` | `scan`: all, backend, frontend, api, tests / `stories`: all, module, endpoint / `gaps`: full, requirements, stories, code | Limita a análise |
| `--module=<name>` | `stories` | Gera as stories de um único módulo |
| `--output=<path>` | `scan`, `prd` | Caminho de saída (valores padrão abaixo) |

## Regras comuns

**O modo plano é obrigatório.** Antes de executar, ativar o modo plano, propor o plano e aguardar a validação antes de modificar qualquer arquivo. Com `all`, um único plano cobre as quatro etapas.

**Regras de inferência de personas (usadas por `prd` e `stories`):**

| Padrão de autenticação | Persona inferida |
|------------------------|------------------|
| `ROLE_ADMIN` + rotas de administração | Administrador |
| `ROLE_USER` + rotas autenticadas | Usuário registrado |
| `ROLE_MANAGER` + rotas de gestão | Gerente / supervisor |
| Endpoints públicos (sem auth) | Visitante / anônimo |
| Autenticação por chave de API | Sistema externo |

**Tudo o que é inferido é um RASCUNHO.** O código mostra o que o sistema faz, não o que ele deveria fazer. Marcar cada artefato inferido como `INFERRED` e exigir validação humana antes de tratá-lo como autoritativo. Marcador a inserir em cada seção ou story inferida:

```
> INFERRED -- Gerado analisando o código existente.
> É necessária validação humana antes de tratá-lo como autoritativo.
```

**Regra de status:** `.bmad/sprint-status.yaml` é a única fonte de verdade do STATUS de stories/tarefas. As stories geradas contêm apenas conteúdo (sem campo de status); registrá-las em `.bmad/sprint-status.yaml` (esquema: `.claude/templates/project/sprint-status.md`) depois de validadas.

**Caminhos padrão:**

```
project-management/
+-- scan-report.md                  # scan
+-- prd.md                          # prd (RASCUNHO)
+-- backlog/user-stories/US-*.md    # stories
+-- analysis/
    +-- reverse-engineering.md      # prd: notas de análise e níveis de confiança
    +-- gap-analysis.md             # gaps
```

**Pré-requisitos:** código-fonte acessível; `README.md`, `docker-compose.yml`, `./docs/` opcionais. `prd`, `stories` e `gaps` precisam de `project-management/scan-report.md` -- se estiver ausente, executar `scan` primeiro (automático com `all`). `gaps` também precisa de um PRD (`project-management/prd.md`, vindo de `/workflow:plan --only=prd` ou de `prd`); `stories` e `gaps` o usam para a rastreabilidade FR-xxx quando existe.

**Convenção de saída:** cada etapa exibe um banner de progresso emoldurado, termina com um breve resumo e sugere os próximos passos (validar de forma interativa, executar o próximo subcomando). Com `all`, fazer uma pausa de validação humana após `prd` e `stories` antes de seguir para `gaps`.

## scan

Ponto de entrada do pipeline: um inventário estruturado do código.

**1. Detecção da stack.** Examinar a raiz em busca de marcadores de framework, ler o manifesto (`composer.json`, `package.json`, `pubspec.yaml`, `*.csproj`, `pyproject.toml`), identificar a versão do framework e as dependências principais, detectar a infraestrutura (Docker, CI/CD, Redis, filas) e escolher o agente reviewer adequado (`@symfony-reviewer`, `@react-reviewer`...).

| Padrão de arquivo | Stack |
|-------------------|-------|
| `*.php` + `symfony.lock` | Symfony |
| `*.php` + `artisan` | Laravel |
| `*.php` + `composer.json` | PHP (genérico) |
| `*.dart` + `pubspec.yaml` | Flutter |
| `*.tsx` / `*.jsx` + `next.config.*` | React (Next.js) |
| `*.tsx` / `*.jsx` + `package.json` | React |
| `*.vue` + `package.json` | Vue.js |
| `angular.json` | Angular |
| `*.cs` + `*.csproj` | .NET / C# |
| `*.py` + `pyproject.toml` | Python |
| `Dockerfile` / `docker-compose.yml` | Docker (infra) |

**2. Varredura da estrutura.** Classificar os arquivos em:
1. Módulos / domínios (bounded contexts, módulos compartilhados, namespaces)
2. Endpoints (rotas, controllers, métodos HTTP, caminhos, middlewares/guards)
3. Modelos / entidades (campos, tipos, relações, migrações)
4. Serviços (serviços, casos de uso, handlers de comandos/consultas, listeners, subscribers)
5. Testes (unitários / integração / E2E, correspondência teste-fonte, frameworks)
6. Infraestrutura (Docker, CI/CD, configuração de ambiente, integrações de terceiros)

**3. Análise do código.** Estimar as LOC por módulo; identificar o padrão de arquitetura (MVC, Clean Architecture, DDD...); detectar as ferramentas de qualidade (linting, análise estática); mapear o grafo de dependências entre módulos; sinalizar marcadores de dívida técnica; usar o reviewer específico da stack para obter insights especializados.

**4. Relatório** em `project-management/scan-report.md`, com as seções: cabeçalho (projeto, stack, tamanho, módulos), Technology Stack, Modules / Bounded Contexts (arquivos, LOC, testes, cobertura), Endpoints (método, caminho, controller, auth), Models / Entities (campos, relações, migrações), Services (dependências, tipo), Tests (tipo, quantidade, framework), Infrastructure (componente, arquivo de config, notas) e um Complexity Summary.

```
| Module   | Files | LOC   | Tests | Coverage |
| User     | 24    | 1,800 | 12    | ~65%     |
| Method | Path        | Controller     | Auth |
| GET    | /api/users  | UserController | JWT  |
```

Métricas do Complexity Summary: LOC total, total de arquivos, bounded contexts, endpoints de API, entidades de banco de dados, arquivos de teste, cobertura de testes estimada, padrão de arquitetura.

## prd

Contrapartida brownfield de `/workflow:plan --only=prd`: um PRD RASCUNHO inferido do código.

**1. Carregar** o relatório de scan (e `./docs/`, `README.md`); analisar stack, módulos, endpoints, entidades, serviços.

**2. Análise da lógica de negócio**, para cada módulo: eventos de domínio (payloads, listeners, workflows), casos de uso / comandos / consultas, regras de validação (entidade, requisição, asserções de negócio), máquinas de estados (enums de status, configuração de workflow, guards), integrações externas (pagamento, e-mail, armazenamento, APIs de terceiros).

**3. Inferência de requisitos.**

| Padrão de código | Requisito inferido |
|------------------|--------------------|
| Middleware de auth / JWT | Autenticação de usuário necessária |
| Guards por papel | Autorização com papéis |
| Controllers CRUD | Funcionalidades de gestão de dados |
| Handlers de upload de arquivos | Gestão de documentos/mídia |
| Serviços de e-mail | Sistema de notificações |
| Gateway de pagamento | Processamento de pagamentos |
| Endpoints de exportação | Funcionalidades de relatório/exportação |
| Lógica de busca/filtro | Busca e filtragem |
| Paginação | Tratamento de grandes volumes de dados |
| Camadas de cache | Requisitos de desempenho |
| Workers de filas | Requisitos de processamento assíncrono |
| Rate limiting | Requisitos de proteção da API |

| Infraestrutura | NFR inferido |
|----------------|--------------|
| Docker / Kubernetes | Escalabilidade, conteinerização |
| Redis / Memcached | Cache de desempenho |
| Sistema de filas (RabbitMQ...) | Processamento assíncrono, confiabilidade |
| Pipelines CI/CD | Automação de deploy |
| Config de load balancer | Alta disponibilidade |
| Configuração SSL/TLS | Segurança |
| Stack de logs (ELK...) | Monitoramento |

As personas vêm da tabela comum acima.

**4. Gerar** `project-management/prd.md` com oito seções: Executive Summary (INFERRED), Problem Statement (INFERRED), Goals & Metrics (**PLACEHOLDER** -- não é possível inferir, requer contribuição humana), Target Users / Personas (INFERRED, cada uma em rascunho), Functional Requirements (INFERRED, um por grupo de funcionalidades/endpoints, priorizado por complexidade e uso, etiquetado com o módulo de origem), Non-Functional Requirements (INFERRED), Scope & Constraints (INFERRED), Risks & Mitigations (INFERRED: dívida, áreas sem testes, riscos de dependências). Escrever as notas de análise e a confiança por seção (HIGH / MEDIUM / LOW) em `project-management/analysis/reverse-engineering.md`; o cabeçalho do PRD exibe `Status: DRAFT - Requires human validation` e a tabela de confiança.

**5. Validação humana.** Apresentar um resumo das seções inferidas, destacar as de baixa confiança e as que não puderam ser inferidas (Goals, Metrics), pedir ao usuário que valide / corrija / complete cada uma e iterar até ficar satisfeito.

## stories

User stories RASCUNHO inferidas de endpoints, serviços, entidades e testes.

**1. Carregar** o relatório de scan e o PRD, se existir (para a rastreabilidade FR-xxx); determinar o escopo (all, um `--module`, um endpoint).

**2. Extração de funcionalidades**, por endpoint/funcionalidade: controller/handler (método, rota, validação da requisição, resposta e códigos de status, autorização), serviço/caso de uso (fluxo de negócio, efeitos colaterais, chamadas externas, caminhos de erro), entidade/modelo (campos e restrições, relações, transições de estado, soft delete/timestamps), testes (nomes de métodos, asserções, fixtures, casos de borda).

**3. Geração das stories.**

| Rota | Ação inferida |
|------|---------------|
| `POST /api/resources` | criar um recurso |
| `GET /api/resources` | listar recursos |
| `GET /api/resources/{id}` | consultar um recurso |
| `PUT /api/resources/{id}` | atualizar um recurso |
| `DELETE /api/resources/{id}` | excluir um recurso |
| ação personalizada | a partir do nome do método e da lógica de negócio |

Inferência do benefício: CRUD -> «para poder gerenciar os dados de {resource}»; busca/filtro -> «encontrar rapidamente os {resources} relevantes»; exportação -> «usar os dados de {resource} externamente»; notificações -> «ser informado sobre {event}»; auth -> «que meus dados estejam seguros e acessíveis somente a mim». Os critérios de aceitação vêm dos testes: fixtures -> Given, ações -> When, resultados esperados -> Then.

```markdown
# US-XXX: [Título inferido]

> INFERRED -- gerada analisando o código. É necessária validação humana.

## Source
- Módulo / Endpoint ({method} {path}) / Controller / Implements: FR-XXX (se houver PRD)

## User Story
As [persona inferida] I want [ação inferida] So that [benefício inferido]
Conversation: [ ] persona  [ ] a ação corresponde à intenção  [ ] o benefício corresponde aos objetivos de negócio
INVEST: [ ] Independent / Negotiable / Valuable / Estimable / Sized / Testable

## Acceptance Criteria (Gherkin)
Scenario: nominal (do caminho feliz)   Given / When / Then
Scenario: erro (da validação)          Given / When / Then

## Technical Notes
Entidade, regras de validação, requisitos de auth, eventos disparados

## Estimation
Story Points (conforme a complexidade), MoSCoW (conforme os padrões de uso)
```

**4. Rastreabilidade** (se `project-management/prd.md` existir): associar cada story a uma FR-xxx (adicionar `implements: FR-xxx`), listar as stories sem requisito (código sem spec) e os requisitos sem story (spec sem código).

**5. Saída e validação.** Salvar em `project-management/backlog/user-stories/US-001-create-user.md`, `US-002-...`, gerar um índice resumo agrupado por módulo (título, pontos, MoSCoW, número de stories ligadas ao PRD, número de não ligadas), e pedir ao usuário que valide, corrija ou rejeite cada story.

## gaps

Comparar as especificações (PRD, stories, spec técnica) com o código real.

**1. Carregar as specs:** `project-management/prd.md`, `project-management/backlog/user-stories/`, `project-management/tech-spec.md` (se existir), o relatório de scan (atualizá-lo executando `scan` se estiver ausente ou desatualizado). Analisar FR-xxx, NFR-xxx e US-xxx.

**2. Escanear o código:** catalogar endpoints, lógica de negócio, modelos de dados, testes e infraestrutura em um inventário de funcionalidades indexado por módulo.

**3. Comparação em quatro vias:**

| Categoria | Verificações |
|-----------|--------------|
| **Spec sem código** (não implementado) | FR-xxx sem endpoint correspondente; US-xxx sem funcionalidade correspondente; NFR-xxx sem configuração correspondente |
| **Código sem spec** (não documentado) | Endpoints sem referência FR; serviços sem referência US; entidades não cobertas pelas specs |
| **Divergência spec-código** (inconsistente) | Diferenças de campos, fluxo de status, auth, validação e formato de resposta |
| **Lacunas de testes** (não testado) | Funcionalidades sem testes unitários / de integração; critérios de aceitação sem testes E2E; caminhos de erro sem testes |

**4. Classificar por severidade:**

| Severidade | Critérios | Ação |
|------------|-----------|------|
| **Critical** | Funcionalidade central ausente ou quebrada; vulnerabilidade de segurança; risco de integridade de dados | Correção imediata |
| **Major** | Lacuna de funcionalidade importante; divergência significativa; faltam testes críticos | Sprint atual |
| **Minor** | Lacuna de documentação; divergência não crítica; faltam testes de casos de borda | Próximo sprint |
| **Info** | Inconsistência de estilo; funcionalidade opcional; melhoria | Backlog |

Regras: spec sem código + P0 = Critical, + P1 = Major, + P2 = Minor; código sem spec + auth = Major, + CRUD = Minor; divergência + integridade de dados = Critical, + UI/UX = Minor; lacuna de testes + lógica de negócio = Major, + caso de borda = Minor.

**5. Relatório** em `project-management/analysis/gap-analysis.md`: cabeçalho (projeto, data, escopo), percentuais de cobertura de spec / código / testes, número de lacunas por severidade, as quatro tabelas por categoria com evidências (caminhos de arquivos, referências de linha) e uma lista de remediação ordenada por prioridade com esforço (S < 2h, M 2-8h, L > 8h).

```
| # | Action                              | Severity | Effort |
| 1 | Implement FR-005 (password reset)   | Critical | M      |
| 2 | Add integration tests for payment   | Critical | S      |
```

Em seguida, oferecer: criar stories para as funcionalidades ausentes, gerar tarefas para os itens de remediação, ou focar em uma categoria de lacunas.

## all

Executar `scan` -> `prd` -> `stories` -> `gaps` em ordem, reutilizando cada saída como entrada da etapa seguinte (sem novo scan). Fazer uma pausa de validação humana após `prd` e `stories`. Terminar com um resumo: arquivos escritos, número de personas / requisitos / stories inferidos, número de lacunas por severidade e as 3 principais ações.

## Comandos relacionados

- `/workflow:plan --only=prd` - Gerar um PRD de forma interativa (greenfield)
- `/workflow:plan --only=backlog` - Criar um backlog SCRUM a partir do PRD
- `/workflow:design` - Gerar uma especificação técnica
- `/project:backlog` - Gerenciar epics, stories e tarefas
