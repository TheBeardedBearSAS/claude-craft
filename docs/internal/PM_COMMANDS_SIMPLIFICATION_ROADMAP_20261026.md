# Feuille de route — simplification des commandes de gestion de projet

## Contexte

Retour utilisateur : trop de commandes pour la gestion de projet, usage peu clair. L'analyse complète (lecture des 86 fichiers EN du périmètre) confirme le problème et révèle qu'il est **structurel**, pas seulement quantitatif :

| Constat | Mesure |
|---|---|
| Surface PM + /common | **86 commandes** : `/project:` 34, `/workflow:` 10, `/gate:` 7, `/qa:` 6, `/sprint:` 5, `/team:` 4, `/common:` 20 |
| Étape « Implémenter » revendiquée par | **10 commandes** (sprint:dev, run-sprint, run-epic, run-queue, team:sprint, team:delivery, auto-sprint, workflow:implement, next-story+transition, ralph-run) |
| Étape « Statut » revendiquée par | **9 commandes** (workflow:status, sprint:status, board, batch-status, metrics, burndown, gate:report, qa:status, daily-standup) |
| Points d'entrée « commencer ici » | 4 (common:getting-started, common:init, workflow:init, workflow:status) |
| Stores d'état non synchronisés | 4 (markdown `project-management/`, `.bmad/sprint-status.yaml`, `workflow-status.yaml` jamais mis à jour après init, `.recette/`) |
| Vocabulaires de statut | 5 (emojis CRUD, emojis decompose, BMAD kebab-case, `in_progress` snake_case, statuts batch) |
| Références vers commandes inexistantes | ~20 (`/qa:recette-*` ×41, `/sprint:tdd`, `/sprint:start`, `/sprint:plan`, `/sprint:retrospective`, `/project:split-story`, `/project:add-ac`, `/project:queue-*`, `/gate:configure`…) |

Bugs de cohérence majeurs (à corriger avant toute fusion) :
- `/sprint:dev` (implémenteur le plus recommandé) n'écrit jamais `sprint-status.yaml` → gates, team:sprint, next-story et Kanban aveugles (`Project/i18n/en/Sprint/commands/dev.md:424-433`).
- Les gates lisent `docs/prd.md` / `docs/tech-spec.md` alors que les générateurs écrivent `project-management/` (`Gate/commands/validate-prd.md:14`, `report.md:29`).
- Templates référencés `Scrum/templates/*` inexistants (`add-epic.md:44`, `add-story.md:52`, `add-task.md:64`).
- `decompose-tasks` écrit `task-board.md` + `tasks/US-XXX-tasks.md` ; `board`/`list-tasks`/`move-task`/`sprint:dev` lisent `board.md` + `TASK-*.md`.
- `generate-backlog` ne lit pas `prd.md` (lit `docs/CAHIER_DES_CHARGES*`, `:69-72`) et n'émet pas `Implements:` → chaîne de traçabilité cassée.
- `workflow:init` ne crée pas `.bmad/`, recommande `sprint:dev`, ignore auto-sprint (référencée par 0 commande).
- `auto-sprint` phase 0 abandonne si le sprint n'existe pas alors que la phase 1 le crée (`auto-sprint.md:67`).

**Décisions utilisateur** : (1) `sprint-status.yaml` = seule source de vérité du **statut**, markdown = **contenu** uniquement ; (2) anciennes commandes en **stubs de redirection pendant 1-2 minors, suppression en 9.0** ; (3) périmètre **complet, /common inclus**.

## Architecture cible : 86 → 34 commandes (−60 %)

Principe : **1 parcours principal de 7 commandes** + outils spécialisés regroupés par verbe, chacun piloté par sous-commande/flags.

```
/workflow:init → plan → design → start → implement → review → retro      (+ status à tout moment)
                                         └ auto-sprint = start→…→merge en une commande
```

| Cible | Absorbe | Notes |
|---|---|---|
| **/workflow:** (9) | | Pilote — seul namespace mis en avant |
| `init` | — | Crée squelette `.bmad/sprint-status.yaml` + `workflow-status.yaml` ; recommande le parcours |
| `status [--board\|--queue\|--standup\|--gates]` | sprint:status, project:board, batch-status, gate:report (résumé), common:daily-standup | « Où en suis-je + prochaine action » ; met à jour `workflow-status.yaml` |
| `plan [--research]` | workflow:analyze, project:generate-prd, project:generate-backlog | Logique intégrée (plus de wrapper) ; backlog lit `prd.md` + écrit `Implements:` |
| `design [--constitution]` | project:generate-tech-spec, project:generate-constitution | Ordre canonique : PRD → tech spec → backlog → sprint (aligner plan/design) |
| `start <N>` | project:decompose-tasks | Crée dossier `sprint-{N}-{slug}` + entrées SSY + tâches |
| `implement [<N>\|--epic X\|--resume] [--parallel N]` | sprint:dev, project:run-sprint, run-epic, run-queue | Séquentiel par défaut ; `--parallel` délègue à `team:sprint` ; écrit SSY |
| `review`, `retro` | — | Inchangés |
| `auto-sprint <N> [--from-prd]` | team:delivery (`--from-prd`) | Bout-en-bout ; enfin lié depuis init/getting-started |
| **/project:** (5) | | Outils backlog |
| `backlog <add\|list\|edit\|move\|next> <epic\|story\|task>` | add-/list-/update- epic/story/task, move-task, sprint:next-story, sprint:transition, sprint:auto-route | Transitions = machine à états BMAD unique ; auto-route appliqué à chaque transition |
| `reverse [scan\|prd\|stories\|gaps\|all]` | scan, reverse-prd, reverse-stories, gap-analysis | Pipeline brownfield ; règles personas dédupliquées |
| `trace [--by-priority]` | trace, coverage-map | Mêmes 4 scans |
| `report <burndown\|metrics\|deps> [--critical]` | burndown, metrics, dependencies, critical-path | Analytique ; lit SSY |
| `migrate [--analyze\|--dry-run\|--resync]` | analyze-backlog, migrate-backlog, update-stories, sync-backlog | One-shot vers SoT SSY |
| **/gate:** (1) | | |
| `check <prd\|spec\|backlog\|sprint\|story\|alignment\|commit\|merge\|release\|all> [--phase=…]` | 6 validate-*, gate:report, project:checkpoint, common:pre-commit-check, pre-merge-check, release-checklist | Toutes les quality gates (docs + code) sous un verbe ; chemins par défaut `project-management/` |
| **/sprint:** (0) | — | Namespace supprimé en 9.0 |
| **/qa:** (5) | | `recette`, `fix`, `regression`, `tdd`, `status [--report]` (absorbe qa:report) |
| **/team:** (3) | | `sprint` (moteur parallèle appelé par implement), `audit`, `security` |
| **/common:** (11 distribuées) | | `getting-started`, `init [--context]` (absorbe setup-project-context), `search`, `aliases` (régénéré), `ralph-run`, `research-context7`, `pack-repo`, `architecture-decision`, `generate-changelog`, `setup-ci`, `setup-rtk` |
| Sortent des commandes | | `sub-agents-patterns` → skill (c'est de la doc, pas une action) ; `add-technology`, `audit-claude-alignment`, `audit-freshness` → commandes mainteneur du dépôt, non distribuées (à confirmer) |

## Feuille de route

Chaque phase = 1 PR, 5 langues synchronisées dans la même PR, TDD (test qui échoue d'abord), CI verte avant tag.

### Phase 0 — 8.23.4 (patch) : réparer sans changer la surface

Statut : fait en v8.23.4 — PR #193 (mergée)
1. **Test d'abord** : `tests/scripts/command-refs.test.mjs` — toute référence `/ns:cmd` dans `Project/i18n/*/` et `Dev/i18n/*/` doit résoudre vers une commande existante (échoue aujourd'hui sur ~20 refs). Garde-fou anti-régression pour toutes les phases suivantes.
2. Corriger les références mortes (QA `recette-*`, `/sprint:*`, `/project:*`, `/gate:configure`, `Tools/Ralph/README.md` (`sprint-dev` préfixé `/project`)).
3. Chemins : `Scrum/templates/` → `templates/` ; gates par défaut `project-management/prd.md|tech-spec.md`.
4. Normaliser `board.md`, `sprint-{N}-{slug}/`, une tâche = `TASK-*.md` (decompose-tasks aligné).
5. `workflow:init` crée le squelette SSY (réutiliser le template SSY de `Dev/i18n/en/Workflow/commands/start.md:227-261`, ajouter `routing.auto_transitions`) ; fix `auto-sprint` phase 0 ; fix message `qa:fix:282`.
6. `generate-backlog` lit `prd.md` + utilise `Project/i18n/en/templates/user-story.md` (champ `Implements:`).

### Phase 1 — 8.24.0 : source de vérité unique + mécanisme de dépréciation

Statut : fait en v8.24.0 — PR #194 (mergée)
1. **Schéma SSY canonique** : statuts `backlog/ready-for-dev/in-progress/review/done/blocked`, `tasks`, `routing`. Toutes les commandes écrivantes (add-*, move-task, sprint:dev, decompose, board) écrivent le statut dans SSY ; emojis de statut retirés des MD (contenu seul). `board`/`list-*` lisent SSY. → `sync-backlog` devient sans objet.
2. Kanban : vérifier `cli/kanban/server/services/sprint-cache.js` / `file-scanner.js` contre la fixture `tests/fixtures/bmad-sprint-status` (formats inchangés côté fichiers).
3. **Infra dépréciation** (n'existe pas aujourd'hui) :
   - frontmatter `deprecated: true` + `replaced-by: /ns:cmd` ; corps stub < 500 o (exempté du size-check i18n, `scripts/verify-i18n-parity.sh:150`) qui exécute la nouvelle commande avec traduction des arguments et affiche un avertissement.
   - `config/removed-commands.yaml` : manifeste des fichiers retirés ; `Project/install-project-commands.sh` et `Dev/scripts/install-common-rules.sh` les suppriment à l'upgrade (aujourd'hui rien n'est jamais supprimé).
   - Test : `replaced-by` résout ; stubs à frontmatter valide (`tests/scripts/command-descriptions.test.mjs`).
4. Page unique **« Quel parcours ? »** (arbre de décision greenfield / brownfield / bugfix / sprint autonome) liée depuis getting-started, workflow:init, README.

### Phase 2 — 8.25.0 : fusion `/project:` + `/gate:` (34 + 7 + 3 → 5 + 1)

Statut : fait en v8.25.0 — PR #195 (mergée)
- Créer `project:backlog|reverse|trace|report|migrate` et `gate:check` en fusionnant le contenu des fichiers sources (dédupliquer, unifier la convention d'arguments : sous-commande positionnelle + `--flags`).
- Anciennes commandes → stubs. Étendre `tests/scripts/namespace-integrity.test.mjs` au dossier plat `Project/i18n/<lang>/commands/` (parité de noms, aujourd'hui non couverte).

### Phase 3 — 8.26.0 : fusion `/sprint:`, `/workflow:`, `/qa:`, `/team:`, `/common:`

Statut : fait en v8.26.0 — PR #196 (mergée, taguée v8.26.0 ; team:delivery conservée, décision 2026-10-26)
- `workflow:implement` absorbe sprint:dev + run-*; `workflow:status` absorbe les 5 vues ; plan/design intègrent les générateurs ; `project:backlog` absorbe next-story/transition/auto-route.
- `auto-sprint --from-prd` absorbe team:delivery (point de décision : valider en revue que la phase rédaction de team:delivery tient dans auto-sprint, sinon garder team:delivery).
- qa:report → `qa:status --report` ; /common : init+setup-project-context, sub-agents-patterns → skill, commandes mainteneur retirées de la distribution, `aliases` régénéré.
- Attention : `tests/content/sprint-status-bridge.test.mjs:13-14` lit `Workflow/commands/start.md` et `Gate/commands/validate-sprint.md` → adapter.

### Phase 4 — 9.0.0 : retrait

Statut : fait en v9.0.0 — PR #197 (draft, CI verte ; à merger après #196 et la période de dépréciation)
- Suppression des stubs et du namespace `/sprint:` ; manifeste `removed-commands.yaml` complet ; `docs/MIGRATION-v9.md` (table ancien → nouveau, modèle `docs/MIGRATION-v7.md`) ; patterns bannis dans `namespace-integrity.test.mjs:57-76`.

## Fichiers critiques (par phase)

- Sources : `Project/i18n/<lang>/{commands,Sprint/commands,Gate/commands,templates}/`, `Dev/i18n/<lang>/{Workflow,QA,Team,Common}/commands/`, `Dev/i18n/base/Common/commands/`.
- Installeurs : `Project/install-project-commands.sh` (mapping `:73-119`, aide figée `:194-310`), `Dev/scripts/install-common-rules.sh:442,730-760`, `Dev/scripts/tcl-common.sh:41-45`, `cli/lib/installer.js:313-320`, `cli/lib/update.js`.
- Gates CI : `tests/scripts/namespace-integrity.test.mjs:122-133` (compteurs), `tests/content/doc-counts.test.mjs`, `scripts/generate-references.mjs --check`, `scripts/verify-i18n-parity.sh`.
- Docs (le plus gros volume) : `docs/COMMANDS.md`, `CHEAT-SHEET.md`, `BMAD-PRACTICAL-GUIDE.md`, `docs/guides/<lang>/{07-backlog-management,10-complete-workflow}.md`, `README.md`, `.claude/CLAUDE.md`, `cli/lib/{banner,help,kanban}.js`, website (`sync-docs.sh` + `StatsGrid.vue`, `LandingPage.vue` à compteurs figés). Suivre la checklist de release (43+ fichiers).
- Compteurs à corriger au passage : 140 / 126 / 220 / 125 / 219 / 234 coexistent aujourd'hui.

## Vérification

- Par phase, via Docker : `make test-scripts-docker` (node:24, bash requis), `npm run docs:check`, `bash scripts/verify-i18n-parity.sh`, nouveau `command-refs.test.mjs` vert.
- E2E : installer dans un projet jetable (scratchpad) via `npx … install --tech=symfony`, vérifier l'arborescence `.claude/commands/` (anciens fichiers supprimés via manifeste, stubs présents en 8.25-8.26) ; dérouler le parcours `init → plan → design → start → implement → status` sur la fixture `tests/fixtures/bmad-sprint-status` et constater dans le Kanban que le statut suit (preuve de la SoT unique).
- Stubs : invoquer une ancienne commande → avertissement + exécution de la nouvelle.
