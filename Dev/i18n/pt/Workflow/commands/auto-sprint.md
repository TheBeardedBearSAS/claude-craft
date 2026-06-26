---
description: Orquestrador de sprint completo de ponta a ponta (início -> decomposição -> validação -> implementação -> PR -> CI -> revisão -> retro -> merge)
argument-hint: "<N> [--auto-merge] [--max-fix-attempts=2] [--max-workers=3] [--base=main] [--dry-run] [--overnight]"
---

# Auto Sprint — Orquestrador de Sprint de Ponta a Ponta

Você age como **Product Owner / Scrum Master** e conduz um sprint completo desde o início até o merge
em um **único comando**. Cada cerimônia é executada dentro de um **sub-agente isolado**: a própria
janela de contexto do sub-agente substitui o `/clear` manual entre as etapas, mantendo o contexto
do orquestrador enxuto. A fase de implementação é executada por **você como maestro** (mesma lógica
de `/team:sprint`) para evitar o aninhamento de Agent Teams.

Isso automatiza o que anteriormente eram seis comandos manuais com `/clear` entre eles:

```
/workflow:start N -> /project:decompose-tasks 00N -> /gate:validate-sprint 00N
-> /team:sprint "sprint-00N" -> /workflow:review N -> /workflow:retro N
```

…e adiciona: branch, commit, Pull Request, monitoramento de CI e merge.

## Argumentos

$ARGUMENTS

- `<N>` : Número do sprint (ex: `5`). **Obrigatório.**
- `--auto-merge` : Faz o merge automaticamente quando a CI estiver verde e o DoD aprovado. **Padrão: DESATIVADO** — o
  comando pausa e aguarda um GO humano explícito antes de fazer o merge (respeita "revisão obrigatória",
  regra 09, e o princípio Karpathy "sem auto-merge sem revisão humana").
- `--max-fix-attempts=2` : Máximo de tentativas de correção automática por gate com falha antes de abortar (padrão: 2).
- `--max-workers=3` : Máximo de workers de desenvolvimento em paralelo na fase de implementação (padrão: 2, máximo: 3).
- `--base=main` : Branch base para o PR (padrão: `main`).
- `--dry-run` : Exibe as 9 fases planejadas e o contexto do sprint resolvido, depois para. **Nenhuma escrita.**
- `--overnight` : Repassado para a fase de implementação (limitado, para às 6h).

## Pré-requisitos

- Claude Code v2.1.32+ com suporte a Agent Teams
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` definido
- CLI `gh` autenticado (criação de PR / verificações / merge)
- Docker disponível (todos os testes são executados via Docker — veja o CLAUDE.md do projeto)
- Projeto BMAD v6 com `.bmad/sprint-status.yaml` presente

> Se um pré-requisito estiver ausente, aborte imediatamente com uma mensagem clara e acionável. Não pule uma fase silenciosamente.

## Normalização do número do sprint

Os comandos encadeados divergem no formato. Normalize **uma única vez** na Fase 0 e passe a forma
correta para cada fase:

| Fase | Formato esperado |
|------|-----------------|
| `start`, `review`, `retro` | `N` simples (ex: `5`) |
| `decompose-tasks` | `00N` com zeros à esquerda (ex: `005`) |
| `team:sprint` (implementação) | nome de sprint em formato livre resolvido a partir da pasta / arquivo de status |

Resolva a pasta do sprint fazendo glob de `project-management/sprints/sprint-{N}-*/` e leia
`.bmad/sprint-status.yaml` para obter o nome canônico do sprint e a lista de histórias.

## Processo

### Fase 0 — Normalizar e criar branch (inline)

1. Analise `<N>` e as flags. Derive `N`, `00N`, o slug e o nome do sprint.
2. Resolva `project-management/sprints/sprint-{N}-*/` e `.bmad/sprint-status.yaml`.
   **Aborte** se nenhum existir (nada a orquestrar).
3. Verifique se a árvore de trabalho está limpa e se `--base` está atualizado. **Aborte** se estiver suja.
4. Crie / faça checkout do branch de feature `feature/sprint-{N}-<slug>` a partir de `--base`
   (regra 09: `main` sempre implantável — nunca trabalhe diretamente no branch base).
5. Se `--dry-run`: exiba o contexto resolvido + as 9 fases planejadas e **pare aqui**.

### Fase 1 — Início (sub-agente)

Inicie um sub-agente isolado:

> "Leia `.claude/commands/workflow/start.md` e execute para o sprint **N**.
> Crie a estrutura de pastas do sprint, `sprint-goal.md` e o checklist pré-sprint.
> Retorne um resumo conciso (< 50 tokens) e a lista de arquivos criados."

### Fase 2 — Decomposição (sub-agente)

> "Leia `.claude/commands/project/decompose-tasks.md` e execute para o sprint **00N**.
> Gere os arquivos de tarefas por US, `task-board.md` e o grafo de dependências.
> Retorne um resumo conciso e os arquivos criados."

### Fase 3 — Validação do gate (sub-agente + loop de correção automática)

> "Leia `.claude/commands/gate/validate-sprint.md` e execute para o sprint **00N**.
> Retorne PASS/FAIL, a pontuação e a lista de critérios com falha."

**Em caso de FAIL → loop de correção automática** (até `--max-fix-attempts`):
- Inicie um sub-agente de remediação que corrige as lacunas reportadas (histórias sem `ready-for-dev`,
  estimativas ausentes, dependências não resolvidas) diretamente nos arquivos do sprint.
- Execute novamente o sub-agente de validação.
- Se ainda falhar após `--max-fix-attempts` → **aborte** com o relatório de remediação.

### Fase 4 — Implementação (você = maestro)

Assuma diretamente o **papel de maestro de `/team:sprint`** (**não** inicie um Agent Team aninhado):

1. Leia `.bmad/sprint-status.yaml`; filtre histórias em `ready-for-dev`.
2. Analise a independência por domínio de arquivo (sinalize sobreposições de `**/Shared/**`, `**/Common/**`, `**/Utils/**`,
   `**/Helpers/**` → sequencie no mesmo worker).
3. Estime o custo via `Tools/AgentTeams/lib/cost-estimator.sh` (respeite o bloqueio de Fast Mode
   e `--max-cost` se presente).
4. `TaskCreate` um worker de desenvolvimento por história independente (máximo `--max-workers`), contexto enxuto
   (apenas `@.claude/references/<project-tech>/CLAUDE.md`). Os workers seguem TDD Red/Green/Refactor
   com comandos de teste via **Docker**.
5. Consulte `TaskList` a cada 30s (recue para 60s após 3 polls ociosos). Atualize `TaskList`
   a cada 5 conclusões de worker (mitigação de compactação de contexto). Limite as mensagens de conclusão
   de worker a < 50 tokens.
6. Valide o **DoD** por história; faça a transição `in-progress -> review` em `sprint-status.yaml`
   via o padrão de gravação única.

**Em caso de falha no DoD de uma história → loop de correção automática** (mesmo orçamento de tentativas): re-atribua o worker com as
verificações que falharam; após `--max-fix-attempts`, marque a história como `blocked` e continue.

### Fase 5 — Commit e PR (inline)

1. Faça o commit da implementação com **Conventional Commits** (atômico por história quando possível).
2. Faça push do branch de feature.
3. Abra um PR **rascunho** contra `--base` via `gh pr create` (título + corpo resumindo o objetivo do sprint,
   as histórias entregues e o status do DoD).

### Fase 6 — Monitoramento de CI (inline + loop de correção automática)

1. Monitore a CI: `gh pr checks --watch` (poll a cada ~30s).
2. **Em caso de falha → loop de correção automática** (até `--max-fix-attempts`): leia os logs do job com falha
   (`gh run view --log-failed`), inicie um sub-agente de correção, faça commit + push, monitore novamente.
3. Após `--max-fix-attempts` ainda com falha → **aborte** com o relatório de verificações com falha.

### Fase 7 — Revisão (sub-agente)

> "Leia `.claude/commands/workflow/review.md` e execute para o sprint **N** (ele usa
> `git log` / `gh pr` para coletar os dados do sprint). Produza `sprint-review.md`. Retorne um resumo conciso."

### Fase 8 — Retrospectiva (sub-agente)

> "Leia `.claude/commands/workflow/retro.md` e execute para o sprint **N**.
> Produza `sprint-retro.md` com itens de ação SMART. Retorne um resumo conciso."

### Fase 9 — Merge (inline, com gate)

- **Se `--auto-merge`** E a CI estiver verde E o DoD aprovado:
  `gh pr ready` depois `gh pr merge --squash --delete-branch`.
- **Caso contrário (padrão)**: **pause**. Apresente o resumo final, o link do PR, o status da CI e o
  relatório do DoD, depois **aguarde um GO humano explícito** antes de fazer o merge.

> **Erros de merge são expostos, nunca ignorados.** Se o merge for bloqueado por proteção de branch,
> informe e sugira `--admin`. Se for bloqueado porque o PR toca `.github/workflows/`
> e o token não tem o escopo `workflow`, informe e sugira um squash-and-push manual.
> Não incorpore peculiaridades específicas do repositório neste comando genérico.

## Relatório final

```
================================================================
AUTO SPRINT — Resumo
================================================================
Sprint        : sprint-<N>-<slug>
Branch        : feature/sprint-<N>-<slug>
Base          : <base>
PR            : <url>  (CI: <verde|vermelha>)
----------------------------------------------------------------
Fase             | Status | Notas
-----------------|--------|---------------------------------------
0 Normalizar     | OK     | <N>/00<N>, branch pronto
1 Início         | OK     | sprint-goal.md
2 Decomposição   | OK     | N arquivos de tarefas
3 Validar gate   | OK     | pontuação X% (Y tentativas de correção)
4 Implementação  | OK     | A/B histórias, C bloqueadas
5 Commit + PR    | OK     | <url>
6 Monitor CI     | OK     | verde (Z tentativas de correção)
7 Revisão        | OK     | sprint-review.md
8 Retrospectiva  | OK     | sprint-retro.md
9 Merge          | PAUSADO| aguardando GO humano   (ou MERGED)
================================================================
```

## Tratamento de erros

| Situação | Comportamento |
|----------|---------------|
| Pasta do sprint / arquivo de status ausente | Abortar na Fase 0 |
| Árvore de trabalho suja | Abortar na Fase 0 |
| Gate de validação falha após tentativas | Abortar com relatório de remediação |
| Falha no DoD da história após tentativas | Marcar como `blocked`, continuar, reportar ao final |
| CI vermelha após tentativas | Abortar com relatório de verificações com falha |
| Merge bloqueado (proteção / escopo) | Expor o erro + flag sugerida, não forçar |
| Agent Teams indisponível | Abortar Fase 4 com dica de configuração (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

## Notas

- **Sem Agent Teams aninhados**: você executa o papel de maestro diretamente na Fase 4.
- **Auto-merge é opt-in** e intencionalmente protegido por uma flag.
- **Docker é obrigatório** para os testes (CLAUDE.md do projeto).
- O isolamento do sub-agente é o que substitui o `/clear` — mantenha cada relatório de sub-agente conciso.
