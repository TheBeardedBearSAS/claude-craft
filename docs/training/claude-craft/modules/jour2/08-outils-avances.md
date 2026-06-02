# Module 8 : Outils Avances, Ralph et Autonomie

## Objectifs

A la fin de ce module, vous serez capable de :
- Configurer et utiliser le systeme de Hooks (24 evenements)
- Maitriser Ralph Wiggum pour la boucle IA continue
- Automatiser les sprints avec Ralph, BMAD et Agent Teams
- Utiliser Extended Thinking, MCP et MCP Tool Search
- Exploiter QA Recette pour les tests d'acceptance
- Configurer les permissions, plugins et RTK
- Comprendre Agent Teams et la coordination multi-agents

---

## 1. Systeme de Hooks (15min)

### Qu'est-ce qu'un Hook ?

Les **Hooks** sont des commandes shell qui s'executent automatiquement lors d'evenements specifiques dans Claude Code. Ils permettent d'automatiser des workflows, d'ajouter des validations et d'integrer des outils externes.

### Les 24 evenements hooks

> **Attention** : Les evenements `PreWrite`, `PostWrite`, `PreBash`, `PostBash`, `Error` et `TokenThreshold` que l'on trouve dans certaines documentations sont **faux**. Voici les 24 evenements reellement supportes (v2.1.105) :

| Event | Declencheur | Usage typique |
|-------|-------------|---------------|
| `PreToolUse` | Avant execution d'un outil | Validation, confirmation, backup |
| `PostToolUse` | Apres succes d'un outil | Lint, format, notification |
| `PostToolUseFailure` | Apres echec d'un outil | Auto-recovery, logging d'erreurs |
| `PermissionRequest` | Demande de permission | Controle d'acces automatise |
| `UserPromptSubmit` | Soumission prompt utilisateur | Transformation, validation input |
| `Stop` | Fin de reponse Claude | Cleanup, rapport de session |
| `SubagentStop` | Fin d'un sous-agent | Agregation resultats |
| `SubagentStart` | Lancement d'un sous-agent | Logging, configuration contexte |
| `Notification` | Conditions d'alerte | Alertes Slack/Teams |
| `PreCompact` | Avant compaction contexte | Sauvegarde etat, checkpoint |
| `PostCompact` | Apres compaction contexte (v2.1.76+) | Re-injection contexte critique |
| `SessionStart` | Debut/reprise de session | Initialisation environnement |
| `SessionEnd` | Fin de session | Cleanup, statistiques |
| `Setup` | Premier lancement (--init, --maintenance) | Installation dependances |
| `TeammateIdle` | Agent idle dans une equipe (v2.1.33+) | Redistribution taches |
| `TaskCompleted` | Tache terminee (v2.1.33+) | Notification, chaining |
| + 8 evenements additionnels | v2.1.47-v2.1.105 | Hooks conditionnels, lifecycle |

> **Nouveaute v2.1.105** : Le hook `PreCompact` peut **bloquer** la compaction via le code de sortie 2, permettant de controler quand la compaction se produit.

### Configuration dans settings.json

Les hooks se configurent dans `.claude/settings.json` :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "echo 'Fichier va etre modifie'"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "docker compose exec app vendor/bin/php-cs-fixer fix --quiet"
      }
    ],
    "Stop": [
      {
        "command": "echo 'Session terminee'"
      }
    ],
    "Notification": [
      {
        "command": "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"Alerte Claude\"}' $SLACK_WEBHOOK_URL"
      }
    ]
  }
}
```

### Regles importantes

| Regle | Detail |
|-------|--------|
| **Timeout** | 10 minutes maximum par hook |
| **stdout** | Affiche dans le contexte de Claude (Claude le voit) |
| **stderr** | Affiche a l'utilisateur (Claude ne le voit pas) |
| **Exit code 0** | Succes, l'action continue |
| **Exit code 2** | Bloque l'action (PreToolUse, UserPromptSubmit) |
| **Autre exit code** | Erreur non-bloquante (logged mais n'arrete pas) |
| **Matcher** | Filtre sur le nom de l'outil (ex: `Write`, `Bash`, `Edit`) |

### Matchers specifiques par evenement

Certains evenements disposent de matchers specialises :

| Event | Matchers disponibles |
|-------|---------------------|
| `Notification` | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` |
| `PreCompact` | `manual`, `auto` |
| `SessionStart` | `startup`, `resume`, `clear`, `compact` |
| `Setup` | `init`, `maintenance` |

### Prompt-based hooks (type: "prompt")

En plus des hooks shell classiques, Claude Code supporte les **prompt-based hooks** qui utilisent un LLM (Haiku) pour prendre des decisions contextuelles :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "type": "prompt",
        "prompt": "Verify this command is safe and doesn't delete important files"
      }
    ]
  }
}
```

Le LLM Haiku evalue le contexte et decide si l'action doit etre autorisee ou bloquee, offrant une validation plus intelligente qu'un simple script shell.

### Hook scripts et templates Claude-Craft 8.8.0

Claude-Craft 8.8.0 fournit des scripts de hooks pre-configures et des templates prets a l'emploi :

**Scripts pre-configures :**

| Script | Evenement | Description |
|--------|-----------|-------------|
| `post-tool-failure.sh` | `PostToolUseFailure` | Auto-recovery apres echec d'un outil |
| `pre-compact.sh` | `PreCompact` | Backup de l'etat du sprint avant compaction |
| `session-end.sh` | `SessionEnd` | Collecte de metriques et cleanup de session |

**Templates de hooks** (`.claude/templates/hooks/`) :

| Template | Description |
|----------|-------------|
| `output-filter.json` | PostToolUse pour filtrer les gros outputs (>10KB) |
| `pre-compact.json` | PreCompact pour preserver le contexte critique |

### Hooks conditionnels (v2.1.105)

Les hooks supportent desormais des conditions avancees via le champ `matcher` etendu :

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ],
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Exemple : Hook de lint automatique PHP

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "docker compose exec app vendor/bin/php-cs-fixer fix --quiet 2>/dev/null"
      },
      {
        "matcher": "Write",
        "command": "docker compose exec app vendor/bin/phpstan analyse --level=8 --no-progress 2>/dev/null"
      }
    ]
  }
}
```

### Exemple : Hook de securite (bloquer des operations)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "echo 'Validation de la commande avant execution' >&2"
      }
    ]
  }
}
```

---

## 2. Ralph Wiggum - Boucle IA Continue (15min)

### Qu'est-ce que Ralph ?

**Ralph Wiggum** est un systeme de boucle continue qui execute Claude de maniere repetee jusqu'a ce qu'une tache soit terminee. Il orchestre les iterations, verifie les criteres de completion (Definition of Done), et gere les erreurs automatiquement.

### Lancement

```bash
# Utilisation basique
/common:ralph-run "Implementer authentification utilisateur"

# Detection automatique du projet
/common:ralph-run "Corriger le bug de connexion" --auto-detect

# Mode interactif pour configurer
/common:ralph-run --interactive

# Reprendre une session
/common:ralph-run --continue=ralph-1704067200-a1b2
```

### Validateurs Definition of Done (DoD)

Le systeme DoD verifie la completion via plusieurs types de validateurs :

| Type | Description | Exemple |
|------|-------------|---------|
| `command` | Executer commande shell (tests, lint, build) | `docker compose exec app vendor/bin/phpunit` |
| `output_contains` | Verifier pattern dans sortie Claude | `<promise>COMPLETE</promise>` |
| `file_changed` | Verifier modification de fichiers | `src/Entity/User.php` |
| `hook` | Integrer avec quality-gate.sh | Hook Claude existant |
| `human` | Validation humaine interactive | Approbation manuelle |

### Circuit Breaker adaptatif

Le circuit breaker empeche les boucles infinies en adaptant les seuils selon le type de tache :

| Profil | Mots-cles | Sans Modif | Erreurs | Max Iter |
|--------|-----------|------------|---------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

### Dashboard temps reel

```
+===============================================================+
|  RALPH WIGGUM - Session: ralph-xxx           PHASE: GREEN      |
+=================================================================+
|  ITERATION 8/25              ECOULE: 12:34                     |
|  PROGRES ################..........................  32%        |
|                                                                |
|  Circuit Breaker: .. (0/4)    Contexte: ########.. 78%         |
+=================================================================+
```

### Configuration (ralph.yml)

```yaml
version: "2.0"

hooks:
  enabled: true
  mode: "advanced"

auto_detect:
  enabled: true

dashboard:
  enabled: true
  mode: "full"

circuit_breaker:
  adaptive: true
  default_profile: "medium_feature"

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

---

## 3. Sprint Automation with Ralph + BMAD (15min)

### Sprint Development avec Ralph et BMAD

Depuis la v7.0.0, l'automatisation de sprints se fait via la combinaison de **Ralph Wiggum** (boucle IA continue) et des **commandes BMAD** (`/sprint:*`, `/project:*`). L'ancien ASC (Autonomous Sprint Conductor) et `/common:ralph-sprint` ont ete retires en v6.0.0.

### Approche recommandee

```bash
# 1. Executer un sprint complet via les commandes projet
/project:run-sprint

# 2. Ou utiliser Ralph pour une story specifique
/common:ralph-run "Implement US-042: Add email validation"

# 3. Sprint parallele avec Agent Teams
/team:sprint
```

### Agent Teams pour sprints paralleles (v2.1.32+)

Avec Agent Teams, plusieurs agents peuvent travailler sur des stories independantes en parallele :

```bash
# Activer Agent Teams
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Lancer un sprint parallele via la commande team
/team:sprint
```

### Bonnes pratiques

1. **Utiliser les commandes BMAD** : `/sprint:next-story`, `/sprint:transition`, `/gate:validate-story`
2. **Ralph pour les stories individuelles** : `/common:ralph-run` avec DoD validators
3. **Agent Teams pour le parallelisme** : `/team:sprint` pour traiter plusieurs stories
4. **Quality gates** : Toujours valider avec `/gate:validate-story` avant de transitionner

---

## 4. Extended Thinking et MCP (15min)

### Extended Thinking

L'Extended Thinking permet de demander a Claude de reflechir plus profondement avant de repondre. Il existe une hierarchie de niveaux :

| Niveau | Commande | Profondeur | Usage |
|--------|----------|------------|-------|
| Basique | `think` | Reflexion standard | Questions simples |
| Approfondi | `think hard` | Reflexion approfondie | Problemes moderement complexes |
| Intense | `think harder` | Reflexion intense | Problemes complexes |
| Maximum | `ultrathink` | Reflexion maximale | Architecture, debug multi-fichiers |

#### Utilisation

Il suffit de prepender le mot-cle a n'importe quel prompt :

```
think hard Comment restructurer ce module en Clean Architecture ?

ultrathink Analyse ce bug de concurrence dans le systeme de paiement
```

#### Quand utiliser chaque niveau

| Situation | Niveau recommande |
|-----------|-------------------|
| Correction de typo, petit fix | Pas necessaire |
| Nouvelle feature standard | `think` |
| Architecture multi-modules | `think hard` |
| Debug complexe multi-fichiers | `think harder` |
| Decision architecturale critique | `ultrathink` |

### MCP (Model Context Protocol)

Le **Model Context Protocol** (MCP) est un protocole ouvert pour connecter des outils externes a Claude Code. Il permet d'etendre les capacites de Claude avec des serveurs specialises.

#### Gestion des serveurs MCP

```bash
# Commande de gestion
/mcp

# Variable d'environnement pour le timeout
export MCP_TIMEOUT=30000  # 30 secondes
```

#### Cas d'usage MCP

| Serveur MCP | Capacite ajoutee |
|-------------|-----------------|
| Base de donnees | Requetes SQL directes |
| API externe | Appels REST/GraphQL |
| Navigateur | Automatisation web (Chrome) |
| Systeme de fichiers | Acces etendu |
| Monitoring | Metriques temps reel |

#### OAuth Client Credentials (v2.1.30+)

Pour les serveurs MCP qui ne supportent pas le Dynamic Client Registration :

```bash
claude mcp add --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET slack -- npx -y @modelcontextprotocol/server-slack
```

| Flag | Description |
|------|-------------|
| `--client-id` | Client ID OAuth pour le serveur MCP |
| `--client-secret` | Client secret OAuth pour le serveur MCP |

#### Configuration MCP

Les serveurs MCP se configurent dans `.claude/settings.json` :

```json
{
  "mcpServers": {
    "database": {
      "command": "mcp-server-sqlite",
      "args": ["--db", "app.db"]
    },
    "browser": {
      "command": "mcp-server-chrome",
      "args": []
    }
  }
}
```

---

## 5. QA Recette - Tests d'Acceptance Automatises (15min)

### La Regle d'Or

> **Un bug corrige ne doit JAMAIS reapparaitre.**

C'est le principe fondamental de QA Recette. Chaque erreur detectee genere automatiquement un test de regression qui sera rejoue a chaque recette future.

### Prerequis

- Extension Chrome Claude in Chrome v1.0.36+
- Claude Code lance avec `--chrome` ou `/chrome`

### Commandes

```bash
# Tester une story specifique
/qa:recette --scope=story --id=US-001

# Tester un sprint entier
/qa:recette --scope=sprint --id=Sprint-3

# Dry run (voir le plan sans executer)
/qa:recette --scope=story --id=US-001 --dry-run

# Reprendre une session interrompue
/qa:recette --resume=REC-20260130-143022

# Voir le statut d'une session
/qa:status

# Consulter les tests de regression
/qa:regression

# Generer un rapport
/qa:report --session=REC-xxx --format=markdown

# Corriger les bugs d'une session recette
/qa:fix --session=REC-20260130-143022

# Dry run : affiner et documenter sans corriger
/qa:fix --session=REC-20260130-143022 --dry-run

# Corriger uniquement les bugs critiques
/qa:fix --session=REC-20260130-143022 --severity=critical

# Generer les documents BMAD sans lancer le TDD
/qa:fix --session=REC-20260130-143022 --skip-fix
```

### Comment ca fonctionne

1. **Generation du plan** : QA Recette lit les criteres d'acceptance de la story et genere un plan de test complet
2. **Execution via Chrome** : Les tests sont executes dans un vrai navigateur via Claude in Chrome
3. **Classification des erreurs** : Chaque erreur est classifiee (visuelle, interaction, validation, logique, securite, API)
4. **Generation de regression** : Pour chaque erreur trouvee, un test de regression est automatiquement genere
5. **Rapport** : Un rapport detaille est produit avec tracabilite
6. **Correction TDD** : `/qa:fix` analyse les erreurs, genere des bug stories BMAD, et corrige chaque bug via le workflow TDD (RED → GREEN → REFACTOR)

### Categories de tests generes

| Categorie | Priorite | Description |
|-----------|----------|-------------|
| Validation criteres acceptance | Critique | Chaque critere AC teste individuellement |
| Cas limites | Haute | Conditions aux bornes |
| Scenarios d'erreur | Haute | Gestion des erreurs et recuperation |
| Verification UI/UX | Moyenne | Coherence et utilisabilite |
| Checks performance | Moyenne | Temps de chargement et reponse |
| Securite basique | Haute | XSS, CSRF, injection |

### Structure de sortie

```
.recette/
  plans/              # Plans de test (YAML)
  sessions/           # Etats de session (checkpoints)
  regression/         # Suite de regression
    registry.yaml     # Registre de tous les tests
    tests/            # Code des tests generes
  metrics/            # Donnees historiques
  reports/            # Rapports generes
```

### Session Recovery

QA Recette cree des checkpoints a chaque test. Si une session est interrompue, elle peut etre reprise exactement ou elle s'etait arretee :

```bash
# Reprendre une session interrompue
/qa:recette --resume=REC-20260130-143022
```

---

## 6. Permissions 3-tier et Plugins (15min)

### Systeme de permissions

Claude Code utilise un systeme de permissions a 3 niveaux, appliques dans cet ordre de priorite :

| Niveau | Comportement | Priorite |
|--------|-------------|----------|
| **Deny** | Interdit completement l'action | Plus haute |
| **Allow** | Autorise sans confirmation | Moyenne |
| **Ask** | Demande confirmation a chaque fois | Plus basse (defaut) |

### Configuration dans settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Write(src/**)",
      "Edit(src/**)",
      "Bash(docker compose *)",
      "Bash(*--help*)",
      "Bash(*-h*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Write(.env*)"
    ]
  }
}
```

### Wildcards supportes

| Pattern | Description | Exemple |
|---------|-------------|---------|
| `*` | N'importe quelle chaine | `Bash(*-h*)` |
| `**` | Recursif dans les chemins | `Write(src/**)` |
| Nom outil seul | Toutes utilisations | `Read` |
| `Outil(pattern)` | Usage filtre | `Bash(docker compose *)` |

### Niveaux de configuration

Les permissions se definissent a plusieurs niveaux, du plus specifique au plus general :

1. **Projet** : `.claude/settings.json` (dans le repo)
2. **Utilisateur** : `~/.claude/settings.json` (personnel)
3. **Entreprise** : `/etc/claude/settings.json` (deploiement entreprise)

Le niveau le plus specifique l'emporte.

### Systeme de plugins

Claude Code peut etre etendu via des plugins qui ajoutent de nouvelles commandes et agents.

#### Plugins LSP — Intelligence de code

Les **plugins LSP** (Language Server Protocol) donnent a Claude une comprehension structurelle du code : diagnostics automatiques apres chaque edit, navigation vers les definitions, recherche de references et informations de type.

| Stack | Plugin | Prerequis |
|-------|--------|-----------|
| PHP / Symfony / Laravel | `php-lsp` | `npm install -g intelephense` |
| Python | `pyright-lsp` | `pip install pyright` |
| TypeScript / React / Angular / Vue / RN | `typescript-lsp` | `npm install -g @vtsls/language-server typescript` |
| Flutter / Dart | `dart-analyzer` (communautaire) | Flutter SDK |
| C# / .NET | `csharp-lsp` | `dotnet tool install -g csharp-ls` |

**Installation :**
```bash
/plugins install php-lsp@claude-plugins-official
```

**Difference avec MCP :** Les plugins LSP analysent votre code (diagnostics, navigation). Les serveurs MCP connectent a des services externes (GitHub, bases de donnees).

#### Structure d'un plugin

```
.claude-plugin/
  plugin.json          # Manifeste du plugin
  commands/            # Commandes ajoutees
  agents/              # Agents specialises
  hooks/               # Scripts de hooks
```

#### Exemple de manifeste plugin.json

```json
{
  "name": "mon-plugin",
  "version": "1.0.0",
  "description": "Plugin personnalise pour mon equipe",
  "commands": [
    {
      "name": "custom:audit",
      "description": "Audit personnalise",
      "file": "commands/audit.md"
    }
  ],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "hooks/post-write.sh"
      }
    ]
  }
}
```

---

## 7. Task Management System (10min)

### Qu'est-ce que le Task Management ?

Le **Task Management System** (v2.1.19+) permet a Claude de creer, suivre et gerer des taches structurees avec dependances. C'est l'outil ideal pour les operations complexes multi-etapes.

### Les 4 outils

| Outil | Description |
|-------|-------------|
| `TaskCreate` | Creer une tache avec sujet, description et activeForm (spinner) |
| `TaskGet` | Recuperer les details complets d'une tache par son ID |
| `TaskUpdate` | Mettre a jour statut, sujet, description, dependances |
| `TaskList` | Lister toutes les taches avec leur statut et dependances |

### Cycle de vie (v2.1.20+)

```
pending → in_progress → completed
              ↓
           deleted
```

**Note (v2.1.20+)** : Le statut `deleted` permet de supprimer definitivement une tache du systeme via TaskUpdate.

### Task Tool Metrics (v2.1.30+)

Les resultats du Task tool incluent desormais des metriques d'execution :

| Metrique | Description |
|----------|-------------|
| Token count | Tokens totaux consommes par le sous-agent |
| Tool uses | Nombre d'invocations d'outils pendant l'execution |
| Duration | Duree totale d'execution de la tache |

Ces metriques permettent de monitorer le cout par tache, identifier les operations couteuses et optimiser la distribution des taches paralleles.

### Gestion des dependances

Les taches supportent `blocks` et `blockedBy` pour structurer les plans :

```json
{
  "taskId": "2",
  "addBlockedBy": ["1"]
}
```

Une tache bloquee ne peut demarrer que lorsque ses dependances sont resolues.

### Cas d'usage

- **Planification multi-etapes** : decomposer une feature en taches ordonnees
- **Suivi de progression** : visualiser l'avancement en temps reel via `TaskList`
- **Orchestration** : identifier les taches executables en parallele vs sequentiel
- **Integration Ralph** : le Sprint Conductor utilise le Task Management pour le suivi

---

## 8. File Operation Tools vs Bash (5min)

### Pourquoi preferer les outils natifs ?

Depuis la v2.1.21, Claude prefere les outils de fichiers natifs aux equivalents bash. Cette approche offre plusieurs avantages :

| Avantage | Description |
|----------|-------------|
| **Fiabilite** | Meilleure gestion des erreurs et des cas limites |
| **Performance** | Moins de latence que les commandes shell |
| **Tracabilite** | Meilleure visibilite dans les logs et hooks |
| **Securite** | Evite les injections de commandes |

### Mapping des outils

| Tache | Outil natif | Eviter |
|-------|-------------|--------|
| Lire un fichier | `Read` | `cat`, `head`, `tail` |
| Modifier un fichier | `Edit` | `sed`, `awk` |
| Ecrire un fichier | `Write` | `echo >`, `cat <<EOF` |
| Rechercher des fichiers | `Glob` | `find`, `ls` |
| Rechercher dans le contenu | `Grep` | `grep`, `rg` |

### PDF Page Range Support (v2.1.30+)

Le Read tool supporte desormais un parametre `pages` pour les fichiers PDF :

| Fonctionnalite | Description |
|----------------|-------------|
| `pages` parametre | Specifier une plage de pages (ex: `pages: "1-5"`) |
| Optimisation grands PDFs | Les PDFs >10 pages retournent une reference legere quand mentionnes via `@` |
| Max pages (v2.1.31+) | 100 pages par requete |
| Max taille (v2.1.31+) | 20MB par fichier |

**Note (v2.1.31+)** : Les system prompts ont ete renforces pour guider encore plus fortement Claude vers les outils natifs. Claude utilise desormais systematiquement `Read`, `Edit`, `Glob` et `Grep` au lieu des equivalents bash.

### Quand utiliser Bash ?

Bash reste pertinent pour :
- Operations systeme (git, docker, npm, etc.)
- Commandes composees avec pipes complexes
- Outils specifiques sans equivalent natif

---

## 9. PR Integration (5min)

### Qu'est-ce que PR Integration ?

Depuis la v2.1.27, Claude Code s'integre avec les Pull Requests GitHub, permettant de reprendre des sessions liees a des PRs et d'afficher le statut en temps reel.

### Utilisation

```bash
# Reprendre une session liee a une PR par numero
claude --from-pr 123

# Reprendre une session liee a une PR par URL
claude --from-pr https://github.com/org/repo/pull/123
```

### Auto-link

Lorsque vous creez une PR via `gh pr create` pendant une session Claude Code, la session est automatiquement liee a cette PR.

### Indicateurs de statut

Le footer de Claude Code affiche le statut de la PR liee :

| Statut | Affichage |
|--------|-----------|
| Approuvee | approved |
| En attente | pending |
| Changements demandes | changes requested |
| Brouillon | draft |
| Fusionnee | merged |

---

## 10. Background Agents et Permissions (5min)

### Permission Prompting (v2.1.20+)

Les agents en arriere-plan demandent maintenant les permissions **avant** le lancement, evitant les blocages en cours d'execution.

### Comportement

```
Launching background task: "Analyze and fix code"

This task will need permissions for:
- Read (all files)
- Edit (src/**)
- Bash (npm run lint:fix)

Approve all? [y/N/select]
```

### Options de reponse

| Option | Action |
|--------|--------|
| `y` | Approuve toutes les permissions demandees |
| `N` | Refuse et annule le lancement |
| `select` | Choisir les permissions individuellement |

### Avantages

- **Pas de blocage mid-execution** : toutes les permissions sont resolues au demarrage
- **Visibilite** : vous savez exactement ce que l'agent va faire
- **Controle granulaire** : possibilite de refuser certaines permissions

---

## 12. Personnalisation avancee (5min)

### spinnerVerbs (v2.1.23+)

Claude Code permet de personnaliser les verbes affiches pendant l'execution des outils via la propriete `activeForm` des taches et la configuration `spinnerVerbs`.

```json
{
  "spinnerVerbs": {
    "default": ["Thinking", "Processing"],
    "Edit": ["Editing", "Modifying"],
    "Bash": ["Running", "Executing"],
    "Read": ["Reading", "Loading"]
  }
}
```

Le lien avec `activeForm` dans TaskCreate permet d'afficher un texte personnalise pendant l'execution d'une tache specifique.

### Settings Enhancement (v7.26.0)

Les parametres de configuration ont ete enrichis :

```json
{
  "plansDirectory": ".claude/plans",
  "permissions": {
    "allow": [
      "Bash(npm *)", "Bash(pnpm *)", "Bash(yarn *)",
      "Bash(php *)", "Bash(flutter *)", "Bash(ng *)", "Bash(dotnet *)"
    ],
    "deny": [
      "Bash(chmod 777 *)",
      "Bash(*curl*|*sh*)",
      "Write(*credentials*)"
    ]
  }
}
```

- `plansDirectory` : repertoire dedie pour les plans generes
- Permissions etendues pour les gestionnaires de paquets multi-technologie
- Deny rules pour bloquer les operations dangereuses

---

## 11. Agent Teams (v2.1.32+ Research Preview) (10min)

### Qu'est-ce qu'Agent Teams ?

**Agent Teams** permet a plusieurs agents Claude de travailler simultanement sur des taches coordonnees. C'est un systeme de coordination multi-agents avec taches partagees.

### Activation

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### Outils disponibles

| Outil | Description |
|-------|-------------|
| `Teammate` | Creer une equipe (`spawnTeam`), nettoyer (`cleanup`) |
| `SendMessage` | Envoyer des messages entre agents (message, broadcast, shutdown) |
| `TaskCreate/Update/List/Get` | Taches partagees entre tous les agents de l'equipe |

### Fonctionnement

1. **Creer une equipe** : `Teammate.spawnTeam("mon-equipe")`
2. **Creer des taches** : `TaskCreate` pour definir les taches a realiser
3. **Lancer des coequipiers** : Spawn d'agents specialises via `Task tool` avec `team_name`
4. **Coordination** : Les agents communiquent via `SendMessage` et partagent la liste de taches
5. **Completion** : Les agents marquent les taches comme terminees et passent aux suivantes

### Modes d'affichage

| Mode | Navigation | Environnement |
|------|------------|---------------|
| In-process | `Shift+Up/Down` | Terminal standard |
| Split panes | Panneau par agent | tmux / iTerm2 |
| Delegate | `Shift+Tab` | Basculer entre agents |

### Cas d'usage

- **Refactoring parallele** : Plusieurs agents modifient des modules independants
- **Recherche + implementation** : Un agent explore, un autre implemente
- **Sprint autonome** : Plusieurs stories traitees simultanement

### Claude Opus 4.8 (v2.1.159+)

Le modele flagship le plus recent avec des capacites etendues :

| Caracteristique | Valeur |
|-----------------|--------|
| Model ID | `claude-opus-4-8` |
| Contexte | 1M tokens (GA, sans premium) |
| Output max | 128K tokens |
| Adaptive thinking | Niveaux : low, medium, high, **xhigh**, max |
| Fast Mode | NON disponible (reste exclusif a Opus 4.6) |

---

## 12bis. RTK - Optimisation des Tokens (10min)

### Qu'est-ce que RTK ?

**RTK (Rust Token Killer)** est un proxy CLI qui reduit la consommation de tokens de 60-90% sur les commandes dev. Il reecrit automatiquement les sorties des commandes en format ultra-compact.

### Installation rapide

```bash
# Commande Claude-Craft pour tout configurer
/common:setup-rtk

# Ou manuellement
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | bash
rtk init -g  # Configure le hook PreToolUse
```

### Comment ca fonctionne

RTK intercepte les commandes CLI via un hook PreToolUse et reecrit leurs sorties :

```
git status (sans RTK) → 2,000 tokens de sortie
git status (avec RTK) → 200 tokens de sortie (90% reduction)
```

### Meta-commandes RTK

```bash
rtk gain              # Voir les economies de tokens
rtk gain --history    # Historique des economies
rtk discover          # Analyser les opportunites manquees
```

### Economies attendues

| Optimisation | Economie |
|---|---|
| RTK + ultra-compact | 60-90% sur outputs CLI |
| SUBAGENT_MODEL=sonnet | 40-60% cout sub-agents |
| PostToolUse hook | Reduit pollution contexte |
| PreCompact hook | Evite perte de contexte |
| **Total combine** | **55-65% reduction globale** |

---

## 12ter. MCP Tool Search - Lazy Loading (5min)

### Le probleme des serveurs MCP

Les serveurs MCP chargent **tous** leurs outils a chaque tour, consommant ~500-2000 tokens/outil/tour de maniere permanente.

### La solution : Tool Search (v2.1.80+)

Le `ToolSearch` permet le chargement paresseux (lazy loading) des outils MCP, reduisant la consommation de contexte de **95%** :

| Approche | Cout contexte |
|----------|--------------|
| MCP classique (tous les outils charges) | ~500-2000 tokens/outil/tour |
| MCP avec Tool Search (lazy loading) | ~50 tokens au total |

### Utilisation

```
# Charger un outil specifique a la demande
ToolSearch avec query: "select:tool_name"

# Recherche par mots-cles
ToolSearch avec query: "slack send"
```

Les outils ne sont charges que quand ils sont effectivement necessaires, au lieu d'etre presents en permanence dans le contexte.

---

## Points Cles a Retenir

1. **24 Hooks** : 24 evenements supportes dont PostCompact (v2.1.76+), TeammateIdle et TaskCompleted (v2.1.33+), hooks conditionnels, PreCompact blocking (v2.1.105)
2. **Ralph Wiggum** : Boucle IA continue avec DoD validators et circuit breaker adaptatif
3. **Sprint automation** : Ralph + BMAD commands + Agent Teams pour sprints paralleles
4. **Extended Thinking** : Hierarchie `think` < `think hard` < `think harder` < `ultrathink`
5. **MCP** : Model Context Protocol pour connecter des outils externes (bases de donnees, APIs, navigateur)
6. **QA Recette** : Tests d'acceptance automatises via Chrome avec la Regle d'Or (un bug corrige ne doit jamais reapparaitre)
7. **Permissions** : Systeme 3-tier Deny > Allow > Ask avec wildcards et configuration multi-niveaux
8. **Task Management** : TaskCreate/Get/Update/List avec statut `deleted` (v2.1.20+)
9. **Hook Scripts et Templates Claude-Craft** : post-tool-failure.sh, pre-compact.sh, session-end.sh + templates dans `.claude/templates/hooks/`
10. **File Tools vs Bash** : Preferer Read/Edit/Write aux equivalents bash (v2.1.21+)
11. **PR Integration** : `--from-pr` et indicateurs de statut PR (v2.1.27+)
12. **Background Agent Permissions** : Demande des permissions avant lancement (v2.1.20+)
13. **PDF Page Range** : Parametre `pages` pour Read tool sur PDFs, ref legere >10 pages (v2.1.30+)
14. **Task Tool Metrics** : Token count, tool uses, duration dans resultats Task (v2.1.30+)
15. **OAuth MCP** : `--client-id` / `--client-secret` pour serveurs MCP sans DCR (v2.1.30+)
16. **Session Resume Hint** : Hint de reprise de session affiche a la sortie de Claude Code (v2.1.31+)
17. **PDF Limits** : Limites reelles clarifiees - max 100 pages, max 20MB (v2.1.31+)
18. **Claude Opus 4.6** : Nouveau modele flagship - 200K context (1M beta), 128K output, adaptive thinking (v2.1.32+)
19. **Agent Teams** : Coordination multi-agents avec Teammate/SendMessage, taches partagees (v2.1.32+ Research Preview)
20. **Automatic Memory** : Enregistrement auto de la memoire de session apres ~10K tokens (v2.1.32+)
21. **Skill Budget Scaling** : Budget skills = 2% de la fenetre de contexte du modele (v2.1.32+)
22. **Fast Mode** : `/fast` pour Opus 4.6 jusqu'a 2.5x plus rapide (v2.1.36+)
23. **Skills Directory Protection** : Ecritures dans `.claude/skills` bloquees en sandbox (v2.1.45+)
24. **RTK** : Proxy CLI pour 60-90% d'economie de tokens sur les commandes dev. Setup via `/common:setup-rtk`
25. **MCP Tool Search** : Lazy loading des outils MCP, 95% de reduction du cout contexte (v2.1.80+)
26. **Managed Settings** : Configuration modulaire via `managed-settings.d/` avec fusion alphabetique (v2.1.83+)
27. **Hook Templates** : Templates prets a l'emploi dans `.claude/templates/hooks/` (v7.26.0)
28. **PostCompact Hook** : Re-injection du contexte critique apres compaction (v2.1.76+)
29. **PreCompact Blocking** : `exit 2` pour bloquer la compaction automatique (v2.1.105)

---

**Duree estimee :** 1h45
**Prochain module :** Mise en Pratique Collective
