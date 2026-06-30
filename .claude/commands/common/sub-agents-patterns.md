---
description: "Patterns de sub-agents pour les tâches parallèles et complexes"
---

# Patterns de Sub-Agents

Guide pour utiliser efficacement les sub-agents dans Claude Code pour les tâches parallèles et complexes.

## Types d'Agents

### 1. Explore Agent (Recherche Rapide)
À utiliser pour l'exploration rapide du codebase et la collecte d'informations.

```
Task tool avec subagent_type: "Explore"
- Recherches rapides de patterns de fichiers
- Recherches de mots-clés dans le code
- Compréhension de la structure du codebase
```

**Quand l'utiliser :**
- Recherche de fichiers par pattern
- Recherche de patterns de code spécifiques
- Réponses aux questions sur l'organisation du codebase

### 2. General-Purpose Agent (Tâches Complexes)
À utiliser pour les tâches multi-étapes nécessitant de l'autonomie.

```
Task tool avec subagent_type: "general-purpose"
- Refactoring complexe
- Mises à jour multi-fichiers
- Recherche et implémentation
```

**Quand l'utiliser :**
- Tâches couvrant plusieurs fichiers
- Sous-tâches indépendantes pouvant s'exécuter en parallèle
- Tâches nécessitant du jugement et de l'itération

### 3. Plan Agent (Architecture)
À utiliser pour concevoir des stratégies d'implémentation.

```
Task tool avec subagent_type: "Plan"
- Planification d'implémentation
- Décisions d'architecture
- Analyse des compromis
```

**Quand l'utiliser :**
- Avant d'implémenter des fonctionnalités complexes
- Lorsque plusieurs approches sont possibles
- Pour les décisions architecturales

## Patterns de Tâches Parallèles

### Pattern 1 : Recherche Parallèle
Lancez plusieurs Explore agents pour différents aspects :

```
# Lancement en parallèle (un seul message avec plusieurs appels d'outils) :
- Agent 1 : Rechercher les patterns d'authentification
- Agent 2 : Rechercher les endpoints API
- Agent 3 : Rechercher les modèles de base de données
```

### Pattern 2 : Mises à Jour Parallèles
Pour les mises à jour de fichiers indépendants entre langues/modules :

```
# Lancement en parallèle :
- Agent 1 : Mettre à jour les templates français
- Agent 2 : Mettre à jour les templates espagnols
- Agent 3 : Mettre à jour les templates allemands
- Agent 4 : Mettre à jour les templates portugais
```

### Pattern 3 : Vérifications Qualité Parallèles
Exécutez différentes vérifications de qualité simultanément :

```
# Lancement en parallèle :
- Agent 1 : Exécuter le linter
- Agent 2 : Exécuter les tests
- Agent 3 : Vérifier les types
- Agent 4 : Audit de sécurité
```

## Agents en Arrière-Plan

Utilisez `run_in_background: true` pour les tâches de longue durée :

```
Task tool avec :
  run_in_background: true

Avantages :
- Continuer à travailler pendant que l'agent s'exécute
- Vérifier la progression via le fichier de sortie
- Notification à la fin
```

**Idéal pour :**
- Suites de tests
- Processus de build
- Migrations importantes
- Pipelines de qualité

## Bonnes Pratiques

### À faire
- Lancer les tâches indépendantes en parallèle (un seul message, plusieurs outils)
- Utiliser Explore agent pour les recherches rapides
- Utiliser le mode arrière-plan pour les tâches longues
- Fournir des prompts clairs et détaillés

### À éviter
- Lancer des tâches dépendantes en parallèle
- Utiliser des agents pour de simples lectures de fichier unique
- Oublier de vérifier les résultats des agents en arrière-plan
- Utiliser des prompts vagues nécessitant des clarifications

## Exemple : Mise à Jour Multi-Langues

```markdown
# Tâche : Mettre à jour tous les templates i18n au nouveau format

## Exécution Parallèle :
1. Lancer 4 agents (FR, ES, DE, PT) avec run_in_background: true
2. Continuer à travailler sur d'autres phases
3. Vérifier les résultats à la notification

## Chaque agent reçoit :
- Liste des fichiers à mettre à jour
- Format de template à suivre
- Instructions de lecture avant écriture
```

## Patterns de Coordination

### Séquentiel avec Points de Contrôle
Pour les tâches ayant des dépendances :

```
1. Agent A termine la tâche A
2. Vérifier le résultat
3. Agent B utilise le résultat pour la tâche B
4. Vérifier le résultat
5. Continuer...
```

### Fan-Out/Fan-In
Pour le travail parallèle avec résultats combinés :

```
1. Fan-out : Lancer N agents en parallèle
2. Attendre : Tous les agents terminent
3. Fan-in : Combiner/vérifier les résultats
4. Continuer avec l'état fusionné
```

## 5. Agent Teams (Multi-Agent Coordination)

Agent Teams (Claude Code v2.1.45+, Research Preview) permet la coordination multi-agents avec gestion partagée des tâches. Contrairement aux sub-agents classiques (Task tool), Agent Teams offre une communication bidirectionnelle, des tâches partagées, et un shutdown coopératif.

### Comparaison : Task Tool vs Agent Teams

| Critère | Task Tool (Sub-Agents) | Agent Teams |
|---------|----------------------|-------------|
| **Communication** | Unidirectionnelle (parent → enfant) | Bidirectionnelle (SendMessage) |
| **Gestion des tâches** | Isolée par agent | Partagée (TaskCreate/TaskList/TaskUpdate) |
| **Coordination** | Aucune entre sous-agents | Leader coordonne N workers |
| **Shutdown** | Automatique à la fin | Coopératif (shutdown_request/response) |
| **Surcoût** | Faible (~2K tokens/agent) | Modéré (+20-37% tokens) |
| **Cas d'usage** | Recherche parallèle, tâches isolées | Workflows complexes, sprints, audits |
| **Nombre d'agents** | Illimité | 1 leader + 3 workers max |
| **Prérequis** | Aucun | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Version minimale** | v2.1.20+ | v2.1.45+ |

### Matrice de décision : Sub-Agents vs Agent Teams

| Critère | Sub-Agents (Task tool) | Agent Teams |
|---------|----------------------|-------------|
| **Durée de tâche** | < 3 min | > 3 min |
| **Coordination** | Aucune entre agents | Leader coordonne N workers |
| **Communication** | Unidirectionnelle | Bidirectionnelle (SendMessage) |
| **Dépendances inter-tâches** | Non | Oui (vagues, barrières) |
| **Agrégation de résultats** | Manuelle (parent combine) | Leader agrège automatiquement |
| **Surcoût tokens** | Faible (~2K/agent) | Modéré (+12-37%) |
| **Budget maximum** | Non | Oui (`--max-cost`) |
| **Garde-fou Fast Mode** | Non | Oui (confirmation bloquante) |
| **Recovery contexte** | Non nécessaire | Oui (re-read TaskList chaque 5 completions) |
| **Prérequis** | Aucun | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` |
| **Nombre d'agents** | Illimité | 1 leader + 3 workers max |

```
Utiliser Sub-Agents (Task tool) quand :
  - Tâches indépendantes < 3 min chacune
  - Recherche parallèle (Explore agents)
  - Traitement en lot sans dépendances
  - Budget contraint (moins de surcoût)
  - Pas besoin de communication inter-agents

Utiliser Agent Teams quand :
  - 2+ flux de travail interdépendants (> 3 min chacun)
  - Besoin de communication inter-agents
  - Workflow multi-phases (écriture → implémentation)
  - Agrégation de résultats par un leader
  - Besoin de garde-fous de coût (--max-cost, Fast Mode guard)
  - Recovery automatique (context compaction, timeout watchdog)
```

### Exemples concrets

| Scénario | Approche | Justification |
|----------|----------|---------------|
| Mettre à jour 5 fichiers i18n | Sub-Agents (parallèle) | Indépendant, < 2 min, pas de coordination |
| Audit 3 stacks technos | Agent Teams (`/team:audit`) | > 3 min, agrégation scores, rapport unifié |
| Rechercher un pattern dans le code | Sub-Agent (Explore) | Rapide, lecture seule, pas de coordination |
| Sprint 5 stories indépendantes | Agent Teams (`/team:sprint`) | > 15 min/story, DoD validation, file domain checks |
| Linter + tests + sécurité | Sub-Agents (parallèle) | Indépendant, résultats séparés, pas d'agrégation |
| Écriture + implémentation stories | Agent Teams (`/team:delivery`) | Multi-phase, contexte partagé, file domain mapping |

### Commandes Agent Teams disponibles

| Commande | Description | Pattern |
|----------|-------------|---------|
| `/team:audit` | Audit multi-tech parallèle | Fan-out / Barrier |
| `/team:sprint` | Sprint parallèle | File d'attente dynamique |
| `/team:security` | Revue sécurité 3 dimensions | Corrélation 3 voies |
| `/team:delivery` | Cycle complet sprint | Pipeline 2 phases |

## 6. Dynamic Workflows — le 3ᵉ palier (au-dessus d'Agent Teams)

Quand une tâche dépasse le contexte d'un agent OU exige **plus de ~4 workers concurrents** OU une
boucle/pipeline déterministe, Agent Teams ne suffit plus : utiliser les **Dynamic Workflows**
(Claude Code 2.1.154+, déclencheur **`ultracode`**). Claude écrit un script JS qui orchestre
**jusqu'à ~1000 sous-agents** (cap concurrent ~16) en arrière-plan, suivi via `/workflows`.

| Critère | Agent Teams | Dynamic Workflows |
|---------|-------------|-------------------|
| Concurrence | 1 leader + ~3 workers | jusqu'à ~1000 sous-agents (cap ~16 simultanés) |
| Orchestration | déclarative, synchrone, 1 passe | programmatique (boucles, fan-out conditionnel, pipelines) |
| Vérification adversariale | non native | pattern de premier ordre (réfutation par sceptiques) |
| Déclenchement | `/team:*` | mot-clé `ultracode` / « use a workflow » |

| Scénario | Approche | Justification |
|----------|----------|---------------|
| Audit exhaustif 7 domaines × 11 stacks + vérif adverse | **Dynamic Workflow** | > 4 workers, pipeline review→verify, dédup |
| Migration d'un pattern sur 200 fichiers | **Dynamic Workflow** (worktree isolation) | volume, éditions concurrentes isolées |
| Recherche multi-sources fact-checkée | **Dynamic Workflow** | fan-out + deep-read + vérification + synthèse |

> Détails, patterns composables et squelette de script : skill **`dynamic-workflows`**
> (`@.claude/skills/dynamic-workflows/SKILL.md`). Ne pas confondre avec `/effort ultracode`
> (palier d'effort CLI) ni avec `ralph-run` (boucle séquentielle mono-contexte).

### Outils de support

| Outil | Fichier | Rôle |
|-------|---------|------|
| Adaptateur Ralph | `Tools/AgentTeams/lib/ralph-teams-adapter.sh` | Abstraction Agent Teams API |
| Estimateur de coût | `Tools/AgentTeams/lib/cost-estimator.sh` | Estimation tokens/coût |
| Dashboard de coût | `Tools/AgentTeams/lib/cost-dashboard.sh` | Tableau comparatif visuel |
| Vérification compatibilité | `Tools/AgentTeams/lib/compatibility-check.sh` | Validation agents/rôles |
| Agrégateur de résultats | `Tools/AgentTeams/lib/result-aggregator.sh` | Fusion résultats multi-agents |

### Ressources

- [Guide Agent Teams](../../docs/AGENT-TEAMS-GUIDE.md) — Setup, coûts, limitations
- [CLAUDE.md](../CLAUDE.md) — Compatibilité Claude Code v2.1.45+

## Références

- Documentation du Task tool de Claude Code
- `.claude/rules/01-workflow-analysis.md` pour les patterns d'analyse
- `.claude/settings.json` pour la configuration des permissions
