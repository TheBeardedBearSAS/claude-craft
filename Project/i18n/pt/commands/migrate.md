---
description: "Migração pontual de um backlog existente para BMAD v6 (análise, migração, completar stories, ressincronização)"
argument-hint: "[--analyze|--dry-run|--resync|--stories] [--force]"
---

# Migrar o backlog

Migração pontual de um backlog existente para a estrutura BMAD v6, com `.bmad/sprint-status.yaml` como única fonte de verdade do estado das stories e tarefas (esquema: `.claude/templates/project/sprint-status.md`). Um único comando cobre quatro modos: análise, migração, preenchimento dos campos em falta nas stories e ressincronização do conteúdo.

## Uso

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/project:migrate --analyze` | Apenas relatório: estrutura, pontuações INVEST, lacunas BMAD v6. Não escreve nada | `analyze-backlog` |
| `/project:migrate` | Padrão: migra o backlog e cria `.bmad/sprint-status.yaml` | `migrate-backlog` |
| `/project:migrate --stories [story-id]` | Preenche os campos em falta nas stories (tarefas, CA, histórico, INVEST) | `update-stories` |
| `/project:migrate --resync` | Reconcilia conteúdo e IDs entre o markdown e o YAML | `sync-backlog` |
| `--dry-run` | Apenas pré-visualização, válido para todos os modos | - |
| `--force` | Sobrescreve os ficheiros BMAD existentes (modo migração) | - |

## Argumentos

$ARGUMENTS (formato: [--analyze|--dry-run|--resync|--stories] [--force])
- **--analyze**: modo de análise (somente leitura)
- **--stories**: `story-id` opcional (ex.: US-001); se omitido, todas as stories são processadas
- **--resync**: modo de reconciliação
- **--dry-run**: mostra o que mudaria, não escreve nada
- **--force**: sobrescreve um `sprint-status.yaml` e ficheiros BMAD existentes
- Os modos são mutuamente exclusivos; sem nenhum deles, executa-se a migração padrão.

## Regras comuns

- **Localização do backlog**, procurada por ordem: `project-management/backlog/` (padrão), `docs/backlog/`, `backlog/`, `.bmad/` (já migrado).
- **Fonte de verdade única**: o estado vive apenas em `.bmad/sprint-status.yaml`. O markdown contém só conteúdo (título, descrição, CA, pontos, pais).
- **Estados legados**: a migração inicial é o ÚNICO momento em que os estados/emojis legados do markdown são lidos; são movidos para o YAML e depois removidos do markdown. `--resync` e `--stories` nunca copiam um estado a partir do markdown.
- **Plan mode obrigatório** para a migração padrão, `--stories` e `--resync` (exceto com `--dry-run`): o Claude analisa o impacto, propõe um plano e aguarda a sua validação antes de alterar o que quer que seja.
- **Ordem recomendada**: primeiro `--analyze`, depois a migração, depois `--stories`; use `--resync` mais tarde quando o conteúdo divergir.

## --analyze

Apenas relatório, nenhum ficheiro é modificado.

1. **Detetar** a localização do backlog (ver regras comuns).
2. **Identificar** epics (`EPIC-*.md`, `epic*.md`), user stories (`US-*.md`, `story*.md`), tarefas (`TASK-*.md` ou integradas nas stories) e ficheiros de índice (`index.md`, `backlog.md`, `README.md`).
3. **Analisar** por ficheiro: ID, título, estado legado (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked), sprint, story points, pais (US → EPIC, TASK → US), número de CA, número de tarefas e progresso.
4. **Pontuação INVEST** por story (0-6): Independent (sem dependência bloqueante), Negotiable (tem descrição), Valuable (benefício indicado), Estimable (tem pontos), Small (≤ 8 pontos), Testable (tem CA).
5. **Lacunas BMAD v6**: acompanhamento da fase TDD, lista de tarefas com progresso, histórico de estados, atribuição a sprint, estado de validação dos CA.
6. **Relatório**: resumo (totais), estrutura (árvore), tabela INVEST, tabela de lacunas de migração (campo / % de stories afetadas / ação), recomendações.

```
📊 Relatório de análise do backlog
Localização: project-management/backlog/ | Epics: {N} | Stories: {N} | Tarefas: {N}

| Story  | Título | INVEST | Em falta  |
|--------|--------|--------|-----------|
| US-001 | Login  | 5/6    | Estimable |

Lacunas de migração: tdd_phase 100% | tasks.list 60% | history 100%
Seguinte: /project:migrate
```

## Padrão: migração

1. **Validar**: criar `.bmad/` se necessário; avisar se `sprint-status.yaml` existir sem `--force`; a análise já deveria ter sido executada.
2. **Criar a estrutura**: `.bmad/sprint-status.yaml`, `batch-queue.yaml`, `gates/`, `hooks/`, `lib/`.
3. **Analisar** cada story: metadados, CA (Gherkin), tarefas relacionadas, estado legado, progresso.
4. **Converter os estados legados** para o YAML:

   | Origem | Estado BMAD v6 |
   |--------|----------------|
   | 🔴 To Do | backlog |
   | 🟡 In Progress | in-progress |
   | 🟢 Done | done |
   | ⏸️ Blocked | blocked |
   | Atribuída ao Sprint-X | ready-for-dev |

5. **Fase TDD inicial**: 0 % de tarefas concluídas → `red`; 1-99 % → `green`; 100 % → `refactor` ou `done`.
6. **Gerar `sprint-status.yaml`**, uma entrada por story:

   ```yaml
   stories:
     US-001:
       title: "User login"
       status: "in-progress"
       previous_status: "ready-for-dev"
       tdd_phase: "red"
       current_task: "TASK-001"
       story_points: 5
       epic_id: "EPIC-001"
       tasks:
         total: 4
         completed: 2
         list:
           - { id: "TASK-001", title: "Backend auth endpoint", status: "in-progress", type: "BE" }
       acceptance_criteria: { total: 3, validated: 1 }
       history:
         - { timestamp: "2026-01-29T10:00:00Z", from: "backlog", to: "in-progress", by: "migration", reason: "BMAD v6 migration" }
   ```

7. **Cópia de segurança** (exceto `--dry-run`): copiar o backlog para `.bmad/backup/` (com data e hora) e registar a sua localização.
8. **Aplicar** (exceto `--dry-run`): escrever o YAML, remover emojis/campos de estado dos ficheiros markdown, criar `.bmad/migration-log.md`.

Dry run: lista os ficheiros que seriam criados (ex.: `.bmad/sprint-status.yaml`), o número de stories/tarefas/CA que seriam migradas, e termina com «Run without --dry-run to apply changes.».

Reversão: `tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/ && rm .bmad/sprint-status.yaml`.

Próximos passos: rever o YAML, executar `/sprint:status`, definir os metadados do sprint (datas, objetivos), verificar os quality gates com `/gate:check all`.

## --stories

Preenche os campos BMAD v6 em falta nas stories existentes (todas, ou uma só com `story-id`).

1. **Carregar** `.bmad/sprint-status.yaml` e os ficheiros de stories; compará-los.
2. **Campos em falta** e valores padrão:

   | Campo | Obrigatório | Padrão se em falta |
   |-------|-------------|--------------------|
   | tdd_phase | Sim | "red" se in-progress, "" caso contrário |
   | tasks.list / total / completed | Sim | Extrair de `## Tasks`, contar, contar as concluídas |
   | current_task | Não | Primeira tarefa in-progress |
   | history | Sim | Entrada inicial com o estado atual (`by: "migrate"`) |
   | acceptance_criteria.total / validated | Sim | Contar na secção CA / 0 |
   | story_points | Sim | Perguntar ao utilizador se faltarem |
   | epic_id | Não | Extrair do ficheiro |

3. **Analisar as tarefas** da tabela `## Tasks` da story e os **CA** dos blocos Gherkin `### ACn:` para preencher `tasks.list` e `acceptance_criteria.list` (ids, títulos). Os estados de tarefas e CA só passam para o YAML nas entradas ainda não acompanhadas aí; um estado já presente no YAML nunca é sobrescrito pelo markdown.
4. **INVEST**: adicionar `invest_score` (independent, negotiable, valuable, estimable, small, testable, total).
5. **Atualizar** `sprint-status.yaml` fundindo os campos; opcionalmente adicionar um comentário de metadados aos ficheiros de stories (`<!-- BMAD v6 Metadata … -->` com `tdd_phase`, `invest_score`, `last_sync`).

Saída: tabela de stories atualizadas (campos adicionados, pontuação INVEST), resumo por campo (adicionados / ignorados), avisos (ex.: «US-003: story points em falta», «US-007: sem critérios de aceitação»), ficheiros modificados. Depois corrigir os avisos e executar `/project:migrate --resync` e `/gate:check backlog`.

## --resync

Reconcilia conteúdo e IDs entre os ficheiros markdown e o YAML. O estado nunca é sincronizado: o YAML prevalece.

1. **Carregar** as duas fontes e construir um mapa de comparação por ID de story.
2. **Detetar diferenças** de conteúdo: stories em falta, títulos, story points, listas de tarefas, CA, atribuição.
3. **Resolver**: o YAML é a autoridade para o estado, a fase TDD, o histórico e o estado das tarefas; o markdown é a autoridade para títulos, descrições, texto dos CA e pontos. Perguntar ao utilizador quando ambos alteraram o mesmo campo de conteúdo.
4. **Ficheiros → YAML**: adicionar as stories presentes só nos ficheiros; atualizar títulos, pontos, listas de tarefas e de CA.
5. **YAML → ficheiros**: atualizar o comentário de metadados (fase TDD, histórico, pontuação INVEST, marca de sincronização); nunca escrever um estado no markdown.
6. **Órfãos**: no YAML mas não nos ficheiros → marcar `archived` ou avisar; nos ficheiros mas não no YAML → adicionar ao YAML (estado `backlog`).
7. **Marcas temporais**: `last_sync` no YAML e `<!-- last_sync: … -->` nos ficheiros de stories.

Saída: alterações ficheiros → YAML, alterações YAML → ficheiros, conflitos resolvidos, órfãos (arquivados / adicionados), hora da última sincronização. Depois rever o `git diff` e executar `/sprint:status`.

Automatização: um hook pre-commit pode executar `/project:migrate --resync` (`.bmad/hooks/pre-commit.sh`).

## Exemplos

```
/project:migrate --analyze
/project:migrate --dry-run
/project:migrate
/project:migrate --force
/project:migrate --stories US-001
/project:migrate --stories --dry-run
/project:migrate --resync --dry-run
```
