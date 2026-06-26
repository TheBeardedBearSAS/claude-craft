---
description: Orchestrateur de sprint de bout en bout (démarrage -> décomposition -> validation -> implémentation -> PR -> CI -> revue -> rétro -> merge)
argument-hint: "<N> [--auto-merge] [--max-fix-attempts=2] [--max-workers=3] [--base=main] [--dry-run] [--overnight]"
---

# Auto Sprint — Orchestrateur de Sprint de Bout en Bout

Tu joues le rôle de **Product Owner / Scrum Master** et tu pilotes un sprint complet, du lancement au merge,
en **une seule commande**. Chaque cérémonie s'exécute dans un **sous-agent isolé** : la fenêtre de contexte
propre au sous-agent remplace le `/clear` manuel entre les étapes, ce qui permet à ton contexte d'orchestrateur
de rester léger. La phase d'implémentation est conduite **par toi en tant que chef d'orchestre** (même logique
que `/team:sprint`) afin d'éviter l'imbrication d'Agent Teams.

Cette commande automatise ce qui nécessitait auparavant six commandes manuelles avec un `/clear` entre chaque :

```
/workflow:start N -> /project:decompose-tasks 00N -> /gate:validate-sprint 00N
-> /team:sprint "sprint-00N" -> /workflow:review N -> /workflow:retro N
```

…et ajoute : branche, commit, Pull Request, surveillance CI et merge.

## Arguments

$ARGUMENTS

- `<N>` : Numéro du sprint (ex. `5`). **Obligatoire.**
- `--auto-merge` : Merge automatiquement dès que la CI est verte et que la DoD est validée. **Défaut : DÉSACTIVÉ** — la
  commande se met en pause et attend un GO humain explicite avant de merger (respecte la règle de « revue obligatoire »,
  règle 09, et le principe Karpathy « pas d'auto-merge sans revue humaine »).
- `--max-fix-attempts=2` : Nombre maximal de tentatives de correction automatique par gate échoué avant abandon (défaut : 2).
- `--max-workers=3` : Nombre maximal de workers dev parallèles pendant la phase d'implémentation (défaut : 2, max : 3).
- `--base=main` : Branche de base pour la PR (défaut : `main`).
- `--dry-run` : Affiche les 9 phases planifiées et le contexte de sprint résolu, puis s'arrête. **Aucune écriture.**
- `--overnight` : Transmis à la phase d'implémentation (borné, s'arrête à 6h).

## Prérequis

- Claude Code v2.1.32+ avec le support Agent Teams
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` défini
- CLI `gh` authentifié (création de PR / checks / merge)
- Docker disponible (tous les tests s'exécutent via Docker — voir le CLAUDE.md du projet)
- Projet BMAD v6 avec `.bmad/sprint-status.yaml` présent

> Si un prérequis est manquant, abandonner immédiatement avec un message clair et actionnable. Ne jamais ignorer silencieusement une phase.

## Normalisation du numéro de sprint

Les commandes chaînées ne s'accordent pas sur le format. Normaliser **une seule fois** en Phase 0 et transmettre
la bonne forme à chaque phase :

| Phase | Forme attendue |
|-------|----------------|
| `start`, `review`, `retro` | `N` brut (ex. `5`) |
| `decompose-tasks` | `00N` avec zéros (ex. `005`) |
| `team:sprint` (implémentation) | nom libre du sprint résolu depuis le dossier / fichier de statut |

Résoudre le dossier du sprint via glob `project-management/sprints/sprint-{N}-*/` et lire
`.bmad/sprint-status.yaml` pour le nom canonique du sprint et la liste de stories.

## Processus

### Phase 0 — Normalisation & branche (inline)

1. Parser `<N>` et les drapeaux. Dériver `N`, `00N`, le slug et le nom du sprint.
2. Résoudre `project-management/sprints/sprint-{N}-*/` et `.bmad/sprint-status.yaml`.
   **Abandonner** si aucun des deux n'existe (rien à orchestrer).
3. Vérifier que l'arbre de travail est propre et que `--base` est à jour. **Abandonner** si sale.
4. Créer / basculer sur la branche feature `feature/sprint-{N}-<slug>` depuis `--base`
   (règle 09 : `main` toujours déployable — ne jamais travailler directement sur la branche de base).
5. Si `--dry-run` : afficher le contexte résolu + les 9 phases planifiées et **s'arrêter ici**.

### Phase 1 — Démarrage (sous-agent)

Instancier un sous-agent isolé :

> « Lis `.claude/commands/workflow/start.md` et exécute-le pour le sprint **N**.
> Crée la structure de dossier du sprint, `sprint-goal.md`, et la checklist pré-sprint.
> Retourne un résumé concis (< 50 tokens) et la liste des fichiers créés. »

### Phase 2 — Décomposition (sous-agent)

> « Lis `.claude/commands/project/decompose-tasks.md` et exécute-le pour le sprint **00N**.
> Génère les fichiers de tâches par US, `task-board.md`, et le graphe de dépendances.
> Retourne un résumé concis et les fichiers créés. »

### Phase 3 — Validation du gate (sous-agent + boucle de correction automatique)

> « Lis `.claude/commands/gate/validate-sprint.md` et exécute-le pour le sprint **00N**.
> Retourne PASS/FAIL, le score et la liste des critères échoués. »

**En cas d'ÉCHEC → boucle de correction automatique** (jusqu'à `--max-fix-attempts`) :
- Instancier un sous-agent de remédiation qui corrige les écarts signalés (stories non `ready-for-dev`,
  estimations manquantes, dépendances non résolues) directement dans les fichiers du sprint.
- Relancer le sous-agent de validation.
- Si toujours en échec après `--max-fix-attempts` → **abandonner** avec le rapport de remédiation.

### Phase 4 — Implémentation (tu = chef d'orchestre)

Prendre **directement le rôle de conducteur `/team:sprint`** (ne **pas** instancier un Agent Team imbriqué) :

1. Lire `.bmad/sprint-status.yaml` ; filtrer les stories à `ready-for-dev`.
2. Analyser l'indépendance des domaines de fichiers (signaler les chevauchements `**/Shared/**`, `**/Common/**`, `**/Utils/**`,
   `**/Helpers/**` → séquencer dans le même worker).
3. Estimer le coût via `Tools/AgentTeams/lib/cost-estimator.sh` (respecter le garde Fast Mode bloquant
   et `--max-cost` si présent).
4. `TaskCreate` un worker dev par story indépendante (max `--max-workers`), contexte réduit
   (uniquement `@.claude/references/<project-tech>/CLAUDE.md`). Les workers suivent le cycle TDD Rouge/Vert/Refactor
   avec des commandes de test **Docker**.
5. Interroger `TaskList` toutes les 30s (reculer à 60s après 3 sondages sans activité). Rafraîchir `TaskList`
   toutes les 5 complétion de worker (atténuation de la compaction de contexte). Limiter les messages de
   complétion de worker à < 50 tokens.
6. Valider la **DoD** par story ; faire passer l'état `in-progress -> review` dans `sprint-status.yaml`
   via le pattern single-writer.

**En cas de non-respect de la DoD pour une story → boucle de correction automatique** (même budget de tentatives) : reconfier la story au worker avec les vérifications en échec ; après `--max-fix-attempts`, marquer la story `blocked` et continuer.

### Phase 5 — Commit & PR (inline)

1. Commiter l'implémentation avec les **Conventional Commits** (atomique par story dans la mesure du possible).
2. Pousser la branche feature.
3. Ouvrir une PR en **brouillon** contre `--base` via `gh pr create` (titre + corps résumant l'objectif
   du sprint, les stories livrées et l'état de la DoD).

### Phase 6 — Surveillance CI (inline + boucle de correction automatique)

1. Surveiller la CI : `gh pr checks --watch` (sondage ~30s).
2. **En cas d'échec → boucle de correction automatique** (jusqu'à `--max-fix-attempts`) : lire les logs du job échoué
   (`gh run view --log-failed`), instancier un sous-agent de correction, commiter + pousser, relancer la surveillance.
3. Après `--max-fix-attempts` toujours en échec → **abandonner** avec le rapport de vérifications échouées.

### Phase 7 — Revue (sous-agent)

> « Lis `.claude/commands/workflow/review.md` et exécute-le pour le sprint **N** (il utilise
> `git log` / `gh pr` pour collecter les données du sprint). Produis `sprint-review.md`. Retourne un résumé concis. »

### Phase 8 — Rétrospective (sous-agent)

> « Lis `.claude/commands/workflow/retro.md` et exécute-le pour le sprint **N**.
> Produis `sprint-retro.md` avec des actions SMART. Retourne un résumé concis. »

### Phase 9 — Merge (inline, gardé)

- **Si `--auto-merge`** ET CI verte ET DoD validée :
  `gh pr ready` puis `gh pr merge --squash --delete-branch`.
- **Sinon (défaut)** : **se mettre en pause**. Présenter le résumé final, le lien PR, l'état CI et le
  rapport DoD, puis **attendre un GO humain explicite** avant de merger.

> **Les erreurs de merge sont remontées, jamais codées en dur.** Si le merge est bloqué par la protection de branche,
> le signaler et suggérer `--admin`. S'il est bloqué parce que la PR touche `.github/workflows/`
> et que le token n'a pas le scope `workflow`, le signaler et suggérer un squash-and-push manuel.
> Ne pas intégrer les particularités d'un dépôt spécifique dans cette commande générique.

## Rapport final

```
================================================================
AUTO SPRINT — Résumé
================================================================
Sprint        : sprint-<N>-<slug>
Branche       : feature/sprint-<N>-<slug>
Base          : <base>
PR            : <url>  (CI: <vert|rouge>)
----------------------------------------------------------------
Phase              | Statut | Notes
-------------------|--------|---------------------------------------
0 Normalisation    | OK     | <N>/00<N>, branche prête
1 Démarrage        | OK     | sprint-goal.md
2 Décomposition    | OK     | N fichiers de tâches
3 Validation gate  | OK     | score X% (Y tentatives de correction)
4 Implémentation   | OK     | A/B stories, C bloquées
5 Commit + PR      | OK     | <url>
6 Surveillance CI  | OK     | vert (Z tentatives de correction)
7 Revue            | OK     | sprint-review.md
8 Rétro            | OK     | sprint-retro.md
9 Merge            | EN ATTENTE | attente GO humain   (ou MERGÉ)
================================================================
```

## Gestion des erreurs

| Situation | Comportement |
|-----------|--------------|
| Dossier sprint / fichier de statut absent | Abandon en Phase 0 |
| Arbre de travail sale | Abandon en Phase 0 |
| Gate de validation échoué après tentatives | Abandon avec rapport de remédiation |
| DoD story non respectée après tentatives | Marquer `blocked`, continuer, signaler en fin |
| CI en échec après tentatives | Abandon avec rapport de vérifications échouées |
| Merge bloqué (protection / scope) | Remonter l'erreur + drapeau suggéré, ne pas forcer |
| Agent Teams indisponible | Abandon Phase 4 avec indication de configuration (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

## Notes

- **Pas d'Agent Teams imbriqués** : tu exécutes toi-même le rôle de conducteur en Phase 4.
- **L'auto-merge est opt-in** et intentionnellement conditionné à un drapeau.
- **Docker est obligatoire** pour les tests (CLAUDE.md du projet).
- L'isolation des sous-agents remplace `/clear` — garder chaque rapport de sous-agent concis.
