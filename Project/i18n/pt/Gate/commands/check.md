---
description: "Executar qualquer quality gate: gates de documentos (PRD, tech spec, backlog, sprint, story, alinhamento), gates de código (commit, merge, release), o relatório completo ou um checkpoint de fase"
argument-hint: "<prd|spec|backlog|sprint|story|alignment|commit|merge|release|all> [--phase=pre-sprint|pre-impl|post-impl|pre-merge] [target]"
---

# Verificação dos Quality Gates

Ponto de entrada único para todos os quality gates BMAD. Os gates de documentos pontuam os artefatos de planejamento (PRD, tech spec, backlog, sprint, story, alinhamento spec-código); os gates de código verificam o repositório antes de um commit, de um merge ou de uma release. `all` agrega os gates de documentos em um único relatório, e `--phase` executa as verificações que pertencem a uma fase do ciclo de vida.

## Uso

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/gate:check prd [file]` | Quality gate do PRD (limiar 80%) | `/gate:check prd` |
| `/gate:check spec [file]` | Quality gate da Tech Spec (limiar 90%) | `/gate:check spec` |
| `/gate:check backlog [story-id] [--no-gate]` | Gate INVEST, 6/6 por story | `/gate:check backlog` |
| `/gate:check sprint [N] [--verbose]` | Gate Sprint Ready (todos os critérios obrigatórios) | `/gate:check sprint` |
| `/gate:check story <story-id>` | Gate Definition of Done (100%) | `/gate:check story` |
| `/gate:check alignment [story-id]` | Gate de alinhamento spec-código (limiar 85%) | `/gate:check alignment` |
| `/gate:check commit [--fix] [--staged]` | Verificação pré-commit dos arquivos modificados | `/gate:check commit` |
| `/gate:check merge [source] [target]` | Verificação pré-merge de uma branch | `/gate:check merge` |
| `/gate:check release <version> [patch\|minor\|major]` | Checklist de release | `/gate:check release` |
| `/gate:check all [--detailed]` | Relatório de todos os gates de documentos | `/gate:check all` |
| `/gate:check --phase=<phase> [story-or-sprint]` | Checkpoint de uma fase do ciclo de vida: `pre-sprint`, `pre-impl`, `post-impl`, `pre-merge` | `/gate:check --phase` |

## Argumentos

$ARGUMENTS (formato: `<gate> [target] [flags]` ou `--phase=<phase> [target]`)

1. A primeira palavra posicional seleciona o gate: `prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `commit`, `merge`, `release` ou `all`.
2. As demais palavras posicionais formam o `target` do gate (um arquivo, um ID de story, um número de sprint, uma branch ou uma versão, veja cada seção); as outras flags estão documentadas por gate.
3. `--phase=<phase>` substitui a palavra do gate: executa o checkpoint dessa fase (veja `## --phase`). `pre-sprint` e `post-impl` aceitam um sprint ou uma story, `pre-impl` aceita uma story.
4. Sem argumento: exibir a tabela de uso acima e parar. Gate desconhecido: listar os gates válidos.

## Regras compartilhadas

- **Caminhos padrão**: PRD `project-management/prd.md`, tech spec `project-management/tech-spec.md`, stories `project-management/backlog/`, sprints `project-management/sprints/sprint-{N}-{slug}/`, constitution `project-management/constitution.md` (opcional). Os limiares dos gates são configurados em `.bmad/gates/*.yaml` (`prd-gate`, `techspec-gate`, `backlog-gate`, `sprint-ready-gate`, `story-gate`).
- **Fonte de verdade do status**: `.bmad/sprint-status.yaml` contém o status das stories e das tasks (`backlog -> ready-for-dev -> in-progress -> review -> done`, qualquer -> `blocked`). Os gates leem o status nele e nunca nos arquivos markdown, que contêm apenas o conteúdo. Esquema: `.claude/templates/project/sprint-status.md`.
- **Pontuação**: critérios ponderados; um critério aprovado soma o seu peso à pontuação (pontuação final = soma dos pesos aprovados). Todos os critérios "obrigatórios" devem passar para o gate ser aprovado. Símbolos: ✅ aprovado, ⚠️ parcial, ❌ ausente ou reprovado, ⏳ ignorado ou não verificado.
- **Relatório**: sempre listar cada critério com o que foi encontrado ou o que falta, a pontuação em relação ao limiar, o veredito (`GATE PASSED` / `GATE FAILED (need X%, got Y%)`), depois "Required Actions" numeradas com um exemplo concreto para cada falha e o comando para reexecutar (`/gate:check <gate>`).
- **Docker**: os gates de código executam as ferramentas do projeto via Docker (`docker compose exec <service> ...` ou `docker run --rm ...`), nunca no ambiente local.

## prd

Valida um PRD (argumento: `[prd-file]`, padrão `project-management/prd.md`). Limiar: **80%**.

| Critério | Peso | Obrigatório | Descrição |
|----------|------|-------------|-----------|
| Problem Statement | 15% | Sim | Articulação clara do problema |
| Target Users | 15% | Sim | Público/personas definidos |
| Goals/Objectives | 15% | Sim | Metas mensuráveis |
| Success Metrics | 15% | Sim | KPIs e medições |
| Scope/Boundaries | 10% | Sim | O que está dentro/fora do escopo |
| User Stories Overview | 10% | Sim | Lista de funcionalidades em alto nível |
| Assumptions | 10% | Não | Premissas documentadas |
| Risks | 10% | Não | Identificação dos riscos (com mitigações) |

**Processo**: localizar e carregar o arquivo (falhar se não existir); para cada critério verificar que a seção existe com as palavras-chave relevantes e um comprimento mínimo de conteúdo; somar os pesos dos critérios aprovados; gerar o relatório.

```
PRD Quality Gate Validation
File: project-management/prd.md   Threshold: 80%
✅ Problem Statement (15%)   Found: clear problem definition in "Overview"
❌ Goals/Objectives (15%)    Missing: no measurable goals found
⚠️ Risks (10%)               Partial: risks listed but no mitigations
Score: 90/100 (90%)
✅ PRD GATE PASSED — Next: /workflow:design
```

Em caso de falha, sugerir um exemplo por lacuna (ex.: meta "Reduce checkout time by 30%", KPI "Conversion rate > 5%", risco "API rate limits; Mitigation: caching"). O gate também é verificado antes de `/workflow:design` e na transição do workflow BMAD.

## spec

Valida uma Tech Spec (argumento: `[techspec-file]`, padrão `project-management/tech-spec.md`). Limiar: **90%**.

| Critério | Peso | Obrigatório | Descrição |
|----------|------|-------------|-----------|
| Architecture Overview | 12% | Sim | Descrição do design do sistema |
| Architecture Diagram | 10% | Sim | Representação visual (mermaid, PNG, SVG) |
| Components | 12% | Sim | Definições de módulos/serviços |
| Data Model | 10% | Sim | Design de banco de dados/entidades |
| API Contracts | 10% | Sim | Especificações dos endpoints com schemas |
| Security | 12% | Sim | Autenticação e medidas de segurança |
| Performance | 8% | Não | Requisitos de desempenho |
| Error Handling | 8% | Não | Estratégia de erros |
| Testing Strategy | 10% | Sim | Abordagem de testes |
| Deployment | 8% | Não | CI/CD e release |

**Processo**: localizar e carregar o arquivo; verificar seções e palavras-chave, conferir que os diagramas existem e que a profundidade técnica é suficiente; pontuar; gerar o relatório.

```
Tech Spec Quality Gate Validation
File: project-management/tech-spec.md   Threshold: 90%
❌ Architecture Diagram (10%)  Missing: no diagram found (mermaid, PNG, SVG)
⚠️ API Contracts (10%)         Partial: endpoints listed but no schemas
Score: 68/100 (68%)
❌ TECH SPEC GATE FAILED (need 90%, got 68%)
```

As ações obrigatórias fornecem um modelo por lacuna: um esqueleto de diagrama mermaid, a estratégia de segurança (método de autenticação, modelo de autorização, criptografia), schemas de requisição/resposta com formatos de erro e versionamento, etapas de CI/CD com promoção e rollback. Para decisões significativas, sugerir um ADR: `/common:architecture-decision "JWT vs Session-based authentication"`. Em caso de aprovação: próxima etapa `/workflow:plan --only=backlog`, depois `/gate:check backlog`.

## backlog

Valida as stories segundo o INVEST (argumentos: `[story-id] [--no-gate]`). Padrão: todas as stories. `--no-gate` executa apenas a verificação INVEST simples (sem limiares, sem veredito aprovado/reprovado), útil durante o refinamento. Limiar: **6/6 para cada story**.

| Letra | Critério | Verificação |
|-------|----------|-------------|
| **I** | Independent | `blocked_by` está vazio |
| **N** | Negotiable | Tem uma descrição de tamanho razoável, sem especificação excessiva (número de tasks) |
| **V** | Valuable | Tem critérios de aceitação e uma declaração de benefício |
| **E** | Estimable | Story points > 0 |
| **S** | Small | Story points ≤ 8 |
| **T** | Testable | Número de critérios de aceitação > 0 (Gherkin) |

**Processo**: ler `.bmad/sprint-status.yaml` e carregar a story solicitada ou todas as stories; avaliar os 6 critérios por story (0-6); relatar por story e de forma agregada (aprovadas 6/6, avisos 4-5/6, reprovadas < 4/6). Um critério que não pode ser avaliado (ex.: S sem pontos) é exibido com `?`.

```
✅ US-001: User login          Score: 6/6 ✅
⚠️ US-002: User registration   [E] ✗ Estimable - No story points   Score: 4/6 ⚠️
❌ US-003: Rewrite of auth     [I] ✗ blocked by US-001, US-002  [S] ✗ 13 > 8 points   Score: 3/6 ❌
Summary: validated 8 | passing 6 | warnings 1 | failing 1
❌ BACKLOG GATE FAILED
```

Correção dos problemas comuns: story grande demais (S) → `/project:backlog edit story US-003` para reduzir o escopo e `/project:backlog add story` para o restante; pontos ausentes (E) → `/project:backlog edit story US-002 --points 3`; critérios de aceitação ausentes (V, T) → `/project:backlog edit story US-002 "Given... When... Then..."`. Em caso de aprovação: em seguida `/gate:check sprint`.

## sprint

Valida a prontidão do sprint (argumentos: `[N] [--verbose]`). `N` é o número do sprint e aceita `1`, `001` ou `sprint-001`; padrão: `metadata.sprint_id` de `.bmad/sprint-status.yaml`, caso contrário a pasta `project-management/sprints/sprint-*/` mais recente. `--verbose` exibe o detalhamento das stories. Limiar: **todos os critérios obrigatórios**.

| Critério | Peso | Obrigatório | Descrição |
|----------|------|-------------|-----------|
| Sprint Metadata | 20% | Sim | ID, nome, datas definidos |
| Sprint Goal | 15% | Sim | Objetivo claro (mín. 10 caracteres) |
| Stories Ready | 25% | Sim | Pelo menos 1 story em `ready-for-dev` (recomendado: 3) |
| Stories Estimated | 20% | Sim | Todas as stories têm pontos |
| Capacity Check | 10% | Não | Pontos ready ≤ `metadata.capacity_points` + 20% (ignorado se indefinido) |
| Dependencies Resolved | 10% | Não | Nenhuma story bloqueada em status ready |

**Processo**
1. Carregar o status do sprint, nesta ordem:
   1. `.bmad/sprint-status.yaml` se existir e se o seu `metadata.sprint_id` corresponder ao sprint `N`: extrair os metadados e contar as stories por status.
   2. Caso contrário, fallback markdown a partir de `project-management/sprints/sprint-{N}-*/` (escrito por `/workflow:start`): metadados, objetivo e capacidade a partir de `sprint-goal.md` (início, fim, capacidade, objetivo); stories a partir da tabela US selecionada de `sprint-goal.md` e dos arquivos `project-management/backlog/user-stories/US-*.md` (pontos, status), sendo que uma story planejada ainda não iniciada conta como `ready-for-dev`; dependências bloqueantes a partir de `sprint-dependencies.md`.
   3. Nenhum dos dois encontrado: falhar com "No sprint {N}: run `/workflow:start {N}`".
2. Validar os campos de metadados `sprint_id`, `name`, `start_date`, `end_date`, `goal`.
3. Validar as stories (ready, estimadas, nenhuma bloqueada) e a capacidade opcional.
4. Gerar o relatório, começando pela fonte utilizada: `Source: .bmad/sprint-status.yaml` ou `Source: markdown (project-management/sprints/sprint-{N}-*/)`.

No modo fallback o gate continua sendo avaliado, mas o relatório acrescenta um aviso não bloqueante: os comandos `/sprint:*` precisam de `.bmad/sprint-status.yaml`, execute `/workflow:start {N}`, ou `/project:migrate` para criar `.bmad/sprint-status.yaml` a partir de um backlog existente.

```
Sprint Ready Gate Validation
Sprint: sprint-3 - User Management   Period: 2026-01-29 → 2026-02-12 (14 days)
✅ Sprint Metadata (20%)  ✅ Sprint Goal (15%)  ✅ Stories Ready (25%): 5 stories, 21 points
✅ Stories Estimated (20%)  ✅ Capacity Check (10%): 21/25 = 84%  ✅ Dependencies Resolved (10%)
Score: 100/100 — ✅ SPRINT READY GATE PASSED
Commands: /workflow:start (start the sprint), /project:backlog next story (pick the first story)
```

Em caso de falha, as ações obrigatórias mostram o bloco `metadata` a adicionar em `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

depois as estimativas ausentes (`/project:backlog edit story US-010 --points 5`) e as stories ready bloqueadas (remover do sprint, desbloquear a dependência ou reordenar).

## story

Valida uma story em relação à Definition of Done (argumento: `<story-id>`, obrigatório, ex.: `US-005`). Limiar: **100% (todos os critérios obrigatórios)**.

| Critério | Peso | Obrigatório | Verificação |
|----------|------|-------------|-------------|
| Tasks Complete | 20% | Sim | `tasks.completed == tasks.total` |
| Tests Passing | 20% | Sim | `tdd_phase in ['green', 'refactor', 'done']` |
| AC Validated | 20% | Sim | `acceptance_criteria.validated == acceptance_criteria.total` |
| Code Reviewed | 15% | Sim | `status == 'review'` ou `review.approved == true` (PR aprovado) |
| No Blockers | 10% | Sim | `blocked_reason == null` |
| Documentation | 10% | Não | Documentação atualizada se necessário |
| Security Review | 5% | Não | Implicações de segurança verificadas |

**Processo**: ler `.bmad/sprint-status.yaml`, encontrar a story pelo ID e carregar seus campos; verificar cada critério; listar as tasks e os AC com o respectivo estado; gerar o relatório.

```
Story DoD Gate: US-005 — Email verification   Status: in-progress
❌ Tasks Complete (20%)   2/4 done   ✓ TASK-021 ✓ TASK-022 □ TASK-023 (in-progress) □ TASK-024 (pending)
❌ Tests Passing (20%)    TDD Phase: red
⚠️ Acceptance Criteria    1/3 validated
❌ Code Reviewed (15%)    No PR created yet
Score: 25/100 — ❌ STORY DoD GATE FAILED. Resume work: /workflow:implement US-005
```

Em caso de aprovação: a story pode passar para `done` com `/project:backlog move story US-005 done`. O gate também é verificado pelo hook Stop (`quality-gate.sh`) e antes de `/project:backlog move story <id> done`.

| Fase TDD | Significado | Próxima etapa |
|----------|-------------|---------------|
| red | Testes falhando | Implementar o código |
| green | Testes passando | Refatorar |
| refactor | Limpeza em andamento | Concluir ou próxima task |
| done | Ciclo concluído | Passar para review |

## alignment

Valida que a implementação corresponde às especificações, ou seja, sem desvio de especificação (argumento: `[story-id]`, padrão: todas as stories do sprint atual). Limiar: **85%**.

| Critério | Peso | Obrigatório | Descrição |
|----------|------|-------------|-----------|
| Requirement coverage | 20% | Sim | Todos os FR-xxx do PRD são cobertos por stories |
| Story-code mapping | 20% | Sim | Todas as stories têm referências de código correspondentes |
| AC-test mapping | 20% | Sim | Todos os critérios de aceitação têm testes |
| Tech spec adherence | 15% | Sim | A implementação segue o design da tech spec |
| Constitution compliance | 15% | Sim | O código respeita a constitution do projeto |
| Scope drift detection | 10% | Não | Nenhuma alteração de código sem referência |

**Processo**
1. Carregar o PRD (IDs FR-xxx), as stories (referências `Implements:`), a tech spec e, se existir, `project-management/constitution.md`.
2. Rastrear para frente (spec → código): para cada FR-xxx encontrar as stories que o implementam, para cada story os arquivos de código marcados com `// Story: US-xxx`, para cada AC o teste correspondente.
3. Rastrear para trás (código → spec): verificar que cada referência de story existe no backlog e pertence ao sprint correto; sinalizar as alterações de código sem referência de story (scope drift).
4. Validar a constitution: restrições técnicas, princípios de design, metas de NFR.
5. Pontuar e gerar o relatório.

```
SPEC-CODE ALIGNMENT GATE ❌   Story: US-012 | Score: 65%
✅ Requirement coverage   3/3 FR-xxx covered
❌ Story-code mapping     2 files missing references
❌ AC-test mapping        AC-2 has no test
⚠️ Scope drift            3 unreferenced files
Actions: 1. Add // Story: US-012 to ProfileService.ts  2. Write test for AC-2  → Fix issues before merging
```

Relacionados: `/project:trace` (matriz de rastreabilidade), `/project:trace --gaps` (cobertura dos requisitos).

## commit

Verifica o código antes de um commit (flags: `--fix` corrige os problemas corrigíveis, `--staged` verifica apenas os arquivos staged).

1. **Identificar os arquivos modificados**: `git diff --cached --name-only` (staged) e `git diff --name-only` (unstaged).
2. **Detectar a tecnologia** pela extensão: `.php` → php-cs-fixer, phpstan; `.dart` → dart format, dart analyze; `.py` → ruff, mypy; `.ts/.tsx/.js/.jsx` → eslint, prettier (+ `tsc --noEmit`).
3. **Executar as verificações no Docker**: PHP (`docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff`, `vendor/bin/phpstan analyse`, `lint:twig`, `lint:container`), Dart (`dart format --set-exit-if-changed`, `dart analyze`, `flutter test --coverage`), Python (`ruff check`, `ruff format --check`, `mypy`), JS/TS (`npx eslint`, `npx prettier --check`, `npx tsc --noEmit`).
4. **Verificações globais**: padrões de segredos (atribuições de `password|secret|api_key|token`, `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `AKIA`), arquivos proibidos em staging (`.env`, `.pem`, `.key`, `.p12`), arquivos-fonte maiores que 1 MB.
5. **Relatório**: verificações bem-sucedidas, problemas (`file:line`, ferramenta, mensagem), tabela de resumo (formatação, linting, tipos, segredos), ações obrigatórias e `Commit authorized: ✅ YES / ❌ NO`.
6. **`--fix`**: executar os corretores em vez das verificações em dry-run (`php-cs-fixer fix`, `dart format`, `ruff check --fix` + `ruff format`, `eslint --fix` + `prettier --write`).

| Bloqueante (commit proibido) | Não bloqueante (aviso) |
|------------------------------|------------------------|
| Erros de sintaxe, erros de PHPStan/mypy/tsc, segredos detectados, arquivos `.env`, chaves privadas/certificados | Problemas de formatação, avisos do ESLint, cobertura de testes reduzida, TODO/FIXME adicionado |

Para automatizar, chame-o a partir de um hook pre-commit: `claude-code "/gate:check commit --staged"`.

## merge

Verifica uma branch antes do merge (argumentos: `[source] [target]`; source padrão: branch atual, target padrão: `main` ou `master`). Exemplo: `/gate:check merge feature/auth main`.

1. **Analisar o diff**: commits a mesclar (`git log target..source --oneline`), arquivos modificados (`--stat`), linhas adicionadas/removidas (`--shortstat`).
2. **Verificações de qualidade** (no Docker): a suíte completa de testes com cobertura (phpunit, `flutter test --coverage`, `pytest --cov`, `npm run test -- --coverage`); análise estática completa (`phpstan analyse -l max`, `dart analyze --fatal-infos`, `mypy --strict .`, `tsc --noEmit`); auditoria de dependências (`composer audit`, `pip-audit`, `npm audit`, `dart pub outdated`).
3. **Verificações específicas**: migrations de banco de dados (`doctrine:migrations:diff`, `doctrine:schema:validate`, reversibilidade), breaking changes de API (diff de `openapi.yaml` / `docs/api/`), alterações de configuração (`config/`, `.env.example`, `docker-compose*.yml`).
4. **Análise dos commits**: cada mensagem segue os Conventional Commits `type(scope): description`, caso contrário emitir aviso.
5. **Cobertura**: comparar antes/depois; a cobertura não deve diminuir.
6. **Verificações de spec**: executar o checkpoint `pre-merge` (veja `## --phase`).
7. **Relatório**: estatísticas, tabela de testes (suíte, aprovados, reprovados, ignorados, variação de cobertura), tabela de análise estática, segurança (auditoria, segredos, arquivos sensíveis), migrations, pontos de atenção classificados em HIGH/MEDIUM/LOW/INFO, checklist final (code review aprovado e testes em staging são itens manuais) e `Merge authorized: ✅ YES / ❌ NO`.

| Bloqueante (merge proibido) | Não bloqueante (aviso) |
|-----------------------------|------------------------|
| Testes falhando, queda de cobertura > 2%, erros de análise estática, vulnerabilidades críticas/altas, segredos no código, migrations não reversíveis | Avisos de análise estática, TODO/FIXME adicionado, vulnerabilidades baixas/médias, queda de cobertura < 2% |

## release

Guia a equipe ao longo de uma release (argumentos: `<version> [patch|minor|major]`, ex.: `1.2.0 minor` ou `2.0.0-beta.1`). Exemplo: `/gate:check release 1.2.0 minor`.

1. **Validação pré-release**: branch correta (`main`/`master` ou `release/*`), nenhuma alteração não commitada, todos os testes passam; `CHANGELOG.md` atualizado (alterações desde a última tag com `git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"`); arquivos de versão atualizados (`composer.json`, `pyproject.toml`/`__version__.py`, `package.json`, `pubspec.yaml`, `Info.plist`, `build.gradle`).
2. **Testes exaustivos**: unitários, de integração, E2E, de desempenho, de segurança.
3. **Documentação**: README, documentação de API gerada, guia de migração se houver breaking changes.
4. **Gerar o checklist interativo** `RELEASE CHECKLIST - v{VERSION}` (tipo, data, branch) com as seções abaixo, cada item sendo uma caixa `- [ ]`:
   - **Pré-release**: qualidade do código (testes passam, cobertura ≥ 80%, sem erros de análise estática, todos os PRs revisados, nenhum TODO/FIXME bloqueante), segurança (sem CVEs críticas, sem segredos, testes OWASP, certificados SSL válidos), documentação (CHANGELOG, README, documentação de API, guia de migração, release notes), versionamento (versão incrementada, tags preparadas, branches de release).
   - **Build e empacotamento**: backend (build de produção, assets, migrations, variáveis de ambiente documentadas), frontend (bundle otimizado, CDN, service worker, sourcemaps não implantados), mobile se aplicável (builds iOS/Android assinados, screenshots e metadados das lojas).
   - **Validação em staging**: implantação, migrations, smoke tests, testes de regressão, desempenho, monitoramento, rollback testado.
   - **Implantação em produção**: pré-deploy (modo de manutenção, backup do banco de dados, comunicação ao suporte, janela de implantação), deploy (execução, migrations, health checks), pós-deploy (smoke tests, monitoramento, desempenho, tag git enviada, release no GitHub/GitLab).
   - **Comunicação**: release notes, suporte, clientes, documentação pública, anúncio.
   - **Plano de rollback**: identificar o problema (logs, alertas), limiar de decisão (ex.: > 5% de 5xx durante 5 min) e responsável pela decisão, comando de rollback, rollback do banco (migrations down), comunicação (equipe, incidente, post-mortem).
   - **Validação final**: todas as caixas marcadas, validado por, data/hora da release, notas.

Comandos úteis: `git tag -a v{VERSION} -m "Release v{VERSION}"` + `git push origin v{VERSION}`; `gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md`; `git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md`.

| Tipo SemVer | Quando | Exemplo |
|-------------|--------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | Nova funcionalidade | 1.0.0 → 1.1.0 |
| PATCH | Correção de bug | 1.0.0 → 1.0.1 |

## all

Relatório agregado dos gates de documentos (argumento: `[--detailed]`, que inclui os detalhes de validação de cada gate).

1. **Identificar os gates aplicáveis**: gate PRD se `project-management/prd.md` existir, gate Tech Spec se `project-management/tech-spec.md` existir, gate Backlog se existirem stories em `.bmad/sprint-status.yaml`, gate Sprint Ready se os metadados do sprint existirem, gates Story para cada story `in-progress` / `review`.
2. **Executar cada gate aplicável** (`prd`, `spec`, `backlog`, `sprint`, depois `story` por story) e coletar as pontuações.
3. **Agregar** no resumo e, em seguida, **recomendar** ações priorizadas com base nas falhas.

```
BMAD Quality Gates Report   Project: claude-craft   Sprint: sprint-3 - User Management
| Gate | Threshold | Score | Status |
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |
Story DoD Status: US-010 in-progress 45% ⏳ | US-012 review 85% ⚠️ | US-013 done 100% ✅
Overall Health: 🟢 Good — 4/5 gates passing, 8/10 stories on track
Recommendations: 1. ⚠️ US-002 missing story points → /project:backlog edit story US-002 --points 3
```

O relatório `--detailed` acrescenta, por gate, o arquivo, o limiar, a pontuação, o status e cada critério, as stories com problemas (backlog), o detalhamento do DoD de cada story e os itens de ação por prioridade (1 bloqueante, 2 a corrigir, 3 desejável). O relatório pode ser gerado sob demanda, incluído na retrospectiva do sprint, usado para monitorar a saúde do projeto ou exportado para os stakeholders. Os gates de código (`commit`, `merge`, `release`) e `alignment` não fazem parte dele: execute-os separadamente.

## --phase

Executa checkpoints automatizados nas fases críticas do ciclo de vida para garantir que as specs sejam coerentes, completas e alinhadas com a implementação.

**Pré-requisitos**: `project-management/prd.md` com IDs FR-xxx, `project-management/backlog/` com user stories, `.bmad/sprint-status.yaml` para o contexto do sprint; `project-management/constitution.md` opcional.

**O plan mode é obrigatório**: antes de executar, analisar o código impactado, propor um plano e aguardar a validação antes de qualquer alteração.

| Fase | Quando | Alvo |
|------|--------|------|
| `pre-sprint` | Antes de iniciar um sprint (após `/workflow:start`) | sprint |
| `pre-impl` | Antes de codificar uma story (após `/project:backlog next story --claim`) | story |
| `post-impl` | Após concluir uma story (antes de `/project:backlog move story US-xxx review`) | story |
| `pre-merge` | Antes de mesclar na main (chamada por `merge`) | story ou sprint |

**pre-sprint**: carregar as stories atribuídas ao sprint.

| Verificação | Obrigatória |
|-------------|-------------|
| Story AC completeness: toda story tem AC em Gherkin | Sim |
| Story estimation: todas as stories têm pontos | Sim |
| PRD traceability: `Implements:` referencia IDs FR-xxx válidos | Sim |
| Task decomposition: pelo menos 1 task por story | Sim |
| Dependency check: nenhum `Depends on:` circular ou não resolvido | Sim |
| Constitution alignment: nenhuma contradição | Não |

**pre-impl**: carregar a story e as suas seções da tech spec (referência `Tech Spec:`).

| Verificação | Obrigatória |
|-------------|-------------|
| Tech spec coverage: todo FR-xxx da story está coberto | Sim |
| AC testability: cada AC tem uma estrutura GIVEN/WHEN/THEN | Sim |
| Dependencies resolved: todas as stories `Depends on` estão `done` | Sim |
| Task clarity: as tasks têm descrições claras | Sim |
| NFR alignment: respeita os NFR da constitution | Não |

**post-impl**: carregar a story e as suas tasks.

| Verificação | Obrigatória |
|-------------|-------------|
| Code traceability: os arquivos de código referenciam `// Story: US-xxx` (ou `# Story: US-xxx`) | Sim |
| Test coverage: existem testes para cada AC | Sim |
| All tasks done | Sim |
| TDD phase: `refactor` ou `done` | Sim |
| No regressions: a suíte de testes continua passando | Sim |
| Spec drift: o escopo implementado corresponde à spec (sem scope creep) | Não |

**pre-merge**: executar todos os checkpoints anteriores e, em seguida:

| Verificação | Obrigatória |
|-------------|-------------|
| AC validation: todos os critérios de aceitação validados | Sim |
| Code review concluído | Sim |
| Suíte de testes verde (suíte completa) | Sim |
| Constitution respect | Sim |
| Traceability complete: FR → US → Code → Test, com `/project:trace` | Sim |
| Documentação atualizada | Não |

```
CHECKPOINT FAILED ❌   Phase: pre-impl   Story: US-012   Score: 60% (3/5 checks passed)
✅ AC testability  3/3   ✅ Dependencies resolved   ✅ Task clarity  4/4
❌ Tech spec coverage  Missing FR-003 mapping   ❌ NFR alignment  Perf target undefined
Actions required: 1. Add FR-003 coverage to tech spec section 3.2  2. Define performance targets
→ Fix issues before proceeding
```

Exemplo: `/gate:check --phase=pre-sprint Sprint-3` → "Score: 83% (5/6 passed) — WARNING: US-015 has no tasks yet". Integração: `/workflow:start` aciona `pre-sprint`, `/project:backlog next story` sugere `pre-impl`, `/project:backlog move story` aciona `post-impl` e `merge` aciona `pre-merge`.

## Comandos relacionados

- `/project:trace` — matriz de rastreabilidade e cobertura dos requisitos (`--gaps`)
- `/workflow:design`, `/workflow:plan --only=backlog` — produzem os artefatos que os gates validam
- `/workflow:start` — iniciar o sprint (inclui o checkpoint pre-sprint)
- `/project:backlog move story` — mover uma story para o próximo status
