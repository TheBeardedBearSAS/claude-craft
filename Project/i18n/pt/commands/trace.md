---
name: trace
description: "Matriz de rastreabilidade bidirecional (requisito → story → código → testes); --gaps lista os requisitos não cobertos, --by-priority agrupa por prioridade MoSCoW"
argument-hint: "[all|requirement|story|code] [ID] [--gaps] [--by-priority] [--level=story|code|test|all] [--format=table|mermaid|json]"
---

# /project:trace

## Missão

Relacionar cada requisito do PRD com as user stories, o código e os testes. A vista predefinida é a matriz bidirecional completa; `--gaps` transforma-a num relatório de cobertura que lista apenas o que não está coberto (o antigo `/project:trace --gaps`); `--by-priority` agrupa o resultado por prioridade MoSCoW.

## Utilização

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/project:trace` ou `/project:trace all` | Matriz completa: requisito → story → código → testes | `/project:trace` |
| `/project:trace requirement FR-001` | Rastreia um requisito para baixo | `/project:trace --scope requirement --id FR-001` |
| `/project:trace story US-001` | Rastreia uma story para cima (requisitos) e para baixo (código, testes) | `/project:trace --scope story` |
| `/project:trace code` | Ficheiros de código com e sem referência a uma story | `/project:trace --scope code` |
| `/project:trace --gaps` | Relatório de cobertura: requisitos não cobertos por stories, código ou testes, com ações recomendadas | `/project:trace --gaps` |
| `/project:trace --gaps --level test` | Igual, limitado a um nível de cobertura (`story`, `code`, `test`, `all`; predefinido `all`) | `/project:trace --gaps --level test` |
| `/project:trace --by-priority` | Agrupa requisitos e percentagens de cobertura por prioridade MoSCoW | novo (antes era uma secção do coverage-map) |

As opções combinam-se: `/project:trace --gaps --by-priority` produz o relatório de cobertura com a repartição por prioridade.

## Argumentos

Analisar `$ARGUMENTS`:
- Primeiro argumento posicional entre `all|requirement|story|code` → âmbito (predefinido `all`).
- Argumento posicional seguinte que corresponda a `FR-\d+` ou `US-\d+` → ID a rastrear (necessário para `requirement` e `story`).
- `--gaps` → modo de cobertura. `--level` só é lido neste modo.
- `--by-priority` → agrupar por prioridade: P0 = Must have, P1 = Should have, P2 = Could have / Nice to have.
- `--format` → `table` (predefinido), `mermaid`, `json`.

## Pré-requisitos

- `project-management/prd.md` existe com identificadores de requisitos FR-xxx
- `project-management/backlog/` contém user stories com referências `Implements:`
- Código com comentários `// Story: US-xxx` ou `# Story: US-xxx` (opcional para `--gaps --level story`)
- Ficheiros de testes com referências a stories/requisitos

## Plan Mode

> **O Plan Mode é obrigatório.** Antes de executar, o Claude ativa o Plan Mode para analisar o código afetado, propor um plano de implementação e aguardar a sua validação antes de fazer qualquer alteração.

## Análises partilhadas

Ambos os modos executam uma só vez as mesmas quatro análises; os resultados alimentam a matriz ou o relatório de cobertura. O **estado** de uma story provém sempre de `.bmad/sprint-status.yaml` (fonte única de verdade); os ficheiros markdown fornecem apenas o conteúdo.

### Análise 1: Requisitos

1. Ler `project-management/prd.md`
2. Extrair todos os identificadores FR-xxx da secção de requisitos funcionais
3. Registar o texto, a prioridade (P0/P1/P2) e os critérios de aceitação
4. Registo: `{FR-001: {text, priority}}`; contar os requisitos por prioridade

### Análise 2: User stories

1. Percorrer `project-management/backlog/` à procura de `US-*.md` (ou ficheiros `user-stories/`)
2. Em cada story, ler a linha `Implements:` ou a secção `Traceability`
3. Correspondência: `{US-001: [FR-001, FR-003]}`; ler o estado e o sprint em `.bmad/sprint-status.yaml`
4. Um requisito que nenhuma story referencia é «No Story»

### Análise 3: Código

1. Procurar no código `// Story: US-xxx`, `# Story: US-xxx`, `@story US-xxx`
2. Correspondência com ficheiro e linha: `{US-001: [src/Service/OrderService.php:42]}`
3. Uma story sem referência é «No Code»; listar os ficheiros de código sem referência a uma story

### Análise 4: Testes

1. Procurar nos diretórios de testes as referências `US-xxx` / `FR-xxx` e verificar os nomes dos testes
2. Correspondência: `{US-001: [tests/OrderServiceTest.php]}`
3. Uma story com código mas sem referência de testes é «No Tests»

```
╔══════════════════════════════════════════════════════════╗
║ Requirements: {n} | Stories: {n} | Files: {n} | Tests: {n}║
╚══════════════════════════════════════════════════════════╝
```

## Modo matriz (predefinido)

Combinar as quatro correspondências. Saída (formato table):

```
Bidirectional Traceability Matrix
=================================

FR-001 (P0) User Authentication
  ├── US-001: Login with email/password
  │   ├── src/Service/AuthService.php:25
  │   ├── tests/AuthServiceTest.php ✅
  │   └── tests/AuthControllerTest.php ✅
  └── US-002: Password reset flow
      ├── src/Service/PasswordResetService.php:10
      └── tests/PasswordResetServiceTest.php ✅

FR-002 (P0) User Registration
  └── US-003: Register with email
      ├── src/Service/RegistrationService.php:12
      └── ⚠️ NO TESTS

FR-010 (P1) Export to CSV
  └── ⚠️ NO STORIES

Coverage Summary
================
| Level | Covered | Total | Percentage |
|-------|---------|-------|------------|
| Requirements → Stories | 8 | 10 | 80% |
| Stories → Code | 7 | 8 | 87% |
| Stories → Tests | 6 | 8 | 75% |
| End-to-End (FR → Test) | 6 | 10 | 60% |

Gaps Identified
===============
| Type | ID | Description | Action Needed |
|------|----|-------------|---------------|
| No Stories | FR-010 | Export to CSV | Create user story |
| No Tests | US-003 | Register with email | Add test coverage |
```

Com um ID, só esse ramo é apresentado, com o estado da story e o número de testes (por ex. `US-001: Login [Done]`, `tests/AuthServiceTest.php ✅ (12 tests)`), seguido de `Status: Fully covered (2/2 stories, 3/3 code files, 3/3 test files)`.

### Mermaid (`--format mermaid`)

`graph LR` com quatro subgrafos (Requirements, Stories, Code, Tests); setas contínuas para as ligações, setas tracejadas (`-.->|NO STORY|`) para um nó de lacuna quando faltam ligações; lacunas com estilo `fill:#ff6b6b`.

### JSON (`--format json`)

```json
{
  "generated_at": "2026-02-19T10:00:00Z",
  "requirements": {"FR-001": {"text": "User Authentication", "priority": "P0", "stories": ["US-001"], "covered": true}},
  "stories": {"US-001": {"title": "Login", "implements": ["FR-001"], "code_files": ["src/Service/AuthService.php"], "test_files": ["tests/AuthServiceTest.php"], "covered": true}},
  "coverage": {"requirements_to_stories": 0.80, "stories_to_code": 0.87, "stories_to_tests": 0.75, "end_to_end": 0.60},
  "gaps": [{"type": "no_stories", "id": "FR-010", "description": "Export to CSV"}]
}
```

## Modo lacunas (`--gaps`)

Reutiliza as análises partilhadas, calcula a cobertura por camada e lista apenas o que falta. `--level` restringe as camadas calculadas: `story` (análises 1-2), `code` (1-3), `test` (1-4), `all` (predefinido).

```
Requirement Coverage Map
========================
| Layer | Covered | Total | Coverage | Status |
|-------|---------|-------|----------|--------|
| Stories | 8 | 10 | 80% | ⚠️ |
| Code | 7 | 8 | 87% | ⚠️ |
| Tests | 6 | 8 | 75% | ❌ |
| End-to-End | 6 | 10 | 60% | ❌ |

Uncovered Requirements
| ID | Requirement | Priority | Missing |
|----|-------------|----------|---------|
| FR-005 | Bulk export | P0 | Tests |
| FR-010 | CSV import | P1 | Story, Code, Tests |

Recommended Actions
1. 🔴 CRITICAL: FR-005 (P0) tem código mas não tem testes — adicionar cobertura de testes
2. ⚠️ HIGH: FR-010 (P1) não tem story — criar uma user story
3. 📝 LOW: FR-020 (P2) não iniciada — planear para sprints futuros

Next Commands
- /project:trace requirement FR-005   → rastreio detalhado de um requisito
- /project:backlog add story         → criar as user stories em falta
- /workflow:plan --only=backlog          → regenerar o backlog com as lacunas
```

Com `--level test`, apresentar uma linha por story: `US-003 | ❌ | 0 files | 0 tests` e a ação (por ex. «Criar tests/RegistrationServiceTest.php»).

Mermaid (`--format mermaid`): `graph TD` com um subgrafo por prioridade; nós `FR-001 ✅`, `FR-005 ⚠️ No Tests`, `FR-010 ❌ No Story`; estilos `#4caf50` (coberto), `#ff9800` (parcial), `#f44336` (em falta).

### Limiares de cobertura

| Limiar | Estado | Ação |
|--------|--------|------|
| >= 90% | ✅ Excelente | Manter |
| 80-89% | ⚠️ Bom | Rever as lacunas |
| 60-79% | ⚠️ A melhorar | Priorizar a cobertura |
| < 60% | ❌ Crítico | Ação imediata necessária |

## Agrupamento por prioridade (`--by-priority`)

Funciona nos dois modos. No modo matriz, os requisitos são listados sob os títulos `P0 Must have`, `P1 Should have`, `P2 Could have`. No modo lacunas, acrescentar:

```
Coverage by Priority
| Priority | Requirements | Story Coverage | Code Coverage | Test Coverage |
|----------|-------------|----------------|---------------|---------------|
| P0 (Must Have) | 5 | 100% ✅ | 100% ✅ | 80% ⚠️ |
| P1 (Should Have) | 3 | 66% ⚠️ | 50% ❌ | 33% ❌ |
| P2 (Could Have) | 2 | 0% ❌ | 0% ❌ | 0% ❌ |
```

As ações recomendadas passam a ser ordenadas começando por P0.

## Exemplo de sessão

```
User: /project:trace
Claude: 10 requisitos encontrados (5 P0, 3 P1, 2 P2), 8 stories, 24 ficheiros de código, 18 ficheiros de testes.
        [matriz completa] Cobertura: 60% de ponta a ponta

User: /project:trace requirement FR-001
Claude: [apenas o ramo FR-001]

User: /project:trace --gaps --by-priority
Claude: [relatório de cobertura com tabela por prioridade, 2 requisitos P0 precisam de atenção]
```

## Comandos relacionados

- `/workflow:plan --only=prd` - Gerar o PRD com identificadores de requisitos
- `/workflow:plan --only=backlog` - Criar o backlog a partir do PRD
- `/workflow:design` - Gerar a especificação técnica
- `/project:migrate --stories` - Adicionar os campos em falta (como `Implements:`) às stories
