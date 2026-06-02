# Guide de Référence des Outils

Ce guide couvre les outils utilitaires inclus avec Claude-Craft pour gérer les profils, l'affichage du statut, la configuration des projets, ainsi que les commandes et fonctionnalités de Claude Code (v8.7).

---

## Table des Matières

1. [Commandes Claude Code](#commandes-claude-code)
2. [Événements de Hook](#événements-de-hook)
3. [Frontmatter des Agents](#frontmatter-des-agents)
4. [MCP Tool Search](#mcp-tool-search)
5. [Mode Auto](#mode-auto)
6. [Templates de Hooks](#templates-de-hooks)
7. [Paramètres Gérés](#paramètres-gérés)
8. [Gestionnaire MultiAccount](#gestionnaire-multiaccount)
9. [StatusLine](#statusline)
10. [Gestionnaire ProjectConfig](#gestionnaire-projectconfig)
11. [Installation](#installation)

---

## Commandes Claude Code

Claude Code fournit des commandes intégrées pour la gestion du contexte et des sessions. Elles sont disponibles dans toute session Claude Code (v2.1.47+).

### Commandes de Gestion du Contexte

| Commande | Version | Description |
|---------|---------|-------------|
| `/clear` | Toutes | Effacer le contexte entre tâches sans lien |
| `/compact` | Toutes | Compacter le contexte de manière proactive (lancer à ~70% d'utilisation) |
| `/context` | v2.1.74+ | Obtenir des suggestions actionnables pour optimiser le contexte |
| `/effort low\|medium\|high` | v2.1.72+ | Ajuster l'effort de raisonnement du modèle selon la complexité de la tâche |
| `/memory` | v2.1.59+ | Sauvegarder des apprentissages persistants entre sessions et compactions |
| `/model haiku\|sonnet\|opus` | v2.1.72+ | Changer de modèle en cours de session selon la complexité de la tâche |

### Commandes de Session

| Commande | Version | Description |
|---------|---------|-------------|
| `/loop [intervalle] [commande]` | v2.1.71+ | Exécuter des tâches récurrentes (ex. `/loop 5m /common:pre-commit-check`) |
| `/proactive` | v2.1.105+ | Alias de `/loop` |
| `/color` | v2.1.94+ | Changer le schéma de couleurs du terminal |
| `/rename` | v2.1.94+ | Renommer la session courante |
| `/powerup` | v2.1.94+ | Activer les fonctionnalités power-up |

### Exemples d'Utilisation

```bash
# Ajuster l'effort pour une simple recherche
/effort low

# Basculer vers un modèle moins coûteux pour l'exploration
/model sonnet

# Configurer une surveillance CI récurrente
/loop 5m "Check if CI pipeline passed"

# Sauvegarder le contexte important avant une compaction
/memory "L'authentification utilise JWT avec RS256, refresh tokens dans des cookies HttpOnly"
```

---

## Événements de Hook

Claude Code supporte 24 événements de hook (8 ajoutés dans les versions récentes de Claude Code) pour automatiser les workflows :

### Tous les Événements de Hook

| Événement | Moment | Cas d'Usage |
|-------|--------|----------|
| **PreToolUse** | Avant l'exécution de l'outil | Bloquer les commandes dangereuses, réécrire avec RTK |
| **PostToolUse** | Après l'exécution de l'outil | Filtrer les sorties verbeuses, résumer les résultats |
| **PreCompact** | Avant la compaction du contexte | Sauvegarder le contexte critique ; le code de sortie 2 bloque la compaction (v2.1.105+) |
| **PostCompact** | Après la compaction du contexte | Réinjecter le contexte essentiel |
| **SessionStart** | Au démarrage d'une session | Charger les essentiels du contexte, configurer l'environnement |
| **StopFailure** | Lors d'un arrêt inattendu | Sauvegarder l'état, alerter sur les échecs |
| **Notification** | Sur les événements de notification | Alertes personnalisées |
| **TaskCreated** | Lors de la création d'une tâche sous-agent | Suivre le travail des sous-agents |
| **CwdChanged** | Changement de répertoire de travail | Mettre à jour l'environnement par répertoire |
| **FileChanged** | Modification de fichier détectée | Déclencher des rebuilds, du linting |
| **PermissionDenied** | Échec de vérification de permission | Journaliser les événements de sécurité |
| **Elicitation** | Avant le prompt utilisateur | Personnaliser le flux d'élicitation |
| **ElicitationResult** | Après la réponse utilisateur | Traiter les résultats d'élicitation |
| **Stop** | Lors de l'arrêt de la session | Nettoyage |

### Améliorations des Hooks (v8.7)

| Fonctionnalité | Description |
|---------|-------------|
| **`if` conditionnel** | Exécuter les hooks uniquement lorsqu'une condition est remplie |
| **`defer`** | Différer l'exécution du hook pour éviter le blocage |
| **Blocage PreCompact** | Le code de sortie 2 dans le hook PreCompact bloque la compaction (v2.1.105+) |

### Exemple : Filtre de Sortie PostToolUse

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '$TOOL_OUTPUT' | head -100"
      }]
    }]
  }
}
```

---

## Frontmatter des Agents

Les agents personnalisés (v2.1.78+) supportent des champs de frontmatter pour contrôler le comportement et les coûts :

```yaml
---
effort: low          # Effort de raisonnement (low/medium/high)
maxTurns: 10         # Nombre maximum de tours de conversation
disallowedTools:     # Outils que l'agent ne peut pas utiliser
  - Edit
  - Write
---
```

| Champ | Type | Description |
|-------|------|-------------|
| `effort` | string | Effort de raisonnement : `low`, `medium` ou `high` |
| `maxTurns` | number | Nombre maximum de tours avant l'arrêt |
| `disallowedTools` | liste | Outils que l'agent n'est pas autorisé à utiliser |

Utile pour créer des agents d'exploration économiques qui peuvent lire sans modifier le code.

---

## MCP Tool Search

MCP Tool Search (v2.1.80+) permet le chargement paresseux des outils MCP, réduisant la consommation de contexte de 95% :

| Approche | Coût Contexte |
|----------|-------------|
| MCP classique (tous les outils chargés) | ~500-2000 tokens/outil/tour |
| MCP avec Tool Search (chargement paresseux) | ~50 tokens au total |

### Utilisation

```bash
# Charger un outil spécifique à la demande
ToolSearch with query: "select:tool_name"

# Rechercher par mot-clé
ToolSearch with query: "slack send"
```

Au lieu de charger tous les outils du serveur MCP au démarrage, Tool Search les charge uniquement lorsque nécessaire.

---

## Mode Auto

Le Mode Auto (v2.1.94+) est un classificateur de permissions basé sur l'IA qui remplace `--dangerously-skip-permissions` de manière plus sûre :

| Mode | Protection | Vitesse | Cas d'Usage |
|------|-----------|-------|----------|
| Manuel | Maximum | Lente | Workflows audités, haute sécurité |
| Mode Auto | Élevée | Rapide | Workflows de développement de confiance |
| Skip Permissions | Minimale | Maximum | Projets locaux/personnels uniquement |

**Fonctionnalités de sécurité :**
- Un modèle de sécurité en arrière-plan évalue chaque appel d'outil
- Les opérations sûres (lectures, tests) sont auto-approuvées
- Les actions risquées (suppression massive, exfiltration) sont bloquées
- 3 blocages consécutifs reviennent au mode manuel
- 20+ blocages dans une session reviennent au mode manuel complet

Disponible pour les plans Team avec approbation administrative.

---

## Templates de Hooks

Claude-Craft fournit des templates de hooks prêts à l'emploi dans `.claude/templates/hooks/` :

| Template | Objectif |
|----------|---------|
| `output-filter.json` | Filtre PostToolUse pour les sorties CLI volumineuses |
| `pre-compact.json` | Hook PreCompact pour préserver le contexte critique |
| `context-reinject.json` | Hook SessionStart pour la réinjection du contexte après compaction |

### Installation

Copier les templates dans le `.claude/settings.json` de votre projet ou fusionner dans votre configuration de hooks :

```bash
# Voir les templates disponibles
ls .claude/templates/hooks/

# Appliquer à votre projet (fusionner manuellement dans settings.json)
cat .claude/templates/hooks/output-filter.json
```

---

## Paramètres Gérés

Le répertoire `managed-settings.d/` (v2.1.83+) permet une configuration modulaire via fusion alphabétique :

```
.claude/
  managed-settings.d/
    00-base.json          # Configuration de base
    10-security.json      # Règles de sécurité
    20-team.json          # Préférences d'équipe
```

Les fichiers sont fusionnés dans l'ordre alphabétique, permettant aux équipes de superposer des configurations sans conflits.

---

## Gestionnaire MultiAccount

Gérez plusieurs profils Claude Code pour différents comptes ou contextes.

### Objectif

- Basculer entre comptes Claude (personnel, travail, client)
- Gérer les limites de taux en changeant de profil
- Garder les contextes de projet isolés
- Partager ou isoler les configurations

### Installation

```bash
# Via Makefile
make install-multiaccount

# Ou manuellement
cp Tools/MultiAccount/claude-accounts.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-accounts.sh
```

### Utilisation

#### Mode Interactif

```bash
# Lancer le menu interactif
./claude-accounts.sh
# Ou si installé globalement
claude-accounts.sh
```

Options du menu :
```
1. Lister les profils
2. Ajouter un profil
3. Supprimer un profil
4. Authentifier un profil
5. Lancer Claude Code
6. Installer la fonction ccsp()
7. Migrer un profil legacy
8. Aide
9. Quitter
```

#### Mode CLI

```bash
# Lister tous les profils
./claude-accounts.sh list

# Ajouter un nouveau profil
./claude-accounts.sh add <nom-profil>

# Supprimer un profil
./claude-accounts.sh remove <nom-profil>

# Authentifier un profil
./claude-accounts.sh auth <nom-profil>

# Lancer Claude Code avec un profil
./claude-accounts.sh launch <nom-profil>

# Afficher l'aide
./claude-accounts.sh --help
```

### Modes de Profil

#### Mode Partagé (Par défaut)

Le profil partage la configuration avec le `~/.claude` principal :

```bash
./claude-accounts.sh add travail --mode=shared
```

- Paramètres liés par lien symbolique à `~/.claude`
- Idéal pour : basculer entre comptes en gardant les paramètres
- Cas d'usage : Gestion des limites de taux

#### Mode Isolé

Le profil a une configuration complètement indépendante :

```bash
./claude-accounts.sh add client-a --mode=isolated
```

- Copie indépendante des paramètres
- Idéal pour : travail client avec règles séparées
- Cas d'usage : Configurations de projet différentes

### Changement Rapide de Profil

Installez la fonction shell `ccsp()` :

```bash
# Ajouter au profil via l'option 6 du menu
# Ou ajouter manuellement à ~/.bashrc ou ~/.zshrc :

ccsp() {
    if [ -z "$1" ]; then
        claude-accounts.sh list
    else
        export CLAUDE_CONFIG_DIR="$HOME/.claude-profiles/$1"
        echo "Basculé vers le profil : $1"
    fi
}
```

Utilisation :
```bash
# Lister les profils
ccsp

# Basculer vers un profil
ccsp travail

# Lancer Claude Code (utilise le profil actuel)
claude
```

### Structure des Profils

```
~/.claude-profiles/
├── travail/
│   ├── .mode              # "shared" ou "isolated"
│   ├── config/            # Configuration Claude
│   └── settings.json      # Paramètres du profil
├── client-a/
│   └── ...
└── personnel/
    └── ...
```

### Support Multilingue

```bash
# Utiliser dans une langue spécifique
./claude-accounts.sh --lang=fr list
./claude-accounts.sh --lang=es add trabajo
./claude-accounts.sh --lang=de --help
```

---

## StatusLine

Affiche des informations contextuelles dans la barre de statut de Claude Code.

### Objectif

- Afficher le profil actuel
- Afficher le modèle utilisé
- Montrer la branche et le statut git
- Suivre le pourcentage d'utilisation du contexte
- Surveiller les coûts de session et hebdomadaires
- Afficher les limites d'utilisation

### Installation

```bash
# Via Makefile
make install-statusline

# Ou manuellement
cp Tools/StatusLine/statusline.sh ~/.claude/statusline.sh
cp Tools/StatusLine/statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### Configurer Claude Code

Ajouter à `~/.claude/settings.json` :

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### Format de la Status Line

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 mon-projet | 📊 45% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

| Élément | Description |
|---------|-------------|
| 🔑 pro | Nom du profil actif |
| 🧠 Opus | Modèle actuel (🧠 Opus, 🎵 Sonnet, 🍃 Haiku) |
| 🌿 main +2~1 | Branche git + statut (+staged ~modified ?untracked) |
| 📁 mon-projet | Nom du répertoire projet |
| 📊 45% | Utilisation de la fenêtre de contexte |
| ⏱️ 5h: 23% | Pourcentage d'utilisation de session (5h) |
| 📅 Sem: 45% | Pourcentage d'utilisation hebdomadaire |
| 💰 $0.42 | Coût de la session |
| 🕐 14:32 | Heure actuelle |

### Codage Couleur

Les indicateurs d'utilisation changent de couleur selon les seuils :

| Couleur | Signification | Seuil |
|---------|---------------|-------|
| Vert | Utilisation faible | < 60% |
| Jaune | Utilisation modérée | 60-80% |
| Rouge | Utilisation élevée | > 80% |

### Configuration

Éditez `~/.claude/statusline.conf` :

```bash
# =============================================================================
# LIMITES D'UTILISATION
# =============================================================================
# Valeurs recommandées par plan :
#   - Pro (20$/mois)      : SESSION=25,   WEEKLY=150
#   - Max 5x (100$/mois)  : SESSION=125,  WEEKLY=750
#   - Max 20x (200$/mois) : SESSION=500,  WEEKLY=3000

SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00

# =============================================================================
# SEUILS D'ALERTE (pourcentage)
# =============================================================================
USAGE_WARN_THRESHOLD=60    # Jaune à 60%
USAGE_CRIT_THRESHOLD=80    # Rouge à 80%

# =============================================================================
# CACHE (performance)
# =============================================================================
SESSION_CACHE_TTL=60       # Rafraîchissement session toutes les 60s
WEEKLY_CACHE_TTL=300       # Rafraîchissement hebdo toutes les 5min

# =============================================================================
# OPTIONS D'AFFICHAGE
# =============================================================================
SHOW_SESSION_LIMIT=true
SHOW_WEEKLY_LIMIT=true

# Labels personnalisés
SESSION_LABEL="⏱️ 5h"
WEEKLY_LABEL="📅 Sem"
```

### Dépendances

```bash
# Requis : jq (processeur JSON)
# macOS
brew install jq

# Linux
sudo apt install jq

# Optionnel : ccusage (suivi des coûts)
npm install -g ccusage
```

### Dépannage

**Status line ne s'affiche pas :**
```bash
# Vérifier que le script est exécutable
ls -la ~/.claude/statusline.sh

# Tester manuellement
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh
```

**Coût affiche $0.00 :**
```bash
# Vérifier que ccusage fonctionne
npx ccusage daily --json
```

**Pourcentages d'utilisation ne s'affichent pas :**
```bash
# Vérifier les fichiers de cache
ls -la /tmp/.ccusage_*

# Vider le cache pour rafraîchir
rm /tmp/.ccusage_*
```

---

## Gestionnaire ProjectConfig

Gérez les configurations de projet Claude-Craft via YAML.

### Objectif

- Définir les paramètres de projet en YAML
- Gérer plusieurs projets
- Gérer les configurations monorepo
- Valider les configurations
- Installer les règles depuis la config

### Installation

```bash
# Via Makefile
make install-projectconfig

# Ou manuellement
cp Tools/ProjectConfig/claude-projects.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-projects.sh
```

### Dépendances

```bash
# Requis : yq (processeur YAML)
# macOS
brew install yq

# Linux (snap)
sudo snap install yq

# Linux (binaire)
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Utilisation

#### Mode Interactif

```bash
./claude-projects.sh
```

Options du menu :
```
1. Lister les projets
2. Ajouter un projet
3. Éditer un projet
4. Ajouter un module
5. Supprimer un projet
6. Valider la configuration
7. Installer un projet
8. Aide
9. Quitter
```

#### Mode CLI

```bash
# Lister les projets configurés
./claude-projects.sh list

# Valider le fichier de configuration
./claude-projects.sh validate [fichier-config]

# Installer un projet spécifique
./claude-projects.sh install <nom-projet>

# Installer tous les projets
./claude-projects.sh install-all

# Afficher les détails d'un projet
./claude-projects.sh show <nom-projet>

# Ajouter un nouveau projet
./claude-projects.sh add <nom-projet> <chemin>

# Supprimer un projet
./claude-projects.sh remove <nom-projet>
```

### Fichier de Configuration

Emplacement par défaut : `./claude-projects.yaml`

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "my-saas"
    description: "SaaS platform"
    path: "~/Projects/my-saas"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "web"
        path: "frontend"
        technologies: ["react"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]

  - name: "internal-tool"
    path: "~/Projects/internal"
    technologies: ["python"]
    lang: "en"
```

### Validation

```bash
# Valider la configuration
./claude-projects.sh validate

# Ou via Makefile
make config-validate CONFIG=claude-projects.yaml
```

Vérifications de validation :
- Syntaxe YAML valide
- Champs requis présents
- Chemins existants
- Technologies valides
- Langues valides

### Installation depuis la Config

```bash
# Installer un projet unique
./claude-projects.sh install my-saas

# Ou via Makefile
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas

# Installer tous les projets
make config-install-all CONFIG=claude-projects.yaml

# Dry run
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas OPTIONS="--dry-run"
```

### Support Multilingue

```bash
# Utiliser dans une langue spécifique
./claude-projects.sh --lang=fr list
./claude-projects.sh --lang=de validate
```

---

## Installation

### Installer Tous les Outils

```bash
make install-tools
```

Ceci installe :
- Gestionnaire MultiAccount
- StatusLine
- Gestionnaire ProjectConfig

### Installer des Outils Individuels

```bash
# MultiAccount uniquement
make install-multiaccount

# StatusLine uniquement
make install-statusline

# ProjectConfig uniquement
make install-projectconfig
```

### Vérifier l'Installation

```bash
# Vérifier MultiAccount
which claude-accounts.sh
claude-accounts.sh --version

# Vérifier StatusLine
ls ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'

# Vérifier ProjectConfig
which claude-projects.sh
claude-projects.sh --version
```

---

## Référence Rapide

### Commandes MultiAccount

| Commande | Description |
|---------|-------------|
| `list` | Afficher tous les profils |
| `add <nom>` | Créer un nouveau profil |
| `remove <nom>` | Supprimer un profil |
| `auth <nom>` | Authentifier un profil |
| `launch <nom>` | Démarrer Claude avec un profil |
| `migrate` | Convertir un profil legacy |

### Éléments StatusLine

| Emoji | Signification |
|-------|---------------|
| 🔑 | Profil |
| 🧠 | Modèle Opus |
| 🎵 | Modèle Sonnet |
| 🍃 | Modèle Haiku |
| 🌿 | Branche Git |
| 📁 | Projet |
| 📊 | Contexte % |
| ⏱️ | Usage session |
| 📅 | Usage hebdo |
| 💰 | Coût |
| 🕐 | Heure |

### Commandes ProjectConfig

| Commande | Description |
|---------|-------------|
| `list` | Afficher tous les projets |
| `validate` | Vérifier la validité de la config |
| `install <nom>` | Installer les règles du projet |
| `install-all` | Installer tous les projets |
| `show <nom>` | Afficher les détails du projet |
| `add <nom> <chemin>` | Ajouter un nouveau projet |
| `remove <nom>` | Supprimer un projet |

---

[&larr; Correction de Bugs](04-bug-fixing.md) | [Dépannage &rarr;](06-troubleshooting.md)
