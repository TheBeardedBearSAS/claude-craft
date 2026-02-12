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

## Références

- Documentation du Task tool de Claude Code
- `.claude/rules/01-workflow-analysis.md` pour les patterns d'analyse
- `.claude/settings.json` pour la configuration des permissions
