# Claude Code Multi-Account Manager

Script interactif pour gérer facilement plusieurs comptes Claude Code.

## Installation

```bash
# Via Makefile (recommandé — copie aussi les dépendances)
make install-multiaccount

# Ou manuellement
cp claude-accounts.sh ~/.local/bin/claude-accounts
chmod +x ~/.local/bin/claude-accounts
```

## Utilisation

### Mode interactif (menu)

```bash
claude-accounts
```

```
╔════════════════════════════════════════════════════════════╗
║     🔐 Claude Code Multi-Account Manager                  ║
╚════════════════════════════════════════════════════════════╝

  1) 📋 Lister les profils
  2) ➕ Ajouter un profil
  3) 🗑️  Supprimer un profil
  4) 🔐 Authentifier un profil
  5) 🚀 Lancer Claude Code
  6) ⚡ Installer la fonction ccsp()
  7) 🔄 Migrer un profil legacy
  8) 📖 Aide
  q) Quitter
```

### Mode CLI (commandes directes)

```bash
# Ajouter un profil
claude-accounts add perso
claude-accounts add pro
claude-accounts add client-acme

# Lister les profils
claude-accounts list

# Authentifier un profil
claude-accounts auth perso

# Lancer avec un profil
claude-accounts run pro

# Supprimer un profil (crée un backup automatique)
claude-accounts rm client-acme

# Migrer un profil legacy vers shared/isolated
claude-accounts migrate

# Version
claude-accounts --version

# Changer la langue
claude-accounts --lang=fr list
```

## Modes de profil

| Mode | Description |
|------|-------------|
| **shared** | Partage la config `~/.claude` via symlink (défaut) |
| **isolated** | Copie indépendante de la config (isolation totale) |
| **legacy** | Ancien format sans mode — migrer avec `migrate` |

## Après installation

Le script crée automatiquement des alias dans ton `.zshrc` / `.bashrc` :

```bash
# Ces alias sont générés automatiquement
alias claude-perso="CLAUDE_CONFIG_DIR='~/.claude-profiles/perso' claude"
alias claude-pro="CLAUDE_CONFIG_DIR='~/.claude-profiles/pro' claude"
```

### Usage quotidien

```bash
# Utilise directement les alias
claude-perso      # Lance avec le compte perso
claude-pro        # Lance avec le compte pro

# Ou la fonction ccsp() (option 6 du menu)
ccsp perso
ccsp pro
```

## Structure des fichiers

```
~/.claude-profiles/
├── perso/
│   ├── .mode                  # "shared" ou "isolated"
│   ├── .credentials.json      # Token d'authentification
│   ├── config -> ~/.claude    # Symlink (mode shared)
│   ├── settings.json          # Settings spécifiques
│   └── ...
├── pro/
│   └── ...
└── client-acme/
    └── ...
```

## Commandes disponibles

| Commande | Alias | Description |
|----------|-------|-------------|
| `add <nom>` | `a` | Ajoute un nouveau profil |
| `rm <nom>` | `remove`, `delete` | Supprime un profil (avec backup) |
| `list` | `ls`, `l` | Liste tous les profils |
| `auth <nom>` | `login` | Authentifie un profil |
| `run <nom>` | `start`, `r` | Lance Claude Code avec un profil |
| `migrate` | `m` | Migre un profil legacy vers shared/isolated |
| `help` | `h`, `-h` | Affiche l'aide |
| `--version` | `-V` | Affiche la version |
| `--lang=XX` | | Langue (en, fr, es, de, pt) |

## Langues supportées

Le script est disponible en 5 langues : **en** (défaut), **fr**, **es**, **de**, **pt**.

```bash
claude-accounts --lang=fr        # Menu en français
claude-accounts --lang=es list   # Liste en espagnol
```

## Tips

### Workflow type

1. **Setup initial** : `claude-accounts` → Ajouter tes profils
2. **Auth une fois** : `claude-accounts auth perso` → Login
3. **Usage quotidien** : `claude-perso` ou `ccsp perso`

### Partager des settings entre profils

Utilise le mode **shared** (défaut) — il crée un symlink vers `~/.claude`.

Pour le mode **isolated**, tu peux créer des liens manuellement :

```bash
ln -s ~/.claude/settings.json ~/.claude-profiles/perso/settings.json
```

### Contexte projet

Tu peux aussi avoir des settings par projet dans `.claude/settings.json` à la racine de chaque repo — ils seront mergés avec les settings du profil.
