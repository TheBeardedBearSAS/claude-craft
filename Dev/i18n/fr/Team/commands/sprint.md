---
description: Équipe de Développement Sprint - Implémentation parallèle de stories utilisant les Agent Teams
argument-hint: "<sprint-name> [--max-workers=3] [--overnight]"
---

# Équipe de Développement Sprint - Implémentation Parallèle de Stories

Orchestrer l'exécution parallèle de sprint en utilisant les Claude Code Agent Teams (v2.1.32+). Lance un sprint conductor (opus) plus 2-3 workers développeurs (sonnet), chacun prenant une story indépendante du backlog.

## Arguments

$ARGUMENTS

- `<sprint-name>` : Nom ou ID du sprint à traiter
- `--max-workers=3` : Nombre maximum de workers dev parallèles (par défaut : 2, max : 3)
- `--overnight` : Exécuter en mode nuit (borné, s'arrête à 6h)
- `--supervised` : Pause avant chaque story pour confirmation humaine
- `--max-stories=10` : Nombre maximum de stories à traiter (par défaut : 10)
- `--timeout=12` : Durée maximale d'exécution en heures (par défaut : 12)
- `--dry-run` : Afficher la composition de l'équipe et les assignations de stories sans exécuter
- `--max-cost=<dollars>` : Budget maximum en dollars. Si le coût parallèle estimé dépasse ce seuil, l'exécution est bloquée avec un message OVER BUDGET
- `--ralph-mode` : Activer le moteur de récupération Ralph (classification des erreurs, réessai automatique, service d'escalade) en parallèle des Agent Teams.

## Garde-Fou Fast Mode (Confirmation Bloquante)

**OBLIGATOIRE** : Avant de lancer l'équipe, le conductor DOIT :

1. Détecter si le Fast Mode est actif (indicateur lightning bolt dans le terminal)
2. Si Fast Mode actif :
   - Afficher le dashboard comparatif standard vs fast via `cost-estimator.sh --fast-mode`
   - **Afficher un avertissement bloquant** avec les coûts comparés :
     ```
     ⚠️  FAST MODE DÉTECTÉ — Coûts Opus 6x plus élevés !

     | Mode     | Input ($/M) | Output ($/M) | Coût estimé ce sprint |
     |----------|-------------|--------------|----------------------|
     | Standard | $5.00       | $25.00       | ~$X.XX               |
     | Fast     | $30.00      | $150.00      | ~$Y.YY               |

     Voulez-vous continuer en Fast Mode ? (oui/non)
     Recommandation : tapez /fast pour désactiver avant de continuer.
     ```
   - **Attendre la confirmation explicite** de l'utilisateur avant de poursuivre
   - Si l'utilisateur refuse, abandonner avec un message suggérant `/fast` pour désactiver

## Prérequis

- Claude Code v2.1.32+ avec support Agent Teams
- Variable d'environnement `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` définie
- Backlog sprint BMAD avec des stories au statut `ready-for-dev`
- Métadonnées du sprint dans `.bmad/sprint-status.yaml`
- Au moins 2 stories indépendantes (les sprints à story unique utilisent Ralph séquentiel)
- `Tools/AgentTeams/lib/ralph-teams-adapter.sh` disponible
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

> ℹ️ Ces scripts sont installés automatiquement par claude-craft (`make install-agentteams` ou via l'installeur). S'ils sont absents, la commande continue en **mode dégradé** : estimation de coût manuelle et `--ralph-mode` indisponible (non bloquant).

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## Quand utiliser (vs. Sprint Séquentiel)

| Condition | Utiliser Team Sprint (parallèle) | Utiliser `--sequential` ou story unique |
|-----------|----------------------------------|----------------------------------------|
| 1 story restante | Non | Oui |
| 2+ stories indépendantes | Oui (~2x accélération) | Aussi valide (plus simple) |
| Stories avec fichiers partagés | Non (conflits d'écriture) | Oui |
| Nuit sans surveillance | Oui (avec `--overnight`) | Aussi valide |
| Budget contraint | Non (+25-35% surcoût en tokens) | Oui |

**Critique** : Les stories doivent être totalement indépendantes (pas de domaines fichiers partagés). Si des stories modifient des fichiers qui se chevauchent, le conductor les assigne séquentiellement au même worker.

## Processus

### Étape 1 : Initialisation du sprint

Le sprint conductor charge l'état du sprint :

1. Lire `.bmad/sprint-status.yaml` pour la liste des stories et leurs statuts
2. Filtrer les stories avec le statut `ready-for-dev`
3. Analyser l'indépendance des stories (vérifier les chevauchements de domaines fichiers)
4. Partitionner les stories en groupes parallélisables
5. Estimer les coûts via `cost-estimator.sh --task-type sprint --techs <worker_count>`
6. **Garde-fou budget** : Si `--max-cost` est spécifié, vérifier que le coût estimé <= max_cost. Si dépassement : afficher `OVER BUDGET`, abandonner, suggérer de réduire le nombre de stories ou d'utiliser `--sequential`

**Vérification d'indépendance** : Deux stories sont indépendantes si leurs critères d'acceptation et leur périmètre d'implémentation ne référencent pas les mêmes fichiers source. Le conductor examine la description de chaque story et les références à la spécification technique pour le déterminer.

### Étape 2 : Assignation des stories

```
Sprint Conductor (opus) — coordonne via TaskCreate/SendMessage
  |
  +-- [Workers Parallèles - max 3] --------+
  |   dev-worker-1 (sonnet) : US-001        |
  |   dev-worker-2 (sonnet) : US-002        |
  |   dev-worker-3 (sonnet) : US-003        |
  +----------------------------------------+
  |
  v (barrière de synchronisation - toutes les stories terminées)
  |
  +-- [Revue Séquentielle] ----------------+
  |   Le Conductor valide la DoD de chaque  |
  |   story                                 |
  +----------------------------------------+
```

Le conductor crée un `TaskCreate` par story :

**Contexte lean par worker** : Chaque worker ne reçoit que la story assignée et la référence technologique du projet. Ne PAS charger les autres stories ou le PRD complet.

**Template de spawn structuré Phase 2 (TaskCreate)** :
```
Subject: "Implémenter US-XXX : <titre de la story>"
Description:
  Projet: <nom-du-projet>
  Technologie: <tech-du-projet>
  Story: <contenu complet de la story>
  Critères d'acceptation: <ACs complets avec Gherkin>
  Domaine fichiers: <répertoires source attendus>
  Hors-limites: <répertoires à NE PAS modifier>
  Commandes TDD: <commandes docker spécifiques à la tech>
  Critères de succès: Tous les tests AC passent, lint propre, couverture non réduite
  Référence: @.claude/references/<tech>/CLAUDE.md
activeForm: "Implémentation de US-XXX"
```

### Étape 3 : Exécution des workers (Par Story)

Chaque worker dev suit le cycle TDD pour la story qui lui est assignée :

```
1. Lire la story et les critères d'acceptation
2. RED : Écrire les tests échouants depuis les critères d'acceptation
3. GREEN : Implémenter le code minimal pour faire passer les tests
4. REFACTOR : Nettoyer en gardant les tests au vert
5. Exécuter la suite de tests complète (basée sur Docker)
6. Rédiger le résumé du résultat
7. Marquer la tâche comme terminée
```

**Commandes TDD des workers** (spécifiques à la technologie) :

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

### Étape 4 : Transition de story

Quand chaque worker termine, le conductor :

1. Valide la Definition of Done (DoD) pour la story
2. Transite le statut de la story : `in-progress` -> `review`
3. Assigne la prochaine story `ready-for-dev` au worker maintenant libre
4. Répète jusqu'à ce qu'il ne reste plus de stories ou que les limites soient atteintes

**Checklist de validation DoD** :
- [ ] Tous les tests des critères d'acceptation passent
- [ ] Aucune nouvelle erreur de linting introduite
- [ ] La couverture de code n'a pas diminué
- [ ] Pas de secrets dans le code commité
- [ ] L'implémentation de la story correspond à la spécification technique

### Étape 5 : Récupération d'erreurs

Le conductor classifie les erreurs selon le moteur de récupération Ralph :

| Niveau | Type | Action | Exemples |
|--------|------|--------|----------|
| 0 | Transitoire | Réessai automatique avec backoff | Timeout, rate limit, réseau |
| 1 | Récupérable | Auto-correction du worker + réessai | Erreurs de lint, échecs de tests, deps |
| 2 | Dégradé | Continuer avec avertissement | Docs, portes optionnelles, baisse de couverture |
| 3 | Bloqué | Escalade vers l'humain | Sécurité, architecture, auth |

**Détection de worker bloqué** : Si un worker n'a pas mis à jour sa tâche depuis 10 minutes, le conductor envoie un message de vérification de statut. Si pas de réponse dans les 2 minutes, le conductor marque la story comme bloquée et réassigne à un autre worker ou met en file pour revue humaine.

### Étape 6 : Complétion du sprint

Quand toutes les stories sont traitées :

1. Le conductor génère le rapport de synthèse du sprint
2. Met à jour `.bmad/sprint-status.yaml` via le pattern single-writer
3. Envoie `shutdown_request` à tous les workers
4. Rapporte les métriques finales

## Sortie

### Rapport de Synthèse du Sprint

```
================================================================
ÉQUIPE DE DÉVELOPPEMENT SPRINT - Synthèse
================================================================

Sprint : <sprint-name>
Date : AAAA-MM-JJ
Mode : Parallèle (Agent Teams)
Équipe : 1 conductor + N workers dev

----------------------------------------------------------------
STORIES TERMINÉES
----------------------------------------------------------------

| Story | Titre | Worker | Temps | DoD |
|-------|-------|--------|-------|-----|
| US-001 | Fonctionnalité login | dev-1 | 12m | PASS |
| US-002 | Profil utilisateur | dev-2 | 18m | PASS |
| US-003 | Tableau de bord | dev-3 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUÉES
----------------------------------------------------------------

| Story | Titre | Raison | Escalade |
|-------|-------|--------|----------|
| US-004 | Paiement | Dépendance architecturale | En file pour revue humaine |

================================================================
MÉTRIQUES D'EXÉCUTION
================================================================

| Métrique | Valeur |
|----------|--------|
| Stories terminées | X / Y |
| Stories bloquées | Z |
| Temps total | Xm (vs ~Ym séquentiel) |
| Accélération | ~X.Xx |
| Tokens totaux | ~XK |
| Workers lancés | N |
| Temps moyen par story | Xm |
```

## Attentes de performance

| Workers | Stories | Est. séquentielle | Est. équipe | Accélération | Surcoût en tokens |
|---------|---------|-------------------|-------------|-------------|-------------------|
| 2 | 4 | ~60 min | ~35 min | ~1.7x | +25% |
| 2 | 6 | ~90 min | ~50 min | ~1.8x | +25% |
| 3 | 6 | ~90 min | ~40 min | ~2.2x | +30% |
| 3 | 9 | ~135 min | ~55 min | ~2.5x | +35% |

**Note** : L'accélération dépend de l'indépendance des stories et d'une complexité comparable. Si une story prend 3x plus longtemps que les autres, la story goulot d'étranglement limite l'accélération globale.

## Intégration avec le moteur de récupération Ralph

Quand `--ralph-mode` est activé, l'adaptateur Ralph Teams (`Tools/AgentTeams/lib/ralph-teams-adapter.sh`) gère :

1. La classification des erreurs et le réessai automatique pour les échecs transitoires
2. Le pont checkpoint/récupération avec Agent Teams
3. La garantie que les mises à jour de sprint-status.yaml suivent le pattern single-writer
4. Le mapping des niveaux d'erreur Ralph vers les actions de récupération Agent Teams

## Gestion des erreurs

| Erreur | Reprise |
|--------|---------|
| Timeout du worker (>15min par story) | Le conductor réassigne la story |
| Crash du worker | La story retourne à `ready-for-dev`, un autre worker la récupère |
| Tous les workers bloqués | Le conductor escalade vers l'humain |
| Conflit sprint-status.yaml | Pattern single-writer via verrouillage de fichier |
| Story avec chevauchement de fichiers | Le conductor assigne séquentiellement au même worker |
| Docker non disponible | Le worker signale l'erreur, le conductor tente une analyse du code source uniquement |

## Limitations

- Maximum 3 workers dev parallèles (4 au total avec le conductor)
- Les stories doivent être indépendantes (pas de domaines fichiers partagés)
- Le coût en tokens est ~25-35% plus élevé que le séquentiel en raison de la duplication du contexte
- Nécessite Agent Teams Research Preview (l'API peut changer)
- Le mode nuit dépend de la stabilité de l'agent conductor (risque d'orphelin)
- Non adapté aux stories nécessitant des décisions humaines interactives en cours d'implémentation
