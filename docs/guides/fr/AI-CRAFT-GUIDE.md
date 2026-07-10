# Guide utilisateur AI Craft
# Framework de développement multi-IA

## Table des matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Démarrage](#démarrage)
4. [Configuration des fournisseurs](#configuration-des-fournisseurs)
5. [Serveurs MCP](#serveurs-mcp)
6. [Hooks](#hooks)
7. [Mémoire partagée](#mémoire-partagée)
8. [Migration depuis Claude Craft](#migration-depuis-claude-craft)
9. [Référence des commandes](#référence-des-commandes)
10. [Bonnes pratiques](#bonnes-pratiques)
11. [Dépannage](#dépannage)

---

## Introduction

AI Craft est un framework de développement multi-IA complet qui étend la méthodologie éprouvée de Claude Craft pour fonctionner de façon transparente avec plusieurs fournisseurs d'IA. Que vous utilisiez **Vibe (Mistral AI)**, **Codex (OpenAI)**, **OpenCode (sst/opencode)**, **Claude Code (Anthropic)** ou **Cursor CLI**, AI Craft fournit une interface unifiée pour installer les règles, agents, commandes et workflows.

> **GitHub Copilot n'est actuellement pas pris en charge** — il n'existe pas de `copilot-provider.js` dans `cli/lib/provider/`. GitHub Copilot CLI (`github.com/github/copilot-cli`) est un produit réel et distinct qui pourrait être ajouté comme futur fournisseur.

### Fonctionnalités clés

- ✅ **Prise en charge multi-fournisseurs** : fonctionne avec Vibe, Codex, OpenCode, Claude Code, Cursor, et plus encore
- ✅ **Intégration MCP** : prise en charge complète du Model Context Protocol avec découverte automatique
- ✅ **Mémoire partagée** : historique de conversation et contexte partagés entre les fournisseurs
- ✅ **Système de hooks** : hooks pre/post commande et message pour chaque fournisseur
- ✅ **Rétrocompatible** : 100 % compatible avec les projets Claude Craft existants
- ✅ **Migration facile** : outil de migration automatique pour les projets Claude Craft

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Vibe      │  │   Codex      │  │    OpenCode         │  │
│  │ (Mistral)   │  │ (OpenAI)     │  │ (sst/opencode)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Claude    │  │   Cursor     │                          │
│  │ (Anthropic) │  │ (CLI)        │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shared Memory & MCP                           │
├─────────────────────────────────────────────────────────────┤
│  • Conversation History                                        │
│  • Project Context                                             │
│  • User Preferences                                           │
│  • MCP Servers (filesystem, git, process, custom)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### Installation globale

```bash
# Install AI Craft globally
npm install -g @ai-craft/core

# Verify installation
ai-craft --version
# Output: 9.0.0
```

### Installation locale (dans un projet)

```bash
# Initialize AI Craft in your project
npx @ai-craft/core init-ai-craft

# Or install to a specific directory
npx @ai-craft/core install ./my-project
```

### Depuis les sources

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/ai-craft.git
cd ai-craft

# Install dependencies
npm install

# Link globally
npm link

# Run
ai-craft --version
```

---

## Démarrage

### Démarrage rapide

```bash
# Navigate to your project
cd my-project

# Initialize AI Craft
ai-craft init-ai-craft

# List available AI providers
ai-craft providers

# Set your preferred provider
ai-craft use vibe

# Install rules for your tech stack
ai-craft install --tech=symfony
```

### Structure du projet

Après l'initialisation, votre projet aura la structure suivante :

```
my-project/
├── .ai-craft/                    # AI Craft configuration
│   ├── AI-CRAFT.md              # Main AI instructions
│   ├── ai-craft.yaml            # Configuration file
│   ├── providers/               # Provider-specific configs
│   │   ├── vibe/
│   │   │   ├── config/
│   │   │   │   └── default.yaml
│   │   │   ├── hooks/
│   │   │   │   ├── pre-execute.sh
│   │   │   │   └── post-execute.sh
│   │   │   └── mcp/
│   │   ├── codex/
│   │   ├── opencode/
│   │   ├── claude/
│   │   └── cursor/
│   ├── rules/                   # AI rules
│   ├── agents/                  # AI agents
│   ├── commands/                # Slash commands
│   ├── skills/                  # Community skills
│   ├── templates/               # Project templates
│   ├── memory/                  # Shared memory
│   │   ├── conversations/
│   │   ├── project-state.json
│   │   └── user-preferences.json
│   └── mcp/                     # Global MCP servers
└── .claude/                     # Symlink to .ai-craft/ (backward compatible)
```

### Utilisation avec différents fournisseurs

```bash
# List all available providers
ai-craft providers

# Show provider health status
ai-craft provider-status

# Set default provider for this project
ai-craft use vibe

# Override provider for a single command
ai-craft --provider=codex install ./my-project
```

---

## Configuration des fournisseurs

### Consulter la configuration

```bash
# Show current configuration
ai-craft config show

# Get a specific value
ai-craft config show | grep primary
```

### Définir la configuration

```bash
# Set default provider
ai-craft config set providers.primary vibe

# Set model routing
ai-craft config set optimization.model_routing auto

# Set memory settings
ai-craft config set memory.enabled true
```

### Configuration spécifique à un fournisseur

Chaque fournisseur possède son propre fichier de configuration à `.ai-craft/providers/<name>/config/default.yaml` :

**Exemple de configuration Vibe :**
```yaml
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem: true
    git: true
    process: true
```

**Changer les modèles d'un fournisseur :**
```yaml
model:
  default: "mistral-large-3.5"
  routing:
    architecture: "mistral-large-3.5"
    code_review: "mistral-medium-3.5"
    implementation: "mistral-medium-3.5"
    quick: "mistral-small-3.5"
```

---

## Serveurs MCP

### Qu'est-ce que le MCP ?

Le MCP (Model Context Protocol) est un standard pour connecter les modèles d'IA à des outils, des API et des sources de données. AI Craft prend en charge les serveurs MCP sur tous les fournisseurs, garantissant un accès aux outils cohérent quel que soit l'IA utilisée.

### Serveurs MCP intégrés

Chaque fournisseur est livré avec des serveurs MCP intégrés :

| Serveur | Description | Vibe | Codex | OpenCode | Claude | Cursor |
|--------|-------------|------|-------|----------|--------|--------|
| filesystem | Accès au système de fichiers | ✅ | ✅ | ✅ | ✅ | ✅ |
| git | Accès au dépôt Git | ✅ | ✅ | ✅ | ✅ | ✅ |
| process | Exécution de processus | ✅ | ❌ | ✅ | ❌ | ❌ |

### Gestion des serveurs MCP

```bash
# List all MCP servers for current provider
ai-craft mcp list

# Add a custom MCP server
ai-craft mcp add my-server --command="npx" --args="-y,@modelcontextprotocol/server-postgres" --description="PostgreSQL access"

# Start all MCP servers
ai-craft mcp start
```

### Configuration d'un serveur MCP personnalisé

Créez un fichier JSON dans `.ai-craft/providers/<name>/mcp/` ou `.ai-craft/mcp/` :

```json
{
  "name": "postgres",
  "description": "PostgreSQL database access",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  },
  "timeout": 30,
  "enabled": true,
  "auto_start": true
}
```

### Serveurs MCP courants

- `@modelcontextprotocol/server-filesystem` - Accès au système de fichiers
- `@modelcontextprotocol/server-git` - Accès au dépôt Git
- `@modelcontextprotocol/server-process` - Exécution de processus
- `@modelcontextprotocol/server-sqlite` - Accès à une base de données SQLite
- `@modelcontextprotocol/server-postgres` - Accès PostgreSQL

---

## Hooks

Les hooks vous permettent d'exécuter des scripts personnalisés avant et après les commandes de l'IA. Ils sont utiles pour :

- La validation de l'environnement
- La journalisation (logging)
- Le prétraitement personnalisé
- Le post-traitement des réponses
- La gestion des erreurs

### Types de hooks

1. **pre-execute.sh** - S'exécute avant toute exécution de commande
2. **post-execute.sh** - S'exécute après l'exécution de la commande
3. **pre-message.sh** - S'exécute avant l'envoi d'un message
4. **post-message.sh** - S'exécute après la réception d'une réponse

### Emplacement des hooks

Les hooks se trouvent à `.ai-craft/providers/<name>/hooks/` :

```
.ai-craft/
└── providers/
    └── vibe/
        └── hooks/
            ├── pre-execute.sh
            └── post-execute.sh
```

### Exemple de hook : pre-execute.sh

```bash
#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook

# Check if API key is set
if [[ -z "${MISTRAL_API_KEY:-}" ]]; then
  echo "⚠️  MISTRAL_API_KEY not set" >&2
  exit 1
fi

# Set system prompt from AI-CRAFT.md
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
  export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
fi

exit 0
```

### Créer des hooks personnalisés

1. Créez un répertoire de hooks :
```bash
mkdir -p .ai-craft/providers/vibe/hooks
```

2. Créez votre script de hook :
```bash
cat > .ai-craft/providers/vibe/hooks/pre-execute.sh << 'EOF'
#!/bin/bash
# My custom pre-execute hook
echo "Running custom pre-execute hook..."
# Add your custom logic here
exit 0
EOF
chmod +x .ai-craft/providers/vibe/hooks/pre-execute.sh
```

3. Activez le hook dans la configuration :
```yaml
# In .ai-craft/providers/vibe/config/default.yaml
hooks:
  enabled: true
  pre_command:
    - "pre-execute.sh"
    - "custom-pre-execute.sh"
  post_command:
    - "post-execute.sh"
```

---

## Mémoire partagée

AI Craft fournit un système de mémoire partagée qui permet aux différents fournisseurs de partager :

- **Conversations** : historique des messages entre fournisseurs
- **Contexte de projet** : informations partagées sur le projet
- **Préférences utilisateur** : réglages propres à l'utilisateur
- **Cache** : stockage temporaire de données

### Utilisation de la mémoire partagée

```bash
# Memory is automatically available through the AI Craft CLI
# You can access it programmatically in your scripts
```

### Accès programmatique

```javascript
import { memoryManager } from '@ai-craft/core/cli/lib/memory.js';

// Get or create a conversation
const conversation = memoryManager.getConversation('session-1', {
  provider: 'vibe',
  model: 'mistral-large-3.5'
});

// Add messages
memoryManager.addMessage('session-1', {
  role: 'user',
  content: 'Hello!'
});

// Get conversation history
const history = memoryManager.getHistory('session-1', 10);

// Set user preferences
memoryManager.setPreference('theme', 'dark');
const theme = memoryManager.getPreference('theme');

// Use cache
memoryManager.setCache('temp-data', { foo: 'bar' }, 60000); // 60s TTL
const data = memoryManager.getCache('temp-data');
```

### Structure de la mémoire

```
.ai-craft/memory/
├── conversations/           # Conversation history (JSON files)
│   ├── session-1.json
│   └── session-2.json
├── project-state.json      # Project context and state
└── user-preferences.json   # User preferences
```

---

## Migration depuis Claude Craft

AI Craft offre une migration transparente pour les projets Claude Craft.

### Migration automatique

```bash
# Navigate to your Claude Craft project
cd my-claude-craft-project

# Run the migration
npx @ai-craft/core migrate

# Or use the init command
npx @ai-craft/core init-ai-craft
```

### Ce qui est migré

| Composant | Statut de migration | Notes |
|-----------|-----------------|-------|
| `.claude/CLAUDE.md` | ✅ Migré | → `.ai-craft/AI-CRAFT.md` |
| `.claude/settings.json` | ✅ Migré | Réglages adaptés au multi-fournisseurs |
| `.claude/context.yaml` | ✅ Migré | → `.ai-craft/ai-craft.yaml` |
| `.claude/rules/` | ✅ Migré | Copié vers `.ai-craft/rules/` |
| `.claude/agents/` | ✅ Migré | Copié vers `.ai-craft/agents/` |
| `.claude/commands/` | ✅ Migré | Copié vers `.ai-craft/commands/` |
| `.claude/skills/` | ✅ Migré | Copié vers `.ai-craft/skills/` |
| `.claude/templates/` | ✅ Migré | Copié vers `.ai-craft/templates/` |
| `.claude/mcp/` | ✅ Migré | Copié vers `.ai-craft/mcp/` |
| Lien symbolique `.claude/` | ✅ Créé | Pointe vers `.ai-craft/` pour la rétrocompatibilité |

### Étapes de migration manuelle

Si vous préférez migrer manuellement :

1. Créez le répertoire `.ai-craft/`
2. Copiez tous les fichiers de `.claude/` vers `.ai-craft/`
3. Renommez `CLAUDE.md` en `AI-CRAFT.md`
4. Mettez à jour les références de `.claude/` vers `.ai-craft/`
5. Créez les répertoires spécifiques aux fournisseurs
6. Créez le lien symbolique : `ln -s .ai-craft .claude`

### Après la migration

Après la migration, vous pouvez :

```bash
# Verify the migration
ai-craft doctor

# Set your preferred provider
ai-craft use vibe

# Check provider status
ai-craft provider-status

# Start using AI Craft
npx @ai-craft/core install --tech=symfony
```

---

## Référence des commandes

### Commandes principales

| Commande | Description |
|---------|-------------|
| `ai-craft --version` | Afficher la version |
| `ai-craft --help` | Afficher l'aide |
| `ai-craft install` | Installation interactive |
| `ai-craft install <path>` | Installer dans un répertoire spécifique |
| `ai-craft install --auto` | Installation automatique (sans invites) |
| `ai-craft install --tech=<name>` | Installer pour une technologie spécifique |
| `ai-craft init-ai-craft` | Initialiser AI Craft |

### Commandes de fournisseur

| Commande | Description |
|---------|-------------|
| `ai-craft providers` | Lister tous les fournisseurs |
| `ai-craft provider-status` | Afficher l'état de santé du fournisseur |
| `ai-craft use <provider>` | Définir le fournisseur par défaut |
| `ai-craft --provider=<name> <cmd>` | Surcharger le fournisseur pour une commande |

### Commandes MCP

| Commande | Description |
|---------|-------------|
| `ai-craft mcp list` | Lister les serveurs MCP |
| `ai-craft mcp add <name> [options]` | Ajouter un serveur MCP personnalisé |
| `ai-craft mcp start` | Démarrer les serveurs MCP |

### Commandes de configuration

| Commande | Description |
|---------|-------------|
| `ai-craft config show` | Afficher la configuration |
| `ai-craft config set <key> <value>` | Définir une valeur de configuration |
| `ai-craft config edit` | Éditer la configuration dans un éditeur |

### Commandes de migration

| Commande | Description |
|---------|-------------|
| `ai-craft migrate` | Migrer un projet Claude Craft |
| `ai-craft migrate <path>` | Migrer le projet situé au chemin indiqué |

### Commandes historiques (rétrocompatibles)

Toutes les commandes Claude Craft fonctionnent toujours :

| Commande | Description |
|---------|-------------|
| `claude-craft install` | Identique à `ai-craft install` |
| `claude-craft --version` | Identique à `ai-craft --version` |
| Toutes les commandes `/workflow:*` | Fonctionnent toujours |
| Toutes les commandes `/common:*` | Fonctionnent toujours |

### Options de commande pour les serveurs MCP

| Option | Description | Exemple |
|--------|-------------|---------|
| `--command=<cmd>` | Commande à exécuter | `--command=npx` |
| `--args=<args>` | Arguments séparés par des virgules | `--args="-y,@modelcontextprotocol/server-postgres"` |
| `--description=<desc>` | Description du serveur | `--description="PostgreSQL access"` |
| `--timeout=<seconds>` | Délai d'expiration en secondes | `--timeout=30` |

### Clés de configuration

Vous pouvez définir n'importe quelle clé de configuration en notation pointée :

```bash
# Set primary provider
ai-craft config set providers.primary vibe

# Set fallback providers
ai-craft config set providers.fallback[0] codex

# Set memory settings
ai-craft config set memory.enabled true

# Set optimization settings
ai-craft config set optimization.prompt_caching true
```

---

## Bonnes pratiques

### 1. Commencer petit

Commencez avec la configuration par défaut et ajoutez des personnalisations progressivement.

### 2. Utiliser des configurations spécifiques à chaque fournisseur

Chaque fournisseur a des forces différentes. Configurez-les en conséquence :

- **Vibe** : excellent pour les tâches de code, à utiliser avec les modèles Mistral
- **Codex** : agent de code en terminal d'OpenAI, intégration GitHub approfondie
- **OpenCode** : plus de 75 fournisseurs de modèles cloud via Models.dev, backend auto-hébergé optionnel
- **Claude Code** : fiabilité éprouvée, excellent pour les tâches complexes
- **Cursor CLI** : agent terminal autonome complet, scriptable en CI/SSH

### 3. Activer les serveurs MCP progressivement

Commencez avec les serveurs MCP intégrés (filesystem, git) et ajoutez des serveurs personnalisés selon vos besoins.

### 4. Utiliser les hooks pour la validation

Créez des hooks pre-execute pour valider votre environnement avant d'exécuter des commandes IA.

### 5. Partager le contexte entre fournisseurs

Utilisez le système de mémoire partagée pour conserver le contexte lors du changement de fournisseur.

### 6. Garder la configuration sous contrôle de version

Committez vos fichiers `.ai-craft/ai-craft.yaml` et les configurations de fournisseurs dans le contrôle de version, mais excluez :

```
.ai-craft/memory/
.ai-craft/logs/
.ai-craft/mcp/*.json  # If they contain API keys
```

### 7. Mettre à jour régulièrement

AI Craft est activement développé. Mettez à jour régulièrement :

```bash
npm update -g @ai-craft/core
```

---

## Dépannage

### Problèmes courants

#### « Provider not found »

```bash
# Check installed providers
ai-craft providers

# Install missing provider
# For Vibe: npm install -g @vibe/cli
# For Codex: npm install -g @openai/codex
# For OpenCode: npm install -g opencode-ai
# For Claude Code: Follow Anthropic instructions
# For Cursor: curl https://cursor.com/install -fsS | bash
```

#### « MCP server not starting »

```bash
# MCP auto-start is not yet implemented (startAllMCPServers() is a stub
# that registers servers without spawning a process) - there is no
# .ai-craft/logs/mcp.log to check. Start servers manually for now, see
# .ai-craft/providers/MCP-README.md.

# Test server manually
npx @modelcontextprotocol/server-filesystem --help

# Check permissions
ls -la .ai-craft/providers/*/mcp/
chmod +x .ai-craft/providers/*/mcp/*.json
```

#### « Hook failed »

```bash
# Check hook logs
tail -f .ai-craft/logs/*-hooks.log

# Test hook manually
bash .ai-craft/providers/vibe/hooks/pre-execute.sh

# Fix permissions
chmod +x .ai-craft/providers/*/hooks/*.sh
```

#### « Memory not persisting »

```bash
# Check memory directory exists
ls -la .ai-craft/memory/

# Check permissions
chmod -R 755 .ai-craft/memory/
```

### Mode debug

Activer la journalisation de debug :

```bash
DEBUG=ai-craft* ai-craft providers
```

### Réinitialiser AI Craft

```bash
# Remove AI Craft directory
rm -rf .ai-craft/

# Reinitialize
npx @ai-craft/core init-ai-craft
```

### Vérifier l'environnement

```bash
# Check Node.js version (requires >= 22.0.0)
node --version

# Check npm version
npm --version

# Check AI Craft version
ai-craft --version
```

---

## Support

- **Documentation** : [https://github.com/TheBeardedBearSAS/ai-craft](https://github.com/TheBeardedBearSAS/ai-craft)
- **Issues** : [GitHub Issues](https://github.com/TheBeardedBearSAS/ai-craft/issues)
- **Discussions** : [GitHub Discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Claude Craft d'origine** : [https://github.com/TheBeardedBearSAS/claude-craft](https://github.com/TheBeardedBearSAS/claude-craft)

---

*AI Craft - Framework de développement multi-IA | Version 9.0.0 | © 2026 TheBeardedCTO*
