---
description: Executer Claude en boucle continue jusqu'a completion de la tache (Ralph Wiggum v2.0)
argument-hint: <description-tache> [--auto-detect|--init|--interactive]
---

# Ralph Run - Boucle Continue d'Agent IA v2.0

Execute Claude en boucle continue jusqu'a ce que la tache soit terminee ou que les criteres Definition of Done (DoD) soient satisfaits.

## Arguments

**$ARGUMENTS**

- `<description-tache>`: La tache a accomplir par Claude
- `--auto-detect`: Detection automatique du type de projet et configuration DoD
- `--init`: Generer la configuration sans executer
- `--interactive`: Assistant de configuration interactif

## Nouvelles fonctionnalites v2.0

| Fonctionnalite | Description |
|----------------|-------------|
| **Integration Hooks** | Integration bidirectionnelle avec Claude Code 2.1.23+ |
| **Auto-Detection** | Detection automatique du type de projet (Symfony, Flutter, React, etc.) |
| **Dashboard** | Affichage temps reel avec barre de progression |
| **Export Metriques** | Metriques au format JSON et Prometheus |
| **Circuit Breaker Adaptatif** | 5 profils avec apprentissage historique |
| **Moniteur de Sante** | Detection blocage, spirale d'erreurs, gonflement contexte |
| **Templates DoD** | Templates preconfigures pour 8 technologies |

## Processus

### 1. Initialisation de session

1. **Verifier prerequis**:
   - Verifier disponibilite de Claude
   - Chercher configuration `ralph.yml`
   - Initialiser repertoire session (`.ralph/`)

2. **Detection automatique** (si `--auto-detect`):
   - Detecter type de projet (Symfony, Flutter, React, Python, .NET, Go, Rust)
   - Charger template DoD approprie
   - Configurer commandes test et lint

3. **Charger configuration**:
   - Lire `ralph.yml` ou `.claude/ralph.yml`
   - Definir iterations max, timeouts, criteres DoD
   - Initialiser hooks si actives

### 2. Boucle principale avec Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN     ║
╠═══════════════════════════════════════════════════════════════╣
║  ITERATION 8/25              ECOULE: 12:34                    ║
║  PROGRES ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  32%   ║
║                                                               ║
║  Circuit Breaker: ░░ (0/4)    Contexte: ████████░░ 78%       ║
╚═══════════════════════════════════════════════════════════════╝
```

### 3. Validation Definition of Done

Le systeme DoD valide la completion via plusieurs criteres:

| Validateur | Description |
|------------|-------------|
| `command` | Executer commande shell (tests, lint, build) |
| `output_contains` | Verifier pattern dans sortie Claude |
| `file_changed` | Verifier modification fichiers |
| `hook` | Executer hook Claude existant |
| `human` | Validation humaine interactive |

### 4. Circuit Breaker Adaptatif (v2.0)

Selection automatique du profil selon mots-cles:

| Profil | Mots-cles | Sans Modif | Erreurs | Max Iter |
|--------|-----------|------------|---------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### 5. Integration Hooks (Claude Code 2.1.23+)

```
SessionStart → session-restore.sh → Injecter contexte Ralph
     ↓
PreToolUse (once) → status-injector.sh → Injecter statut DoD
     ↓
Claude travaille...
     ↓
Stop → stop-dod-gate.sh → Bloquer si DoD non satisfait (exit 2)
```

## Exemples rapides

```bash
# Utilisation basique
ralph.sh "Implementer authentification utilisateur"

# Detection auto et generation config
ralph.sh --auto-detect --init

# Assistant de configuration interactif
ralph.sh --interactive

# Avec fichier de configuration
ralph.sh --config=ralph.yml "Corriger le bug de connexion"

# Reprendre session
ralph.sh --continue=ralph-1704067200-a1b2
```

## Configuration (v2.0)

```yaml
version: "2.0"

# Integration hooks
hooks:
  enabled: true
  mode: "advanced"  # simple ou advanced

# Auto-detection
auto_detect:
  enabled: true
  interactive: false

# Dashboard temps reel
dashboard:
  enabled: true
  mode: "full"  # simple, full, headless

# Export metriques
metrics:
  enabled: true
  format: "both"  # json, prometheus, both

# Monitoring sante
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

# Definition of Done
definition_of_done:
  checklist:
    - id: tests
      type: command
      command: "docker compose exec app vendor/bin/phpunit"
      required: true
    - id: completion
      type: output_contains
      pattern: "<promise>COMPLETE</promise>"
      required: true
```

## Templates DoD par technologie

| Technologie | Commande Test | Commande Lint |
|-------------|---------------|---------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Bonnes pratiques

1. **Utiliser auto-detect**: Laisser Ralph configurer DoD pour votre stack
2. **Description claire**: Fournir des taches specifiques et actionnables
3. **Utiliser TDD**: Ecrire les tests d'abord, laisser Ralph implementer
4. **Surveiller dashboard**: Observer la progression en temps reel
5. **Analyser metriques**: Examiner les metriques pour optimisation

## Liens

- `@ralph-conductor` - Agent pour orchestration Ralph
- `/qa:tdd` - Correction de bug en TDD
- `/sprint:dev` - Developpement sprint avec TDD
