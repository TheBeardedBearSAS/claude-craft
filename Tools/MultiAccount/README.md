# Claude Code Multi-Account Manager

Script interactif pour gérer facilement plusieurs comptes Claude Code.

## Installation

```bash
# Télécharge et installe
curl -o ~/.local/bin/claude-accounts https://raw.githubusercontent.com/TheBeardedBearSAS/claude-craft/main/Tools/MultiAccount/claude-accounts.sh
chmod +x ~/.local/bin/claude-accounts

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

Que veux-tu faire ?

  1) 📋 Lister les profils
  2) ➕ Ajouter un profil
  3) 🗑️  Supprimer un profil
  4) 🔐 Authentifier un profil
  5) 🚀 Lancer Claude Code
  6) ⚡ Installer la fonction cc()
  7) 📖 Aide
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

# Supprimer un profil
claude-accounts rm client-acme
```

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

# Ou la fonction cc() (option 6 du menu)
cc perso
cc pro
```

## Structure des fichiers

```
~/.claude-profiles/
├── perso/
│   ├── .credentials.json    # Token d'authentification
│   ├── settings.json        # Settings spécifiques
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
| `rm <nom>` | `remove`, `delete` | Supprime un profil |
| `list` | `ls`, `l` | Liste tous les profils |
| `auth <nom>` | `login` | Authentifie un profil |
| `run <nom>` | `start`, `r` | Lance Claude Code avec un profil |
| `help` | `h`, `-h` | Affiche l'aide |

## Tips

### Workflow type

1. **Setup initial** : `claude-accounts` → Ajouter tes profils
2. **Auth une fois** : `claude-accounts auth perso` → Login
3. **Usage quotidien** : `claude-perso` ou `cc perso`

### Partager des settings entre profils

Si tu veux des settings communs, crée un lien symbolique :

```bash
ln -s ~/.claude/settings.json ~/.claude-profiles/perso/settings.json
ln -s ~/.claude/settings.json ~/.claude-profiles/pro/settings.json
```

### Contexte projet

Tu peux aussi avoir des settings par projet dans `.claude/settings.json` à la racine de chaque repo — ils seront mergés avec les settings du profil.
