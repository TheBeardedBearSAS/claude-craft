---
description: Équipe de Livraison - Cycle de vie complet du sprint (rédaction + implémentation) utilisant les Agent Teams
argument-hint: "<sprint-name|prd-path> [--phase=all|writing|implementation] [--max-workers=3]"
---

# Équipe de Livraison - Cycle de Vie Complet du Sprint (Rédaction + Implémentation)

Orchestrer le cycle complet du sprint en utilisant les Claude Code Agent Teams (v2.1.32+). La Phase 1 rédige les EPICs, User Stories (INVEST+3C+Gherkin) et tâches avec revue croisée. La Phase 2 les implémente en parallèle en utilisant le mapping de domaines fichiers de la Phase 1. Le même Delivery Lead (opus) orchestre les deux phases, préservant le contexte complet à travers la transition.

## Arguments

$ARGUMENTS

- `<sprint-name|prd-path>` : Nom/ID du sprint ou chemin vers le document PRD
- `--phase=all` : Phase à exécuter (par défaut : `all`). Options : `all`, `writing`, `implementation`
- `--max-workers=3` : Nombre maximum de workers parallèles par phase (par défaut : 3, max : 3)
- `--overnight` : Exécuter en mode nuit (borné, s'arrête à 6h)
- `--supervised` : Pause avant chaque story pour confirmation humaine
- `--max-stories=10` : Nombre maximum de stories à traiter (par défaut : 10)
- `--timeout=16` : Durée maximale d'exécution en heures (par défaut : 16)
- `--dry-run` : Afficher la composition de l'équipe, l'estimation de coût et les assignations de stories sans exécuter
- `--quality-threshold=6` : Score INVEST minimum pour la Phase 1 (par défaut : 6/6)
- `--max-rewrites=2` : Nombre maximum de boucles de réécriture par artefact en Phase 1 (par défaut : 2)
- `--max-cost=<dollars>` : Budget maximum en dollars. Si le coût parallèle estimé dépasse ce seuil, l'exécution est bloquée avec un message OVER BUDGET

## Garde-Fou Fast Mode (Confirmation Bloquante)

**OBLIGATOIRE** : Avant de lancer l'équipe, le Delivery Lead DOIT :

1. Détecter si le Fast Mode est actif (indicateur lightning bolt dans le terminal)
2. Si Fast Mode actif :
   - Afficher le dashboard comparatif standard vs fast via `cost-estimator.sh --fast-mode`
   - **Afficher un avertissement bloquant** avec les coûts comparés :
     ```
     ⚠️  FAST MODE DÉTECTÉ — Coûts Opus 6x plus élevés !

     | Mode     | Input ($/M) | Output ($/M) | Coût estimé cette livraison |
     |----------|-------------|--------------|----------------------------|
     | Standard | $5.00       | $25.00       | ~$X.XX                     |
     | Fast     | $30.00      | $150.00      | ~$Y.YY                     |

     Voulez-vous continuer en Fast Mode ? (oui/non)
     Recommandation : tapez /fast pour désactiver avant de continuer.
     ```
   - **Attendre la confirmation explicite** de l'utilisateur avant de poursuivre
   - Si l'utilisateur refuse, abandonner avec un message suggérant `/fast` pour désactiver

## Prérequis

- Claude Code v2.1.32+ avec support Agent Teams
- Variable d'environnement `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` définie
- PRD ou spécification technique disponible (pour la Phase 1) ou backlog sprint BMAD avec des stories `ready-for-dev` (pour la Phase 2 uniquement)
- Métadonnées du sprint dans `.bmad/sprint-status.yaml`
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible

## Quand utiliser (vs. Séquentiel ou Autres Équipes)

| Condition | Utiliser Team Delivery | Alternative |
|-----------|----------------------|-------------|
| Cycle complet (plan + code), 3+ stories | **Oui (~2.2x accélération)** | Trop lent en séquentiel |
| < 3 stories | Non | `@product-owner` + `/team:sprint --sequential` |
| Story unique | Non | `/common:ralph-run` |
| 5+ stories indépendantes | **Oui (meilleur ROI)** | Possible mais lent en séquentiel |
| Implémentation seule (stories existantes) | Utiliser `--phase=implementation` | `/team:sprint` |
| Rédaction seule (pas de code nécessaire) | Utiliser `--phase=writing` | `@product-owner` manuellement |
| Budget très contraint | Non (+30-40% surcoût en tokens) | Workflow séquentiel |
| Besoin de mapping de domaines fichiers | **Oui (intégré)** | Coordination manuelle |

**Seuil de rentabilité** : Rentable à partir de 3+ stories à rédiger ET implémenter.

## Processus

### Phase 1 : Rédaction (Qualité + Fiabilité)

#### Composition de l'équipe Phase 1

```
Delivery Lead (opus) — orchestration, validation, contexte partagé
  |
  +-- Rédacteur (sonnet)    : Crée les EPICs, US (INVEST+3C+Gherkin), tâches
  +-- Relecteur (sonnet)    : Valide la qualité (INVEST 6/6, couverture AC, testabilité, découpage)
  +-- Architecte (sonnet)   : Valide la faisabilité technique + mapping de domaines fichiers
```

#### Étape 1.1 : Validation des entrées

Le Delivery Lead valide les entrées :

1. Lire le PRD ou la spécification technique depuis le chemin fourni
2. Valider la Porte PRD (>=80%) — si le score est en dessous du seuil, abandonner avec un message explicite
3. Extraire les fonctionnalités, exigences et périmètre des critères d'acceptation
4. Estimer les coûts via `cost-estimator.sh --task-type delivery --techs <worker_count>`
5. **Garde-fou budget** : Si `--max-cost` est spécifié, vérifier que le coût estimé <= max_cost. Si dépassement : afficher `OVER BUDGET`, abandonner
6. Créer l'équipe via `TeamCreate`

#### Étape 1.2 : Lancement de l'équipe (Phase 1)

Le Lead lance 3 workers Phase 1 via l'outil `Task` :

1. **Rédacteur** (sonnet) : Instruire pour créer les EPICs et User Stories au format INVEST+3C+Gherkin
2. **Relecteur** (haiku) : Instruire pour valider la qualité selon le tableau de vérifications ci-dessous — haiku suffit pour cette tâche de classification (12x moins cher que sonnet en output)
3. **Architecte** (sonnet) : Instruire pour valider la faisabilité technique et produire les maps de domaines fichiers

**Contexte lean par worker Phase 1** : Chaque worker ne reçoit que le PRD/spec tech et la référence technologique du projet. Ne PAS charger les références de toutes les technologies.

**Template de spawn structuré Phase 1 (TaskCreate)** : Le Lead DOIT inclure dans chaque tâche :
```
Subject: "Rédiger <artefact-type> : <titre>"
Description:
  Projet: <nom-du-projet>
  Technologie: <tech-du-projet>
  PRD/Spec: <contenu ou référence>
  Artefact attendu: <EPIC|US|Tâche>
  Format: INVEST+3C+Gherkin pour les US
  Critères de succès: INVEST 6/6, ACs nominaux >= 1, alternatifs >= 2, erreur >= 2
  Référence: @.claude/references/<tech>/CLAUDE.md
activeForm: "Rédaction <artefact-type>"
```

#### Étape 1.3 : Pipeline d'artefacts

Le pipeline est séquentiel par artefact, mais **pipeliné** entre artefacts (plusieurs artefacts en cours à différentes étapes simultanément) :

```
Le Rédacteur crée → Le Relecteur valide la qualité → L'Architecte valide tech + domaines → Le Lead accepte/retourne
     ^                                                                                           |
     └──────────────── Boucle de réécriture (max 2x, retours consolidés) ────────────────────────┘
```

Le Lead coordonne via `SendMessage` :
1. Assigne un artefact au Rédacteur via une tâche
2. Quand le Rédacteur termine, envoie l'artefact au Relecteur pour validation qualité
3. Quand le Relecteur approuve, envoie à l'Architecte pour validation technique + mapping de domaines
4. Quand l'Architecte approuve, le Lead marque l'artefact comme accepté
5. Si le Relecteur OU l'Architecte rejette, le Lead consolide les retours et renvoie au Rédacteur (max `--max-rewrites` boucles)
6. Si l'artefact échoue encore après le max de réécritures, le Lead le marque comme `needs_human_review` et continue

#### Vérifications de qualité du Relecteur

| Vérification | Seuil | Source |
|-------------|-------|--------|
| Score INVEST | 6/6 | `backlog-gate.yaml` |
| AC nominaux | >= 1 | Patterns `@product-owner` |
| AC alternatifs | >= 2 | Patterns `@product-owner` |
| AC d'erreur | >= 2 | Patterns `@product-owner` |
| Format Gherkin | 100% | Validation de la porte |
| Découpage vertical | Oui | Patterns `@tech-lead` |
| Story points | 1-8 | Critère INVEST "Petit" |
| Bénéfice explicite | Oui | Critère INVEST "De Valeur" |

**Détection de fichiers partagés (B2)** : L'Architecte DOIT détecter explicitement les répertoires partagés (`**/Shared/**`, `**/Common/**`, `**/Utils/**`, `**/Helpers/**`). Les stories touchant des fichiers dans ces répertoires reçoivent automatiquement un marqueur `overlaps_with` et sont séquencées dans la même vague.

#### Sortie du mapping de domaines fichiers de l'Architecte

L'Architecte produit une map de domaines fichiers pour chaque User Story :

```yaml
US-001:
  file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  overlaps_with: []
US-002:
  file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]
  overlaps_with: []
US-003:
  file_domains: [src/Domain/User/, src/App/Auth/]
  overlaps_with: [US-001]  # → séquencée après US-001 en Phase 2
```

Cette map détermine les vagues de parallélisation en Phase 2.

#### Étape 1.4 : Porte Sprint Ready

Quand tous les artefacts sont traités, le Lead valide la Porte Sprint Ready (100%) :

1. Toutes les stories ont INVEST 6/6 (ou sont marquées `needs_human_review`)
2. La map de domaines fichiers est complète
3. Les vagues de parallélisation sont calculées
4. Le backlog du sprint est écrit dans `.bmad/sprint-status.yaml`

#### Sortie Phase 1

```
================================================================
ÉQUIPE DE LIVRAISON - Phase 1 : Résumé Rédaction
================================================================

Sprint : <sprint-name>
Date : AAAA-MM-JJ
Équipe : 1 lead + 3 rédacteurs

----------------------------------------------------------------
ARTEFACTS CRÉÉS
----------------------------------------------------------------

| Artefact | Type | INVEST | Réécritures | Statut |
|----------|------|--------|-------------|--------|
| EPIC-001 | Epic | - | 0 | ACCEPTÉ |
| US-001 | Story | 6/6 | 0 | ACCEPTÉ |
| US-002 | Story | 6/6 | 1 | ACCEPTÉ |
| US-003 | Story | 6/6 | 0 | ACCEPTÉ |
| US-004 | Story | 4/6 | 2 | REVUE_HUMAINE_REQUISE |

----------------------------------------------------------------
MAP DE DOMAINES FICHIERS
----------------------------------------------------------------

| Story | Domaines | Chevauchements |
|-------|----------|---------------|
| US-001 | src/Domain/User/, src/App/User/ | - |
| US-002 | src/Domain/Order/, src/App/Order/ | - |
| US-003 | src/Domain/User/, src/App/Auth/ | US-001 |

----------------------------------------------------------------
VAGUES DE PARALLÉLISATION
----------------------------------------------------------------

Vague 1 : [US-001, US-002] — indépendantes (0 chevauchement)
Vague 2 : [US-003]         — dépend des fichiers de US-001

----------------------------------------------------------------
MÉTRIQUES DE QUALITÉ
----------------------------------------------------------------

| Métrique | Valeur |
|----------|--------|
| Score INVEST moyen | 5.5/6 |
| Couverture AC (nom/alt/err) | 100% / 95% / 90% |
| Stories acceptées | 3/4 |
| Stories nécessitant revue | 1/4 |
| Réécritures totales | 3 |
| Chevauchements de domaines fichiers | 1 |
```

### Transition de Phase

Si `--phase=all`, le Lead effectue une transition d'équipe sécurisée :

#### Étape T.1 : Écriture du contrat de handoff

Le Lead écrit un fichier `phase-handoff.yaml` dans le répertoire de session avant de fermer la Phase 1 :

```yaml
# .bmad/phase-handoff.yaml — contrat inter-phases
handoff_version: "1.0"
timestamp: "2026-02-13T10:30:00Z"
sprint: "<sprint-name>"
phase1_status: "completed"

stories_accepted:
  - id: US-001
    invest_score: 6
    file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  - id: US-002
    invest_score: 6
    file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]

stories_needs_review:
  - id: US-004
    reason: "INVEST 4/6 après 2 réécritures"

parallelization_waves:
  - wave: 1
    stories: [US-001, US-002]
    reason: "0 chevauchement de domaines fichiers"
  - wave: 2
    stories: [US-003]
    reason: "dépend des fichiers de US-001"

phase1_metrics:
  artifacts_created: 4
  rewrites_total: 3
  avg_invest_score: 5.5
  duration_minutes: 20
```

#### Étape T.2 : Arrêt Phase 1 et lancement Phase 2

1. Envoyer `shutdown_request` au Rédacteur, Relecteur, Architecte
2. Attendre que tous les workers s'arrêtent (~30s)
3. Le Lead conserve le contexte complet de la Phase 1 via `phase-handoff.yaml`
3.5. **Récupération du contexte (A6)** : Relire `phase-handoff.yaml` pour rafraîchir l'état avant de lancer la Phase 2. Si le contexte a été compacté (bug #23620), ce re-read garantit la conscience complète des artefacts Phase 1.
4. Procéder au lancement de la Phase 2

#### Reprise après crash

Si le Lead redémarre entre les deux phases :
1. Vérifier l'existence de `.bmad/phase-handoff.yaml`
2. Si présent avec `phase1_status: completed`, reprendre directement en Phase 2
3. Utiliser les `parallelization_waves` et `file_domains` du handoff pour l'assignation
4. Si absent ou `phase1_status != completed`, relancer la Phase 1

### Phase 2 : Implémentation (Vitesse + Délégation)

#### Composition de l'équipe Phase 2

```
Delivery Lead (opus) — même leader, contexte Phase 1 préservé
  |
  +-- dev-worker-1 (sonnet) : US-001 (TDD)
  +-- dev-worker-2 (sonnet) : US-002 (TDD)
  +-- dev-worker-3 (sonnet) : US-003 (TDD)
```

#### Avantages vs team-sprint seul

1. **Map de domaines fichiers déjà calculée** — l'assignation est fiable, pas d'analyse heuristique au runtime
2. **Stories de meilleure qualité** — ACs complets, moins de retravail pendant l'implémentation
3. **Lead avec contexte complet** — meilleures décisions d'assignation
4. **Vagues pré-calculées** :
   ```
   Vague 1 : [US-001, US-002] — indépendantes (0 chevauchement)
   Vague 2 : [US-003]         — dépend des fichiers de US-001
   ```

#### Étape 2.1 : Lancement des workers

Le Lead lance les workers dev (jusqu'à `--max-workers`) et assigne les stories par vague :

1. Les stories de la Vague 1 sont assignées en parallèle (une story par worker)
2. Quand la Vague 1 est terminée, les stories de la Vague 2 sont assignées
3. Les workers libérés des stories terminées récupèrent la story suivante disponible

Le Lead crée un `TaskCreate` par story :

**Contexte lean par worker Phase 2** : Chaque worker ne reçoit que la story assignée et la référence technologique du projet. Ne PAS charger les autres stories ou le PRD complet.

**Template de spawn structuré Phase 2 (TaskCreate)** :
```
Subject: "Implémenter US-XXX : <titre de la story>"
Description:
  Projet: <nom-du-projet>
  Technologie: <tech-du-projet>
  Story: <contenu complet de la story>
  Critères d'acceptation: <ACs complets avec Gherkin>
  Domaine fichiers: <répertoires depuis phase-handoff.yaml>
  Hors-limites: <répertoires des AUTRES stories en cours>
  Commandes TDD: <commandes docker spécifiques>
  Critères de succès: Tous les tests AC passent, lint propre, couverture non réduite
  Référence: @.claude/references/<tech>/CLAUDE.md
activeForm: "Implémentation de US-XXX"
```

#### Étape 2.2 : Exécution des workers (Par Story)

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

#### Étape 2.3 : Transition de story

Quand chaque worker termine, le Lead :

1. Valide la Definition of Done (DoD) pour la story
2. Transite le statut de la story : `in-progress` -> `review`
3. Assigne la story suivante (en respectant l'ordre des vagues) au worker libéré
4. Répète jusqu'à ce qu'il ne reste plus de stories ou que les limites soient atteintes

**Checklist de validation DoD** :
- [ ] Tous les tests des critères d'acceptation passent
- [ ] Aucune nouvelle erreur de linting introduite
- [ ] La couverture de code n'a pas diminué
- [ ] Pas de secrets dans le code commité
- [ ] L'implémentation de la story correspond à la spécification technique

#### Étape 2.4 : Récupération d'erreurs

Le Lead classifie les erreurs selon le moteur de récupération Ralph :

| Niveau | Type | Action | Exemples |
|--------|------|--------|----------|
| 0 | Transitoire | Réessai automatique avec backoff | Timeout, rate limit, réseau |
| 1 | Récupérable | Auto-correction du worker + réessai | Erreurs de lint, échecs de tests, deps |
| 2 | Dégradé | Continuer avec avertissement | Docs, portes optionnelles, baisse de couverture |
| 3 | Bloqué | Escalade vers l'humain | Sécurité, architecture, auth |

**Cadence de polling (B5)** : Le Lead poll `TaskList` toutes les 30 secondes. Après 3 polls consécutifs sans changement, réduire à 60 secondes. Utiliser les hooks `TeammateIdle`/`TaskCompleted` (v2.1.33+) si disponibles.

**Verbosité des messages (B4)** : Les workers DOIVENT limiter leurs messages de completion à < 50 tokens. Format : `DONE: US-XXX tests pass, +X files`. Écrire les détails dans le résumé de la tâche.

**Récupération du contexte Lead (A6)** : Pour mitiger le bug de context compaction (#23620), le Lead DOIT relire `TaskList` toutes les 5 completions de workers. Au début de la Phase 2, relire systématiquement `phase-handoff.yaml` pour garantir la conscience complète des artefacts Phase 1.

**Détection de worker bloqué** : Si un worker n'a pas mis à jour sa tâche depuis 10 minutes, le Lead envoie un message de vérification de statut. Si pas de réponse dans les 2 minutes, le Lead marque la story comme bloquée et réassigne à un autre worker ou met en file pour revue humaine.

**Conflit de domaine fichiers détecté au runtime** : Si un worker signale un conflit de fichiers avec le périmètre d'un autre worker, le Lead arrête le worker en conflit, attend que le premier termine, puis réassigne séquentiellement.

### Intégration des Portes BMAD

| Porte | Seuil | Quand | Validé par |
|-------|-------|-------|------------|
| Porte PRD | >=80% | Avant Phase 1 | Le Lead valide l'entrée |
| Porte Backlog | INVEST 6/6 | Phase 1 — par artefact | Relecteur |
| Porte Sprint Ready | 100% | Fin de Phase 1 | Lead |
| Porte DoD Story | 100% | Phase 2 — par story | Lead après le worker |

### Étape Finale : Complétion du Sprint

Quand toutes les stories sont traitées :

1. Le Lead génère le rapport de livraison complet
2. Met à jour `.bmad/sprint-status.yaml` via le pattern single-writer
3. Envoie `shutdown_request` à tous les workers dev
4. Rapporte les métriques finales

## Sortie

### Rapport de Livraison Complet

```
================================================================
ÉQUIPE DE LIVRAISON - Rapport Complet
================================================================

Sprint : <sprint-name>
Date : AAAA-MM-JJ
Mode : Cycle de Vie Complet (Rédaction + Implémentation)
Équipe : 1 lead + 3 rédacteurs (Phase 1) + N workers dev (Phase 2)

================================================================
PHASE 1 : RÉSUMÉ RÉDACTION
================================================================

| Artefact | Type | INVEST | Réécritures | Statut |
|----------|------|--------|-------------|--------|
| US-001 | Story | 6/6 | 0 | ACCEPTÉ |
| US-002 | Story | 6/6 | 1 | ACCEPTÉ |
| US-003 | Story | 6/6 | 0 | ACCEPTÉ |

Vagues de parallélisation :
  Vague 1 : [US-001, US-002]
  Vague 2 : [US-003]

================================================================
PHASE 2 : RÉSUMÉ IMPLÉMENTATION
================================================================

| Story | Titre | Worker | Vague | Temps | DoD |
|-------|-------|--------|-------|-------|-----|
| US-001 | Fonctionnalité login | dev-1 | 1 | 12m | PASS |
| US-002 | Profil utilisateur | dev-2 | 1 | 18m | PASS |
| US-003 | Tableau de bord | dev-1 | 2 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOQUÉES
----------------------------------------------------------------

| Story | Titre | Phase | Raison | Escalade |
|-------|-------|-------|--------|----------|
| US-004 | Paiement | Rédaction | INVEST 4/6 après 2 réécritures | revue_humaine_requise |

================================================================
MÉTRIQUES D'EXÉCUTION
================================================================

| Métrique | Valeur |
|----------|--------|
| Stories rédigées | X |
| Stories implémentées | Y / Z |
| Stories bloquées | W |
| Temps Phase 1 | Xm |
| Temps Phase 2 | Ym |
| Temps total | Zm (vs ~Wm séquentiel) |
| Accélération | ~X.Xx |
| Tokens totaux | ~XK |
| Score INVEST moyen | X.X/6 |
| Workers lancés | N (Phase 1) + M (Phase 2) |
```

## Analyse des coûts

Pour 1 EPIC, 5 US, ~25 tâches :

| Métrique | Séquentiel | Team Delivery | Delta |
|----------|-----------|---------------|-------|
| Tokens Phase 1 | ~350K | ~475K | +36% |
| Tokens Phase 2 | ~500K | ~650K | +30% |
| Temps Phase 1 | ~45 min | ~20 min | -56% |
| Temps Phase 2 | ~75 min | ~35 min | -53% |
| **Temps total** | **~120 min** | **~55 min** | **~2.2x** |
| Coût total* | ~$28 | ~$17 | **-38%** |

*Économies de coût car Sonnet ($3/$15/M) gère la majorité du travail vs Opus ($15/$75/M) en mode séquentiel.

## Attentes de performance

| Workers | Stories | Est. séquentielle | Est. équipe | Accélération | Surcoût en tokens |
|---------|---------|-------------------|-------------|-------------|-------------------|
| 3 (rédaction) + 2 (impl) | 4 | ~80 min | ~40 min | ~2.0x | +30% |
| 3 (rédaction) + 2 (impl) | 6 | ~120 min | ~55 min | ~2.2x | +32% |
| 3 (rédaction) + 3 (impl) | 6 | ~120 min | ~50 min | ~2.4x | +35% |
| 3 (rédaction) + 3 (impl) | 9 | ~180 min | ~75 min | ~2.4x | +37% |

**Note** : L'accélération dépend de l'indépendance des stories et d'une complexité comparable. La transition de phase ajoute ~30s de surcoût.

## Gestion des erreurs

| Erreur | Reprise |
|--------|---------|
| Artefact invalide après max réécritures | Marquer `needs_human_review`, continuer avec l'artefact suivant |
| Timeout de l'Architecte (>5min/US) | Poursuivre avec map de domaines partielle, stories marquées `sequential-only` |
| Crash du worker Phase 1 | Le Lead réassigne au worker restant |
| Crash du worker Phase 2 | La story retourne à `ready-for-dev`, un autre worker la récupère |
| Conflit de domaine fichiers détecté à l'implémentation | Le Lead arrête le worker en conflit, séquence les stories |
| Conflit sprint-status.yaml | Pattern single-writer (Lead uniquement) |
| Échec de la Porte PRD (<80%) | Abandon avec message explicite, suggérer l'amélioration du PRD |
| Tous les workers bloqués | Le Lead escalade vers l'humain |

## Limitations

- Maximum 5 agents au total (1 lead + 3 par phase, transition entre phases ~30s)
- La qualité dépend de la qualité du PRD/spécification technique en entrée
- Le mapping de domaines fichiers est heuristique (les utilitaires partagés peuvent être manqués)
- +30-40% de surcoût en tokens vs séquentiel
- Nécessite Agent Teams Research Preview (l'API peut changer)
- Non adapté aux EPICs/US nécessitant des décisions humaines interactives en cours de processus
- La transition de phase nécessite shutdown + relancement (~30s de latence)
