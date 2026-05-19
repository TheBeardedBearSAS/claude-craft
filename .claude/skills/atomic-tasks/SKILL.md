---
name: atomic-tasks
description: Pattern GSD (Get Shit Done) - découper en tâches atomiques avec contextes subagent frais pour combattre le context rot. Use when planning complex work or working past 50% context usage.
context: fork
disable-model-invocation: true
triggers:
  keywords: ["decompose", "split task", "context rot", "atomic", "GSD", "subagent", "spec-driven"]
auto_suggest: true
---

# Atomic Tasks — Pattern GSD (Get Shit Done)

Pattern inspiré de [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (Lex Christopherson, adopté par Amazon/Google/Shopify/Webflow).

**Objectif :** combattre le **context rot** (dégradation de la qualité au-delà de ~50% de contexte utilisé) en découpant le travail en tâches atomiques exécutées dans des subagents à contexte frais.

## Les 5 étapes du pattern GSD

### 1. Split work — Découper

Découper la feature en tâches **atomiques** :
- Chacune exprimable en 1-3 phrases
- Chacune réalisable en < 30 minutes
- Chacune testable indépendamment
- Chacune committable en un commit atomique

```
❌ MAUVAIS : "Ajouter le système d'authentification"
✅ BON :
  1. "Créer la table users avec migration"
  2. "Implémenter POST /auth/register avec validation email"
  3. "Implémenter POST /auth/login retournant JWT"
  4. "Ajouter middleware JWT verification"
  5. "Tests d'intégration du flow login"
```

### 2. Small plans — Plans courts par tâche

Pour chaque tâche atomique, un plan **court** :
- 1 objectif
- 3-5 étapes max
- Critères de succès explicites (test qui passe, endpoint qui répond, fichier qui existe)

### 3. Fresh subagent contexts — Contexte neuf à chaque tâche

**Règle fondamentale :** chaque tâche atomique s'exécute dans un **subagent à contexte frais** (via Task tool ou `/clear` entre tâches).

| Raison | Impact |
|--------|--------|
| Contexte < 30% au démarrage | Qualité réponses maximale |
| Pas de résidus de la tâche précédente | Zéro confusion cross-task |
| Coût tokens optimisé | Pas de relecture inutile du contexte accumulé |
| Parallélisable | Plusieurs subagents en simultané |

**Implémentation :**
- Utiliser `Agent` tool avec `subagent_type=general-purpose` ou spécialisé
- Passer UNIQUEMENT le contexte nécessaire (pas tout le projet)
- Demander un rapport concis à la fin (< 200 mots)

### 4. Atomic git commits — Commits atomiques

Chaque tâche = 1 commit. **Jamais** de commit qui mélange 2 tâches.

```
✅ BON :
  commit 1 : "feat(auth): add users table migration"
  commit 2 : "feat(auth): implement register endpoint"
  commit 3 : "feat(auth): implement login endpoint"

❌ MAUVAIS :
  commit 1 : "feat: auth system + bug fixes + refactor"
```

**Bénéfice :** `git bisect` efficace, reverts ciblés, review facilitée.

### 5. Verify goals — Vérifier chaque objectif

Avant de passer à la tâche suivante, **vérifier explicitement** que l'objectif est atteint :

- [ ] Le test écrit passe
- [ ] L'endpoint répond avec le bon code HTTP
- [ ] Le build compile
- [ ] Le linter passe
- [ ] Le comportement utilisateur est observable

**Règle :** pas de "je pense que ça marche". **Preuve ou pas fini.**

## Signaux qu'il faut appliquer ce pattern

- Contexte utilisé > 50%
- Tâche qui s'étale sur > 1h sans livrable intermédiaire
- Réponses de Claude qui deviennent moins précises
- Besoin de re-expliquer des choses déjà dites
- Multiple responsabilités dans une seule demande

## Anti-patterns à éviter

| Anti-pattern | Pourquoi mauvais |
|--------------|------------------|
| **Kitchen-sink session** | Tout faire dans 1 session = context rot garanti |
| **Tâche non testable** | Impossible à vérifier = jamais "done" |
| **Commit mélangé** | Review impossible, revert dangereux |
| **Pas de clear entre tâches** | Pollution inter-tâches |
| **Planification excessive** | 10 étapes pour changer 1 ligne = overhead |

## Intégration Claude Craft

- **`/workflow:analyze`** — phase d'analyse BMAD doit produire des tâches atomiques
- **`/common:ralph-run`** — Ralph doit itérer sur des tâches atomiques, une par boucle
- **Agent tool** — chaque tâche complexe déléguée à un subagent frais
- **Rule 12 (context-management)** — `/clear` obligatoire entre tâches non liées
- **Rule 23 (karpathy-principles)** — minimal code par tâche

## Ressources

- [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
- Rule `.claude/rules/01-workflow-analysis.md`
- Rule `.claude/rules/12-context-management.md`
- Command `/common:sub-agents-patterns`

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
