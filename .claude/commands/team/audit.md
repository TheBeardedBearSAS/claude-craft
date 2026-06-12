---
description: Équipe d'Audit Complet - Audit multi-technologie parallèle utilisant les Agent Teams
argument-hint: "[--techs=auto|tech1,tech2] [--max-workers=4]"
---

# Équipe d'Audit Complet - Audit Multi-Technologie Parallèle

Orchestrer un audit complet parallèle sur plusieurs stacks technologiques en utilisant les Claude Code Agent Teams (v2.1.32+). Lance un agent leader (opus) plus N workers stack-auditor (haiku), un par stack technologique détectée, jusqu'à un maximum configurable.

## Arguments

$ARGUMENTS

- `--techs=auto` : Auto-détection des technologies (par défaut). Ou spécifier en séparant par des virgules : `--techs=symfony,react`
- `--max-workers=4` : Nombre maximum de workers auditeurs en parallèle (par défaut : 4, max : 4)
- `--output-dir=<path>` : Répertoire de sortie personnalisé pour les résultats d'audit
- `--max-cost=<dollars>` : Budget maximum en dollars. Si le coût parallèle estimé dépasse ce seuil, l'exécution est bloquée avec un message OVER BUDGET
- `--dry-run` : Afficher la composition de l'équipe et le coût estimé sans exécuter
- `--skip-aggregation` : Sortir les résultats par stack sans les fusionner
- `--sequential` : Exécuter les audits séquentiellement au lieu de les paralléliser (pas de surcoût Agent Teams). Utile pour les projets mono-technologie ou quand les Agent Teams ne sont pas disponibles.

## Prérequis

- Claude Code v2.1.32+ avec support Agent Teams
- Variable d'environnement `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` définie
- Projet avec 2+ stacks technologiques détectées (les projets mono-stack doivent utiliser le flag `--sequential`)
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

> ℹ️ Ces scripts sont installés automatiquement par claude-craft (`make install-agentteams` ou via l'installeur). S'ils sont absents, la commande continue en **mode dégradé** : estimation de coût manuelle et `--ralph-mode` indisponible (non bloquant).

## Garde-Fou Fast Mode (Confirmation Bloquante)

**OBLIGATOIRE** : Avant de lancer l'équipe, le leader DOIT :

1. Détecter si le Fast Mode est actif (indicateur lightning bolt dans le terminal)
2. Si Fast Mode actif :
   - Afficher le dashboard comparatif standard vs fast via `cost-estimator.sh --fast-mode`
   - **Afficher un avertissement bloquant** avec les coûts comparés :
     ```
     ⚠️  FAST MODE DÉTECTÉ — Coûts Opus 6x plus élevés !

     | Mode     | Input ($/M) | Output ($/M) | Coût estimé cet audit |
     |----------|-------------|--------------|----------------------|
     | Standard | $5.00       | $25.00       | ~$X.XX               |
     | Fast     | $30.00      | $150.00      | ~$Y.YY               |

     Voulez-vous continuer en Fast Mode ? (oui/non)
     Recommandation : tapez /fast pour désactiver avant de continuer.
     ```
   - **Attendre la confirmation explicite** de l'utilisateur avant de poursuivre
   - Si l'utilisateur refuse, abandonner avec un message suggérant `/fast` pour désactiver

## Quand utiliser (vs. Audit Séquentiel)

| Condition | Utiliser Team Audit | Utiliser le flag `--sequential` |
|-----------|--------------------|---------------------------------|
| 1 stack technologique | Non | Oui |
| 2+ stacks technologiques | Oui | Aussi valide (plus simple, moins cher) |
| Sensible au temps | Oui (accélération 2-3x) | Non |
| Budget contraint | Non (+20-35% surcoût en tokens) | Oui |

**Seuil de rentabilité** : Les bénéfices de la parallélisation apparaissent à partir de 2+ stacks. Pour un seul stack, le surcoût de coordination dépasse le temps économisé.

## Processus

### Étape 1 : Détection des technologies

```
Leader d'Audit (opus)
  |
  v
Scan du répertoire racine pour les marqueurs technologiques :
  composer.json + symfony/*      -> Symfony
  pubspec.yaml + flutter:        -> Flutter
  pyproject.toml / requirements  -> Python
  package.json + react           -> React
  package.json + react-native    -> React Native
  package.json + @angular/core   -> Angular
  package.json + vue             -> Vue.js
  artisan + laravel/*            -> Laravel
  *.csproj + dotnet              -> C#/.NET
  composer.json (sans symfony)   -> PHP
```

Si `--techs=auto`, détecter tout. Si explicite, valider que les stacks spécifiées existent.

**Porte de décision** : Si seulement 1 technologie détectée, basculer en mode séquentiel via `--sequential` (pas besoin de surcoût d'équipe).

### Étape 2 : Vérification de compatibilité

Avant de lancer les workers, valider chaque agent auditeur par rapport aux exigences du rôle :

```bash
# Pour chaque stack détectée, vérifier que l'agent reviewer a les outils requis
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash \
  --require-model haiku
```

Si un agent échoue à la compatibilité, enregistrer un avertissement et exclure ce stack de l'exécution parallèle (repli sur traitement séquentiel par le leader).

### Étape 3 : Estimation des coûts

Avant de lancer l'équipe, estimer les coûts en tokens :

```bash
Tools/AgentTeams/lib/cost-estimator.sh \
  --team-size <N+1> \
  --lead-model opus \
  --worker-model haiku \
  --task-type audit \
  --stacks <detected_count>
```

Afficher le coût estimé à l'utilisateur. En mode `--dry-run`, s'arrêter ici.

**Garde-fou budget** : Si `--max-cost` est spécifié, vérifier que `PAR_COST <= max_cost`. Si le coût estimé dépasse le budget :
- Afficher `OVER BUDGET: coût estimé $X.XX > budget $Y.YY`
- Abandonner l'exécution (ne PAS lancer les workers)
- Suggérer de réduire le nombre de stacks ou d'utiliser `--sequential`

### Étape 4 : Lancement de l'équipe (Fan-Out)

```
Leader d'Audit (opus) — coordonne via TaskCreate/SendMessage
  |
  +-- [Workers Parallèles - max 4] --------+
  |   stack-auditor-1 (haiku): Symfony      |
  |   stack-auditor-2 (haiku): React        |
  |   stack-auditor-3 (haiku): Python       |
  |   stack-auditor-4 (haiku): Angular      |
  +----------------------------------------+
```

**Pattern de création d'équipe :**

1. Le leader crée des répertoires de sortie isolés par worker (un par stack)
2. Le leader crée des tâches via `TaskCreate` pour chaque audit de stack :
   - Sujet de la tâche : `Auditer le stack <TechName>`
   - Description de la tâche : inclut les instructions check-architecture, check-code-quality, check-testing, check-security, check-compliance
   - Chaque tâche spécifie son chemin de sortie isolé
3. Les workers récupèrent les tâches via `TaskUpdate` (status: in_progress)
4. Les workers écrivent les résultats uniquement dans leur répertoire isolé

**Contexte lean par worker (A4)** : Chaque worker ne reçoit que la référence technologique de son stack. Ne PAS charger le contexte de toutes les technologies.
- Worker Symfony → `@.claude/references/symfony/CLAUDE.md` uniquement
- Worker React → `@.claude/references/react/` uniquement
- Worker Python → `@.claude/references/python/` uniquement
- etc.

**Template de spawn structuré (TaskCreate)** : Le leader DOIT inclure dans chaque `TaskCreate` :

```
Subject: "Auditer le stack <TechName>"
Description:
  Projet: <nom-du-projet>
  Technologie: <tech-name>
  Service Docker: <docker-service-name>
  Répertoire racine: <tech-root-directory>
  Référence: @.claude/references/<tech>/CLAUDE.md
  Checks: [architecture, code-quality, testing, security]
  Format de sortie: result.json dans <output-dir>/<tech>/
  Schema output:
    { "tech": "<tech>", "score": <0-100>,
      "architecture": { "score": <0-25>, "findings": [...] },
      "code_quality": { "score": <0-25>, "findings": [...] },
      "testing": { "score": <0-25>, "findings": [...] },
      "security": { "score": <0-25>, "findings": [...] } }
activeForm: "Audit <TechName>"
```

**Instructions des workers** (par stack) :

Chaque worker exécute les 4 catégories d'audit séquentiellement dans son stack :

| Catégorie | Points | Quoi vérifier |
|-----------|--------|---------------|
| Architecture (25pts) | Séparation des couches, direction des dépendances, conventions de dossiers, pas de couplage framework |
| Qualité du Code (25pts) | Standards de nommage, linting, indications de types, documentation, complexité < 10 |
| Tests (25pts) | Couverture >= 80%, tests unitaires, tests d'intégration, tests E2E, pyramide de tests |
| Sécurité (25pts) | Pas de secrets, validation des entrées, OWASP, chiffrement, CVE des dépendances |

Les workers exécutent des commandes de diagnostic basées sur Docker par stack :

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text
docker compose exec php composer audit

# React
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
docker compose exec node npm audit

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov
docker compose exec app pip-audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

Chaque worker écrit un `result.json` dans son répertoire de sortie isolé :

```json
{
  "tech": "symfony",
  "score": 82,
  "architecture": { "score": 22, "findings": [...] },
  "code_quality": { "score": 20, "findings": [...] },
  "testing": { "score": 18, "findings": [...] },
  "security": { "score": 22, "findings": [...] }
}
```

**Verbosité des messages de completion (B4)** : Les workers DOIVENT limiter leurs messages de completion à < 50 tokens. Écrire les détails dans le fichier `result.json`, pas dans le message. Format : `DONE: <tech> <score>/100 | <findings_count> findings`

### Étape 5 : Barrière de synchronisation

Le leader attend que toutes les tâches des workers atteignent le statut `completed` via le polling `TaskList`.

**Cadence de polling (B5)** : `TaskList` toutes les 30 secondes. Après 3 polls consécutifs sans changement de statut, réduire à 60 secondes. Utiliser les hooks `TeammateIdle`/`TaskCompleted` (v2.1.33+) pour une notification plus réactive si disponibles.

Si un worker dépasse son timeout (5 minutes par stack), le leader le marque comme échoué et poursuit avec les résultats partiels.

**Récupération du contexte leader (A6)** : Pour mitiger le bug de context compaction (#23620), le leader DOIT relire `TaskList` toutes les 5 completions de workers pour rafraîchir sa conscience de l'état de l'équipe. Si une période d'inactivité prolongée (>3 min sans mise à jour) est détectée, forcer un re-read complet de `TaskList`.

### Étape 6 : Agrégation des résultats

Le leader exécute l'agrégateur de résultats :

```bash
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir <isolated-output-root> \
  --output-file audit-report.json
```

L'agrégateur :
- Collecte tous les fichiers `result.json` des répertoires isolés
- Déduplique les findings (même fichier + même message = doublon)
- Résout les conflits de scores par moyenne pondérée
- Produit un rapport unifié

### Étape 7 : Génération du rapport

Le leader génère le rapport d'audit multi-technologie formaté :

```
================================================================
AUDIT MULTI-TECHNOLOGIE (Agent Teams) - Score Global : XX/100
================================================================

Technologies détectées : [liste]
Taille de l'équipe : 1 leader + N workers
Mode d'exécution : Parallèle
Date : AAAA-MM-JJ

----------------------------------------------------------------
SYMFONY - Score : XX/100
----------------------------------------------------------------

Architecture (XX/25)
  [PASS] Clean Architecture respectée
  [PASS] CQRS implémenté correctement
  [WARN] 2 services accèdent directement au Repository

Qualité du Code (XX/25)
  [PASS] PHPStan niveau 8 - 0 erreurs
  [WARN] 5 méthodes > 20 lignes

Tests (XX/25)
  [PASS] Couverture : 85%
  [WARN] Pas de tests E2E Panther

Sécurité (XX/25)
  [PASS] Pas de secrets dans le code
  [WARN] Dépendance avec CVE mineure

----------------------------------------------------------------
REACT - Score : XX/100
----------------------------------------------------------------

[Même structure par technologie]

================================================================
RÉSUMÉ GLOBAL
================================================================

| Technologie | Architecture | Code | Tests | Sécurité | Total |
|-------------|-------------|------|-------|----------|-------|
| Symfony     | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| React       | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| MOYENNE     | XX/25       | XX/25| XX/25 | XX/25    | XX/100|

================================================================
TOP 5 ACTIONS PRIORITAIRES
================================================================

1. [CRITIQUE] Description de l'action
   -> Impact : +X points | Effort : Faible/Moyen/Élevé

2. [ÉLEVÉ] Description de l'action
   -> Impact : +X points | Effort : Faible/Moyen/Élevé

================================================================
MÉTRIQUES D'EXÉCUTION
================================================================

| Métrique | Valeur |
|----------|--------|
| Temps total | Xs (vs ~Ys séquentiel) |
| Accélération | ~X.Xx |
| Tokens totaux | ~XK |
| Surcoût en tokens vs séquentiel | +XX% |
| Workers lancés | N |
| Workers terminés | N |
| Workers échoués | 0 |
```

### Étape 8 : Nettoyage

Le leader envoie un `shutdown_request` à tous les workers et nettoie les répertoires de sortie isolés (sauf si `--keep-artifacts` est spécifié).

## Règles de scoring

Règles de scoring :

| Violation | Points perdus |
|-----------|--------------|
| Pattern architectural violé | -5 |
| Couplage framework/domaine | -3 |
| Erreur critique de linting | -2 |
| Avertissement de linting | -1 |
| Méthode > 30 lignes | -1 |
| Couverture < 80% | -5 |
| Pas de tests unitaires du domaine | -5 |
| Secret dans le code | -10 |
| Vulnérabilité CVE critique | -10 |
| Vulnérabilité CVE haute | -5 |

## Attentes de performance

| Stacks | Estimation séquentielle | Estimation équipe | Accélération | Surcoût en tokens |
|--------|------------------------|-----------------:|-------------|-------------------|
| 2 | ~4 min | ~2.5 min | ~1.6x | +20% |
| 3 | ~6 min | ~3 min | ~2x | +25% |
| 4 | ~8 min | ~3.5 min | ~2.3x | +30% |
| 5+ | ~10+ min | ~4 min | ~2.5x | +35% |

**Note** : Ce sont des estimations réalistes tenant compte du surcoût de coordination (spawn d'agent ~5-10s, assignation de tâches, agrégation des résultats). Ne pas s'attendre à une accélération linéaire.

## Gestion des erreurs

| Erreur | Reprise |
|--------|---------|
| Timeout du worker (>5min) | Le leader marque comme échoué, poursuit avec les résultats partiels |
| Crash du worker | Le leader enregistre l'erreur, exclut le stack du rapport |
| Docker non disponible | Le worker signale l'erreur, le leader bascule sur une analyse du code source uniquement |
| Aucune technologie détectée | Abandon avec message explicite |
| Une seule technologie | Basculement en mode `--sequential` |
| Échec de la vérification de compatibilité | Exclusion du stack du parallèle, le leader traite séquentiellement |

## Limitations

- Maximum 4 workers parallèles (le surcoût de coordination domine au-delà)
- Le coût en tokens est ~20-35% plus élevé que le séquentiel en raison de la duplication du contexte par worker
- Nécessite Agent Teams Research Preview (l'API peut changer)
- Chaque worker charge le contexte du projet indépendamment (~10-20K tokens de surcoût chacun)
