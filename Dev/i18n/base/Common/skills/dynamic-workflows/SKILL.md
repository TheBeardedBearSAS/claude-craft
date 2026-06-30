---
name: dynamic-workflows
description: Orchestrate dozens-to-hundreds of subagents from a script Claude writes (Claude Code Dynamic Workflows, trigger `ultracode`). Use when a task exceeds a single agent's context or needs more than ~4 concurrent workers — large audits, migrations, multi-source research, fan-out reviews. Distinct from Agent Teams (synchronous, ≤4 workers) and ralph-run (sequential single-context loop).
context: fork
---

# Dynamic Workflows — orchestration multi-agents scriptée

Dynamic Workflows (Claude Code 2.1.154+, mot-clé déclencheur **`ultracode`**) laissent Claude
**écrire un script JavaScript** qui orchestre des sous-agents de façon déterministe (boucles,
conditions, fan-out). Le script tourne en arrière-plan ; on suit l'exécution via `/workflows`.

> ⚠️ Opt-in coûteux : un workflow peut lancer des dizaines à centaines de sous-agents. Ne l'utiliser
> que sur demande explicite (mot « ultracode », « use a workflow », « fan out agents ») ou quand le
> palier de complexité ci-dessous est franchi.

## Quand l'utiliser — les 3 paliers d'orchestration

| Palier | Outil | Concurrence | Quand |
|--------|-------|-------------|-------|
| 1 | **Sub-agent simple** (Task/Agent) | 1 | Une investigation isolée, garder le contexte principal propre |
| 2 | **Agent Teams** (`/team:audit`, `/team:sprint`, `/team:security`) | 1 leader + ~3 workers | Travail parallèle borné, synchrone, qui tient en un round |
| 3 | **Dynamic Workflows** (`ultracode`) | jusqu'à ~1000 sous-agents (cap concurrent ~16) | La tâche dépasse le contexte d'un agent OU exige >4 workers OU une boucle/pipeline déterministe |

**Heuristique break-even :** dès que tu écrirais « lance N agents, puis pour chacun fais X, puis
agrège » — c'est un workflow. Si N ≤ 4 et une seule passe suffit, reste sur Agent Teams.

## Patterns composables (prompts minimaux)

- **Fan-out & synthesize** — N lecteurs en parallèle sur des sous-systèmes disjoints → un agent
  synthétise. (audit, cartographie de code)
- **Adversarial verification** — chaque finding passé à ≥1 sceptique chargé de le **réfuter** ;
  ne garder que les `CONFIRMED`. *Le pattern qualité le plus important pour la génération autonome.*
- **Generate-and-filter** — générer large (idées, candidats), puis filtrer par un juge.
- **Classify-and-act** — un classifieur route chaque item vers le traitement adapté.
- **Pipeline** — chaque item traverse toutes les étapes sans barrière (latence = pire chaîne, pas
  somme des étapes). C'est le défaut multi-étapes.
- **Loop-until-done / loop-until-dry** — relancer des chercheurs jusqu'à K rounds sans nouveauté
  (découverte de taille inconnue : bugs, edge cases).

## Squelette type (review → verify)

```js
const results = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, { phase: 'Review', schema: FINDINGS }),
  review => parallel(review.findings.map(f => () =>
    agent(`Adversarially verify: ${f.title}. Default refuted=true if unsure.`,
          { phase: 'Verify', schema: VERDICT }).then(v => ({ ...f, verdict: v }))))
)
const confirmed = results.flat().filter(Boolean).filter(f => f.verdict?.isReal)
```

`pipeline()` par défaut (pas de barrière) ; `parallel()` seulement quand l'étape N a besoin de TOUS
les résultats de N-1 (dédup, early-exit, comparaison croisée). `schema` force une sortie structurée
validée. Pour des éditions concurrentes de fichiers, `isolation: 'worktree'`.

## Monitoring

- **`/workflows`** : progression live (phases, agents, tokens).
- Le script revient avec un résultat agrégé ; lire ce résultat, décider la suite (souvent plusieurs
  workflows en séquence : comprendre → concevoir → implémenter → revoir).

## À ne pas confondre

- **ralph-run** (`/common:ralph-run`) : boucle séquentielle mono-contexte jusqu'à une DoD — pas de
  parallélisme. Pour une tâche qui dépasse ce modèle, basculer sur un Dynamic Workflow.
- **`/effort ultracode`** : palier d'effort CLI (débit code max sur Opus 4.8) — orthogonal au
  déclencheur `ultracode` des workflows, même si souvent utilisés ensemble.

> Référence : [Claude Code Workflows](https://code.claude.com/docs/en/workflows) · voir aussi
> `@.claude/commands/common/sub-agents-patterns.md` (tableau comparatif des orchestrations).
