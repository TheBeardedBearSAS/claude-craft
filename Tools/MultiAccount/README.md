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

### Shell completion (optionnel)

```bash
# Bash
cp completions/claude-accounts.bash /etc/bash_completion.d/
# ou: source completions/claude-accounts.bash

# Zsh
cp completions/_claude-accounts ~/.zsh/completions/
```

## Utilisation

### Mode interactif (menu)

```bash
claude-accounts
```

```
  1) List profiles
  2) Add a profile
  3) Delete a profile
  4) Authenticate a profile
  5) Launch Claude Code
  6) Install ccsp() function
  7) Migrate a legacy profile
  8) Profile health check
  9) Help
  q) Quit
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

# Diagnostic des profils
claude-accounts doctor

# Sortie JSON (scripting)
claude-accounts --json list

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

## Sécurité

Les dossiers de profil sont créés avec des permissions `0700` pour protéger les tokens d'authentification. La commande `doctor` vérifie les permissions et signale les anomalies.

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

### Auto-switch par projet (`.claude-profile`)

Crée un fichier `.claude-profile` à la racine d'un repo :

```bash
echo "pro" > .claude-profile
```

Ensuite, `ccsp` (sans argument) utilisera automatiquement ce profil dans ce répertoire.

### Indicateur de profil actif

Quand tu utilises `ccsp`, la variable `CLAUDE_PROFILE_NAME` est exportée. Tu peux l'utiliser dans ton prompt :

```bash
# .bashrc / .zshrc
PS1="[\$CLAUDE_PROFILE_NAME] \$ "

# Ou avec Starship (starship.toml)
# [env_var.CLAUDE_PROFILE_NAME]
# symbol = "claude:"
```

## Structure des fichiers

```
~/.claude-profiles/
├── perso/                    (permissions 0700)
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
| `doctor` | `doc` | Vérifie la santé des profils |
| `help` | `h`, `-h` | Affiche l'aide |
| `--version` | `-V` | Affiche la version |
| `--json` | | Sortie JSON pour scripting |
| `--lang=XX` | | Langue (en, fr, es, de, pt) |

## Exit codes

| Code | Signification |
|------|---------------|
| `0` | Succès |
| `1` | Erreur générale |
| `2` | Erreur d'utilisation (commande inconnue) |
| `3` | Profil non trouvé |
| `4` | Dépendance manquante (jq) |

## Sortie JSON

Le flag `--json` produit du JSON sur stdout, utile pour le scripting :

```bash
claude-accounts --json list | jq '.profiles[] | select(.authenticated)'
claude-accounts --json --version | jq -r '.version'
```

## Langues supportées

Le script est disponible en 5 langues : **en** (défaut), **fr**, **es**, **de**, **pt**.

```bash
claude-accounts --lang=fr        # Menu en français
claude-accounts --lang=es list   # Liste en espagnol
```

## Tests

```bash
# Via Docker (recommandé)
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/MultiAccount/tests/
```

## Tips

### Workflow type

1. **Setup initial** : `claude-accounts` -> Ajouter tes profils
2. **Auth une fois** : `claude-accounts auth perso` -> Login
3. **Usage quotidien** : `claude-perso` ou `ccsp perso`

### Partager des settings entre profils

Utilise le mode **shared** (défaut) -- il crée un symlink vers `~/.claude`.

Pour le mode **isolated**, tu peux créer des liens manuellement :

```bash
ln -s ~/.claude/settings.json ~/.claude-profiles/perso/settings.json
```

### Contexte projet

Tu peux aussi avoir des settings par projet dans `.claude/settings.json` à la racine de chaque repo -- ils seront mergés avec les settings du profil.
