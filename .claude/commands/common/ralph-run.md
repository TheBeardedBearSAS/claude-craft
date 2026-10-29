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

#### Isolation des sessions et des workers parallèles

- **Session Claude explicite** : chaque session Ralph fixe son propre identifiant de conversation Claude — `claude --session-id <uuid>` à la première itération, puis `claude --resume <uuid>`. L'UUID est stocké dans `.ralph/sessions/<session>/claude_session_id`, ce qui permet à `--continue=<session>` de reprendre la bonne conversation. Ralph n'utilise plus `claude --continue`, qui reprenait « la conversation la plus récente du répertoire » (partagée entre workers, voire avec une session interactive de l'utilisateur).
- **Worktree git par worker** (mode parallèle, `lib/parallel-manager.sh`) : chaque story s'exécute dans un worktree dédié `.ralph/parallel/worktrees/<session>` sur la branche `ralph/<session>`, avec son état Ralph sous `.ralph/parallel/sessions/<session>/ralph/`. En fin de run, les modifications restantes sont commitées en `wip(ralph): <story>` sur cette branche, puis le worktree est retiré (`git worktree remove`). Si ce commit échoue, le worktree est conservé (aucune perte) et signalé dans `output.log`. Le travail se récupère en fusionnant les branches `ralph/*`.
- **Hors dépôt git** : pas de worktree ; le worker s'exécute dans le répertoire courant (avertissement affiché), l'isolation des sessions Claude restant assurée.

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

#### Limite du validateur `command` → utiliser `type: hook`

`type: command` n'exécute que les commandes qui passent la liste blanche de `Tools/Ralph/lib/dod-validator.sh` : lettres, chiffres, espace et `_ . / " ' -`. Toute commande contenant `=`, `|`, `&` ou `:` (ainsi que `;`, `>`, `$`, etc.) est rejetée avec `ERROR: Invalid command` : le critère n'est alors **jamais** validé et la boucle tourne jusqu'au circuit breaker.

| Commande rejetée | Caractère en cause |
|------------------|--------------------|
| `dotnet build /p:TreatWarningsAsErrors=true` | `:` et `=` |
| `npm test && npm run lint` | `&` |
| `pytest \| tee out.log` | `\|` |

Pour ces cas, placer la commande dans un script et la déclarer en `type: hook` :

```yaml
definition_of_done:
  checklist:
    - id: build
      type: hook
      script: ".ralph/dod/build.sh"
      required: true
```

```bash
#!/usr/bin/env bash
# .ralph/dod/build.sh — reçoit {"cwd": ..., "output": ...} en JSON sur stdin
dotnet build /p:TreatWarningsAsErrors=true || exit 2
```

Le script retourne `0` (critère validé) ou `2` (critère échoué). Clés lues par type : `command` → `command:`, `output_contains` et `file_changed` → `pattern:`, `hook` → `script:`, `human` → `prompt:`.

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

## /goal (interactif) ou Ralph (autonome/CI) ?

`/goal` est une commande native de Claude Code, tapée dans une session : ce n'est pas une option de `ralph.sh`, qui n'en propose aucune et ne génère jamais de `/goal`. Les deux outils sont complémentaires :

| Critère | `/goal` (natif) | Ralph (`ralph.sh`) |
|---------|-----------------|--------------------|
| Critère de fin | Jugement LLM : un petit modèle rapide évalue, après chaque tour, ce qui est visible dans la conversation — il ne lance aucune commande et ne lit aucun fichier | Déterministe : commandes, patterns et hooks exécutés par `dod-validator.sh` |
| Plafond d'itérations | Aucun plafond fixe : fin quand la condition est atteinte ou jugée impossible, sur `/goal clear`, ou si Claude enchaîne plusieurs tours sans outil ; une borne peut être écrite dans la condition | `max_iterations` + circuit breaker adaptatif |
| Headless / CI | `claude -p "/goal ..."` boucle jusqu'au bout en une seule invocation ; usage en CI non documenté | Conçu pour : exécution autonome (`--autonomous`, `--overnight`), dashboard `headless` |
| `disableAllHooks: true` | Indisponible : `/goal` enveloppe un Stop hook de session (idem avec `allowManagedHooksOnly`) | La boucle et la DoD tournent dans `ralph.sh` ; seule l'intégration hooks (`stop-dod-gate.sh`) est désactivée |
| Configuration | Aucune ; un seul goal par session, effacé par `/clear` | `ralph.yml` |

- **Choisir `/goal`** pour une tâche interactive dont la fin se constate dans la conversation (afficher la sortie des tests : l'évaluateur ne les lance pas).
- **Choisir Ralph** quand la fin doit être prouvée par des commandes, avec un plafond d'itérations, en autonomie ou en CI.

Référence : [documentation `/goal`](https://code.claude.com/docs/en/goal).

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
- `/workflow:implement` - Developpement sprint avec TDD
