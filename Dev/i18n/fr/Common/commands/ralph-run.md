---
description: Exécuter Claude en boucle continue jusqu'à la complétion de la tâche (Ralph Wiggum v2.0)
argument-hint: <description-tache> [--auto-detect|--init|--interactive]
---

# Ralph Run - Boucle Continue d'Agent IA v2.0

Exécuter Claude en boucle continue jusqu'à ce que la tâche soit terminée ou que les critères de Définition of Done (DoD) soient satisfaits.

## Arguments

**$ARGUMENTS**

- `<description-tache>` : La tâche à accomplir par Claude
- `--auto-detect` : Détection automatique du type de projet et configuration DoD
- `--init` : Générer la configuration sans exécuter
- `--interactive` : Assistant de configuration interactif

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Nouvelles fonctionnalités v2.0

| Fonctionnalité | Description |
|----------------|-------------|
| **Intégration Hooks** | Intégration bidirectionnelle avec Claude Code 2.1.23+ |
| **Auto-Détection** | Détection automatique du type de projet (Symfony, Flutter, React, etc.) |
| **Dashboard** | Affichage temps réel avec barre de progression |
| **Export Métriques** | Métriques au format JSON et Prometheus |
| **Circuit Breaker Adaptatif** | 5 profils avec apprentissage de l'historique |
| **Moniteur de Santé** | Détection de blocage, spirale d'erreurs et gonflement du contexte |
| **Templates DoD** | Templates préconfigurés pour 8 technologies |

## Processus

### 1. Initialisation de session

1. **Vérifier les prérequis** :
   - Vérifier la disponibilité de Claude
   - Rechercher la configuration `ralph.yml`
   - Initialiser le répertoire de session (`.ralph/`)

2. **Détection automatique du projet** (si `--auto-detect`) :
   - Détecter le type de projet (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Charger le template DoD approprié
   - Configurer les commandes de test et de lint

3. **Charger la configuration** :
   - Lire `ralph.yml` ou `.claude/ralph.yml`
   - Définir les itérations max, les timeouts, les critères DoD
   - Initialiser les hooks si activés

### 2. Boucle principale avec Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ÉCOULÉ: 12:34                    ║
║  PROGRÈS ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%   ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Contexte: ████████░░ 78%       ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Validation de la Définition of Done

Le système DoD valide la complétion à travers plusieurs critères :

| Validateur | Description |
|------------|-------------|
| `command` | Exécuter une commande shell (tests, lint, build) |
| `output_contains` | Vérifier la présence d'un pattern dans la sortie Claude |
| `file_changed` | Vérifier que des fichiers ont été modifiés |
| `hook` | Exécuter un hook Claude existant |
| `human` | Validation humaine interactive |

### 4. Circuit Breaker Adaptatif (v2.0)

Sélection automatique du profil selon les mots-clés de la tâche :

| Profil | Mots-clés | Sans Modif | Erreurs | Max Iter |
|--------|-----------|------------|---------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Intégration Hooks (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Injecter le contexte Ralph
     ↓
PreToolUse (once) → status-injector.sh → Injecter le statut DoD
     ↓
Claude travaille...
     ↓
Stop → stop-dod-gate.sh → Bloquer si DoD non satisfait (exit 2)
```

## Exemples de démarrage rapide

```bash
# Utilisation basique
ralph.sh "Implémenter l'authentification utilisateur"

# Détection automatique du projet et génération de la config
ralph.sh --auto-detect --init

# Assistant de configuration interactif
ralph.sh --interactive

# Avec fichier de configuration
ralph.sh --config=ralph.yml "Corriger le bug de connexion"

# Reprendre une session
ralph.sh --continue=ralph-1704067200-a1b2
```

## Configuration (v2.0)

```yaml
version: "2.0"

# Intégration hooks
hooks:
  enabled: true
  mode: "advanced"  # simple ou advanced

# Auto-détection
auto_detect:
  enabled: true
  interactive: false

# Dashboard temps réel
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Export métriques
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Monitoring de santé
health_monitor:
  enabled: true
  patterns:
    stall_detection: true
    error_spiral: true
    context_bloat: true

# Circuit breaker adaptatif
circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"
  learning:
    enabled: true
    min_samples: 5

# Définition of Done
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app npm test"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Templates DoD par technologie

| Technologie | Commande de test | Commande de lint |
|-------------|------------------|------------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Sortie

```
╔════════════════════════════════════════════════════════════╗
║     🔁 Ralph Wiggum - Continuous AI Agent Loop v2.0        ║
╚════════════════════════════════════════════════════════════╝

✓ Détecté : react-typescript (confiance ÉLEVÉE)
✓ Session créée : ralph-1704067200-a1b2
✓ Hooks initialisés (mode advanced)

ℹ Démarrage de la boucle Ralph...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Itération 1 sur 25 (Profil : medium_feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Invocation de Claude...
ℹ Vérification des critères DoD...
  ✓ [tests] Tous les tests passent - OK
  ✓ [lint] Aucune erreur de lint - OK
  ✓ [completion] Claude signale la complétion - OK

  Tous les critères requis sont satisfaits !

✓ DoD VALIDÉ

╔════════════════════════════════════════════════════════════╗
║     📊 Résumé de session                                    ║
╚════════════════════════════════════════════════════════════╝

  ID de session :       ralph-1704067200-a1b2
  Profil :              medium_feature
  Itérations totales :  3
  Durée :               45s
  Statut DoD :          VALIDÉ
  Raison de sortie :    dod_complete
  Métriques exportées : .ralph/sessions/.../metrics-export.json
```

## Modes d'échec et récupération

### Échecs des validateurs DoD

Lorsque les validateurs DoD échouent de manière répétée, Ralph applique une récupération progressive :

| Échecs consécutifs | Action |
|--------------------|--------|
| 1-2 | Nouvelle tentative avec contexte — Ralph inclut la sortie d'erreur précédente |
| 3 | Déclenchement de la vérification du circuit breaker — évaluer si la tâche est bloquée |
| 4+ | Circuit breaker déclenché — la session s'arrête avec `exit_reason: circuit_breaker` |

### Gestion des timeouts

| Type de timeout | Valeur par défaut | Configuration |
|-----------------|-------------------|---------------|
| Par itération | 5 min | `circuit_breaker.iteration_timeout` |
| Session totale | 30 min | `circuit_breaker.session_timeout` |
| Commande DoD | 60 sec | `definition_of_done.timeout` |

Lorsqu'un timeout se déclenche :
1. L'itération en cours est annulée
2. La progression partielle est conservée dans l'état de session
3. Le compteur du circuit breaker s'incrémente
4. Reprendre avec `--continue=<session-id>` pour réessayer

### Raisons de sortie courantes

| Raison de sortie | Signification | Récupération |
|------------------|---------------|--------------|
| `dod_complete` | Tous les critères DoD sont satisfaits | Succès — aucune action requise |
| `circuit_breaker` | Trop d'échecs | Revoir le périmètre de la tâche, simplifier le DoD |
| `max_iterations` | Limite d'itérations atteinte | Augmenter la limite ou découper en sous-tâches |
| `timeout` | Timeout de session expiré | Reprendre ou augmenter le timeout |
| `user_abort` | Annulation utilisateur (Ctrl+C) | Reprendre avec `--continue` |

## Bonnes pratiques

1. **Utiliser auto-detect** : Laisser Ralph configurer le DoD pour votre stack
2. **Description de tâche claire** : Fournir des tâches spécifiques et actionnables
3. **Utiliser TDD** : Écrire les tests en premier, laisser Ralph implémenter
4. **Surveiller le dashboard** : Observer la progression en temps réel
5. **Analyser les métriques** : Examiner les métriques de session pour optimiser
6. **Définir des timeouts réalistes** : Adapter les timeouts à la complexité de la tâche
7. **Utiliser les profils du circuit breaker** : Adapter le profil au type de tâche (quick_fix vs large_feature)

## Liens

- `@ralph-conductor` - Agent pour l'orchestration Ralph
- `/qa:tdd` - Correction de bugs basée sur le TDD
- `/sprint:dev` - Développement de sprint avec TDD
